import pytest
from institutions_api.db import db



@pytest.fixture
def session():
    pass

class TestDBFunctions:

    def test_things_work(self):
        assert True

    def test_get_valid_institutions(self, session):
        institutions = db.get_valid_institutions()
        assert isinstance(institutions, list)
        assert len(institutions) > 0

    def test_institution_details_exist(self, session):
        institution = db.get_institution_details("3yiehdw3bef5")
        assert institution is not None
        assert institution.name == "Academia Sinica"

    def test_institution_details_not_exist(self, session):
        institution = db.get_institution_details("abcd")
        assert institution.status_code == 404

    def test_add_institution(self, session):
        new_institution = db.add_institution(name="")

