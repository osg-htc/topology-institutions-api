# This script adds IPEDS metadata to the institution table

from uuid import uuid4

from sqlalchemy import text
import pandas as pd

from institutions_api.db.db import engine

# Mapping of IPEDS columns to database columns
IPEDS_TO_DB_MAP = {
    "WEBADDR": "website_address",
    "HBCU": "historically_black_college_or_university",
    "TRIBAL": "tribal_college_or_university",
    "ICLEVEL": "program_level",
    "CONTROL": "control",
    "STABBR": "state",
    "INSTSIZE": "institution_size"
}

PROGRAM_LENGTH_MAPPING = {
    "1": "FOUR_OR_MORE_YEARS",
    "2": "AT_LEAST_TWO_BUT_LESS_THAN_FOUR_YEARS",
    "3": "LESS_THAN_TWO_YEARS",
    "-3": "NOT_AVAILABLE"
}

CONTROL_MAPPING = {
    "1": "PUBLIC",
    "2": "PRIVATE_NONPROFIT",
    "3": "PRIVATE_FORPROFIT",
    "-3": "NOT_AVAILABLE"
}

INSTITUTION_SIZE_MAPPING = {
    "1": "UNDER_1000",
    "2": "BETWEEN_1000_AND_4999",
    "3": "BETWEEN_5000_AND_9999",
    "4": "BETWEEN_10000_AND_19999",
    "5": "OVER_20000",
    "-1": "NOT_REPORTED",
    "-2": "NOT_APPLICABLE"
}


def update_existing_tables():
    with engine.connect() as conn:

        # Check if the columns exist already
        test_institute = conn.execute(text("""SELECT * FROM institution LIMIT 1""")).mappings().fetchone()

        if "latitude" not in test_institute:

            # Add latitude and longitude to institution table
            conn.execute(text("""
                ALTER TABLE institution
                ADD COLUMN latitude FLOAT DEFAULT NULL,
                ADD COLUMN longitude FLOAT DEFAULT NULL;
            """))

        # Add IPEDS ID
        # Check if it already exists
        row = conn.execute(text("""SELECT * FROM identifier_type WHERE name = 'unitid'""")).mappings().fetchone()

        if not row:
            conn.execute(text(f"""
                INSERT INTO identifier_type (id, name, description) VALUES ('{uuid4()}', 'unitid', 'IPEDS Identifier (https://ceds.ed.gov/element/000166)')
            """))

        conn.commit()


def add_ipeds_id_type():
    """For each institution map it to a ROR and then IPEDS identifier"""

    # Load in the mapping data
    # https://github.com/opensyllabus/institution-identifiers/blob/main/latest.csv
    ror_to_unitid_df = pd.read_csv("institutions_api/db/migrations/add_institution_metadata_0/data/ror_to_unitid.csv")
    ror_to_unitid_df = ror_to_unitid_df.loc[~ror_to_unitid_df['ror_id'].isna()]
    ror_to_unitid = ror_to_unitid_df.set_index("ror_id").to_dict(orient="index")

    # https://nces.ed.gov/ipeds/datacenter/DataFiles.aspx?year=2023
    ipeds_data_df = pd.read_csv("institutions_api/db/migrations/add_institution_metadata_0/data/hd2023.csv", encoding='latin1')
    ipeds_data = ipeds_data_df.set_index("UNITID").to_dict(orient="index")

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
            WHERE it.name = 'ror_id'
        """)).mappings().fetchall()

        for institute in institutes:
            ror_id = institute["identifier"].replace("https://ror.org/", "")
            unit_id = ror_to_unitid.get(ror_id, {}).get("unitid")
            iped_data = ipeds_data.get(unit_id)

            # Add the IPEDS identifier
            if iped_data:

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
                    "website_address": iped_data["WEBADDR"],
                    "historically_black_college_or_university": iped_data["HBCU"] == 1,  # One is True, 2 is False
                    "tribal_college_or_university": iped_data['TRIBAL'] == 1,            # One is True, 2 is False
                    "program_length": PROGRAM_LENGTH_MAPPING[str(iped_data['ICLEVEL'])],
                    "control": CONTROL_MAPPING[str(iped_data['CONTROL'])],
                    "state": iped_data['STABBR'],
                    "institution_size": INSTITUTION_SIZE_MAPPING[str(iped_data['INSTSIZE'])]
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
    update_existing_tables()
    add_ipeds_id_type()


if __name__ == "__main__":
    main()
