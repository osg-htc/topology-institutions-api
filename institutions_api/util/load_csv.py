import pandas as pd


def load_csv(file_path: str) -> pd.DataFrame:
    """ Load a CSV file into a pandas DataFrame """
    ipeds_data_df = pd.read_csv(file_path, encoding='latin1')
    return ipeds_data_df