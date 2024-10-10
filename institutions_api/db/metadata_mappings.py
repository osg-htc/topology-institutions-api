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