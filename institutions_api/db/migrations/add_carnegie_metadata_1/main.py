# This script adds IPEDS metadata to the institution table

from uuid import uuid4

from sqlalchemy import text
import pandas as pd

from institutions_api.db.db import engine
from institutions_api.db.metadata_mappings import CARNEGIE_CLASSIFICATION_MAPPING


def map_in_carnegie_data():
    """For each institution map it to a ROR and then IPEDS identifier"""

    # Load in the mapping data
    # https://github.com/opensyllabus/institution-identifiers/blob/main/latest.csv
    carnegie_df = pd.read_excel(
        "institutions_api/db/migrations/add_carnegie_metadata_1/data/CCIHE2021-PublicData.xlsx",
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
            SELECT inst.*, ii.identifier, it.name
            FROM institution inst
            LEFT JOIN institution_identifier ii on inst.id = ii.institution_id
            LEFT JOIN public.identifier_type it on ii.identifier_type_id = it.id
            WHERE it.name = 'unitid'
        """)).mappings().fetchall()

        for institute in institutes:

            carnegie_data = carnegie_by_unitid.get(institute["identifier"])

            # Add the IPEDS identifier
            if carnegie_data:

                # Check if that institution already exists
                existing_iped = conn.execute(text(f"""
                    SELECT * FROM institution_ipeds_metadata WHERE institution_id = '{institute['id']}'
                """)).fetchone()

                if not existing_iped:

                    identifier_id = conn.execute(text(f"""
                        INSERT INTO institution_identifier (
                            id, institution_id, identifier_type_id, identifier
                        ) VALUES (
                            '{uuid4()}', '{institute['id']}', '{unitid_identifier_id}', '{int(unit_id)}'
                        ) RETURNING id
                    """)).fetchone()[0]

                    ipeds_metadata = {
                        "id": uuid4(),
                        "institution_id": institute['id'],
                        "institution_identifier_id": identifier_id,
                        "website_address": carnegie_data["WEBADDR"],
                        "historically_black_college_or_university": carnegie_data["HBCU"] == 1,  # One is True, 2 is False
                        "tribal_college_or_university": carnegie_data['TRIBAL'] == 1,            # One is True, 2 is False
                        "program_length": PROGRAM_LENGTH_MAPPING[str(carnegie_data['ICLEVEL'])],
                        "control": CONTROL_MAPPING[str(carnegie_data['CONTROL'])],
                        "state": carnegie_data['STABBR'],
                        "institution_size": INSTITUTION_SIZE_MAPPING[str(carnegie_data['INSTSIZE'])]
                    }

                    conn.execute(
                        text(f"""
                            INSERT INTO institution_ipeds_metadata (
                                id, institution_id, institution_identifier_id, website_address, historically_black_college_or_university, tribal_college_or_university, program_length, control, state, institution_size
                            ) VALUES (
                                :id, :institution_id, :institution_identifier_id, :website_address, :historically_black_college_or_university, :tribal_college_or_university, :program_length, :control, :state, :institution_size
                            )
                        """), ipeds_metadata
                    )

        conn.commit()


def main():
    map_in_carnegie_data()


if __name__ == "__main__":
    main()
