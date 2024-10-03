import pytest
from fastapi.testclient import TestClient
from .. import app



@pytest.fixture
def api_client():
    with TestClient(app) as client:
        yield client

class TestAPIEndpoints:

    def test_get_valid_institutions(self, api_client):
        """test whether getting a list of institutions works"""
        response = api_client.get("/api/v1/institutions")
        assert response.status_code == 200
        institutions = response.json()
        assert isinstance(institutions, list)
        assert len(institutions) > 0

    def test_get_institution_details(self, api_client):
        """test whether getting an institution details works"""
        response = api_client.get("/api/v1/institutions/3yiehdw3bef5")
        assert response.status_code == 200
        institution = response.json()
        assert institution.name == "Academia Sinica"

    def test_post_institution(self, api_client):
        """test whether posting an institution works"""
        institution = {
            "name": "Test",
            "id": "https://osg-htc.org/iid/12345",
            "ror_id": "https://ror.org/12345",
            "unitid": None,
            "longitude": None,
            "latitude": None,
            "ipeds_metadata": None,
        }

        headers = {
            "oidc_claim_idp_name": "TestIDP",
            "oidc_claim_osgid": "test_user",
            "oidc_claim_name": "Test User",
            "oidc_claim_email": "testuser@morgridge.com"
        }

        response = api_client.post("/api/v1/institutions/", json = institution, headers=headers)


        assert response.status_code == 200
        assert response.text == "ok"

    def test_update_institution(self, api_client):
        """test whether updating an institution works"""

    def test_invalidate_institution(self, api_client):
        """test whether invalidation of an institution works"""






