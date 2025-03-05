import os

import pandas as pd
from functools import lru_cache

@lru_cache(maxsize=1)
def load_ipeds_data():
    """ Load a CSV file into a pandas DataFrame """
    file_path = "institutions_api/db/migrations/add_institution_metadata_0/data/hd2023.csv"
    if not os.path.exists(file_path):
        raise ValueError("IPEDS data file not found")
    ipeds_data_df = pd.read_csv(file_path, encoding='latin1', dtype={'UNITID': str})
    ipeds_data_df['UNITID'] = ipeds_data_df['UNITID'].astype(str)  # Convert to string
    return ipeds_data_df.set_index("UNITID").to_dict(orient="index")

