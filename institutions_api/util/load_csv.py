import csv

def load_valid_unitids(filepath: str) -> dict:
    """Load UNIT IDs from the CSV file into a set for lookups"""
    unitid_data = {}
    with open(filepath, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            unitid = row['UNITID']
            unitid_data[unitid] = {
                "name": row['INSTNM'],
                "longitude": float(row['LONGITUD']),
                "latitude": float(row['LATITUDE']),
                # Add more fields if required
            }
    return unitid_data


