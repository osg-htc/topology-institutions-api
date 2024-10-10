import uuid
import pytest
from fastapi import Request
from institutions_api.db import db
from unittest.mock import Mock

from institutions_api.models.api_models import InstitutionModel
from institutions_api.util.oidc_utils import OIDCUserInfo


@pytest.fixture
def session():
    session = db.Session()
    yield session
    session.rollback() # rollback after every test
    session.close()

class TestDBFunctions:

    def mock_request(self):
        """Create a mock request with OIDC headers"""
        mock_request = Mock(spec=Request) # Mock a request object
        mock_request.headers = {
            "oidc_claim_idp_name": "TestIDP",
            "oidc_claim_osgid": "test_user",
            "oidc_claim_name": "Test User",
            "oidc_claim_email": "testuser@morgridge.com"
        }
        return mock_request

    def test_things_work(self):
        assert True

    def test_get_valid_institutions(self, session):
        """test whether the list of institutions is valid"""
        institutions = db.get_valid_institutions()
        assert isinstance(institutions, list)
        assert len(institutions) > 0

    def test_institution_details_exist(self, session):
        """test whether the institution details exist"""
        institution = db.get_institution_details("3yiehdw3bef5")
        assert institution is not None
        assert institution.name == "Academia Sinica"

    def test_institution_details_not_exist(self, session):
        """test whether the institution details does not exist"""
        institution = db.get_institution_details("abcd")
        assert institution.status_code == 404

    def test_add_institution(self, session):
        """test whether adding a new institution works"""

        mock_request = self.mock_request() # Mock a request object
        user_info = OIDCUserInfo(mock_request)

        unique_name = f"test_institution_{uuid.uuid4().hex[:8]}"
        new_institution = InstitutionModel(name=unique_name, ror_id="https://ror.org/05ap1zt54")
        db.add_institution(new_institution, user_info)
        assert True

    def test_add_institution_with_unitid(self, session):
        # Create a new institution with a unitid
        mock_request = self.mock_request()  # Mock a request object
        user_info = OIDCUserInfo(mock_request)

        unique_name = f"test_institution_{uuid.uuid4().hex[:8]}"
        new_institution = InstitutionModel(name=unique_name, ror_id="https://ror.org/05ap1zt54", unitid="366632")
        db.add_institution(new_institution, user_info)
        assert True

    def test_update_institution(self, session):
        """test whether updating the institution works"""

        mock_request = self.mock_request() # Mock a request object
        user_info = OIDCUserInfo(mock_request)

        updated_institution_data = InstitutionModel(name="test", ror_id="https://ror.org/05xs36f43")
        db.update_institution("djdiowajda", updated_institution_data, user_info)
        assert True

    def test_invalidate_institution(self, session):
        """test whether invalidation of the institution works"""

        mock_request = self.mock_request() # Mock a request object
        user_info = OIDCUserInfo(mock_request)

        db.invalidate_institution("3yiehdw3bef5", user_info)
        assert True

