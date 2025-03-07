import pandas as pd

from functools import lru_cache


@lru_cache(maxsize=1)
def load_carnegie_2025_data():
    carnegie_df = pd.read_excel(
        "institutions_api/db/migrations/add_carnegie_metadata_1/data/2025-RAD-Public-Data-File.xlsx",
        sheet_name="Data"
    )
    carnegie_by_unitid = carnegie_df.set_index("UNITID").to_dict(orient="index")
    return carnegie_by_unitid
