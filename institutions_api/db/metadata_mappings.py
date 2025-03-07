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

# Pulled from carnegieclassifications.acenet.edu
# https://carnegieclassifications.acenet.edu/wp-content/uploads/2023/03/CCIHE2021-PublicData.xlsx
CARNEGIE_CLASSIFICATION_MAPPING = {
    "-2": "NOT_CLASSIFIED",
    "1": "ASSOC_HI_TRANS_HI_TRAD",
    "2": "ASSOC_HI_TRANS_MIX_TRAD_NONTRAD",
    "3": "ASSOC_HI_TRANS_HI_NONTRAD",
    "4": "ASSOC_MIX_TRANS_CAREER_TECH_HI_TRAD",
    "5": "ASSOC_MIX_TRANS_CAREER_TECH_MIX_TRAD_NONTRAD",
    "6": "ASSOC_MIX_TRANS_CAREER_TECH_HI_NONTRAD",
    "7": "ASSOC_HI_CAREER_TECH_HI_TRAD",
    "8": "ASSOC_HI_CAREER_TECH_MIX_TRAD_NONTRAD",
    "9": "ASSOC_HI_CAREER_TECH_HI_NONTRAD",
    "10": "SPEC_FOCUS_2YR_HEALTH_PROF",
    "11": "SPEC_FOCUS_2YR_TECH_PROF",
    "12": "SPEC_FOCUS_2YR_ARTS_DESIGN",
    "13": "SPEC_FOCUS_2YR_OTHER_FIELDS",
    "14": "BACC_ASSOC_DOMINANT",
    "15": "DOCTORAL_VERY_HI_RESEARCH",
    "16": "DOCTORAL_HI_RESEARCH",
    "17": "DOCTORAL_PROF_UNIV",
    "18": "MASTERS_LARGER_PROG",
    "19": "MASTERS_MEDIUM_PROG",
    "20": "MASTERS_SMALL_PROG",
    "21": "BACC_ARTS_SCI_FOCUS",
    "22": "BACC_DIVERSE_FIELDS",
    "23": "BACC_ASSOC_MIXED",
    "24": "SPEC_FOCUS_4YR_FAITH",
    "25": "SPEC_FOCUS_4YR_MED_SCHOOLS",
    "26": "SPEC_FOCUS_4YR_OTHER_HEALTH",
    "27": "SPEC_FOCUS_4YR_RESEARCH",
    "28": "SPEC_FOCUS_4YR_ENG_TECH",
    "29": "SPEC_FOCUS_4YR_BUS_MGMT",
    "30": "SPEC_FOCUS_4YR_ARTS_MUSIC_DESIGN",
    "31": "SPEC_FOCUS_4YR_LAW",
    "32": "SPEC_FOCUS_4YR_OTHER",
    "33": "TRIBAL_COLLEGES"
}

RESEARCH_ACTIVITY_DESIGNATION_2025_MAPPING = {
    "Research 1: Very High Spending and Doctorate Production": "RESEARCH_1",
    "Research 2: High Spending and Doctorate Production": "RESEARCH_2",
    "Research Colleges and Universities": "RESEARCH_COLLEGES_AND_UNIVERSITIES"
}
