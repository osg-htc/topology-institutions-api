# This script adds IPEDS metadata to the institution table

from uuid import uuid4

from sqlalchemy import text
import pandas as pd

from institutions_api.db.db import engine
from institutions_api.db.metadata_mappings import CARNEGIE_CLASSIFICATION_MAPPING


def map_in_carnegie_data():
    """For each institution map it to a ROR and then IPEDS identifier"""

    carnegie_df = pd.read_excel(
        "db/migrations/add_carnegie_metadata_1/data/CCIHE2021-PublicData.xlsx",
        sheet_name="Data"
    )
    carnegie_by_unitid = carnegie_df.set_index("unitid").to_dict(orient="index")

    with engine.connect() as conn:

        # Get the unitid identifier id
        unitid_identifier_id = conn.execute(text("""
            SELECT id FROM identifier_type WHERE name = 'unitid'
        """)).fetchone()[0]

        # Get the institutions with ROR identifiers
        institutes = conn.execute(text("""
            SELECT inst.*, ii.identifier, ii.id AS identifier_id, it.name
            FROM institution inst
            LEFT JOIN institution_identifier ii on inst.id = ii.institution_id
            LEFT JOIN public.identifier_type it on ii.identifier_type_id = it.id
            WHERE it.name = 'unitid'
        """)).mappings().fetchall()

        for institute in institutes:

            carnegie_data = carnegie_by_unitid.get(int(institute["identifier"]))

            # Add the IPEDS identifier
            if carnegie_data:

                # Check if that institution already exists
                existing_mapping = conn.execute(text(f"""
                    SELECT * FROM institution_carnegie_classification_metadata WHERE institution_id = '{institute['id']}'
                """)).fetchone()

                if not existing_mapping:

                    ipeds_metadata = {
                        "id": uuid4(),
                        "institution_id": institute['id'],
                        "institution_identifier_id": institute['identifier_id'],
                        "classification": CARNEGIE_CLASSIFICATION_MAPPING.get(str(carnegie_data["basic2021"])),
                    }

                    conn.execute(
                        text(f"""
                            INSERT INTO institution_carnegie_classification_metadata (
                                id, institution_id, institution_identifier_id, classification
                            ) VALUES (
                                :id, :institution_id, :institution_identifier_id, :classification
                            )
                        """), ipeds_metadata
                    )

        conn.commit()


def main():
    map_in_carnegie_data()


if __name__ == "__main__":
    main()
