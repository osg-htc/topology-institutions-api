import pandas as pd


def load_carnegie_data():
    carnegie_df = pd.read_excel(
        "institutions_api/db/migrations/add_carnegie_metadata_1/data/CCIHE2021-PublicData.xlsx",
        sheet_name="Data"
    )
    carnegie_by_unitid = carnegie_df.set_index("unitid").to_dict(orient="index")
    return carnegie_by_unitid
