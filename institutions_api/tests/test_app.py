import pytest
from fastapi.testclient import TestClient
from institutions_api.app import app

@pytest.fixture
def api_client():
    with TestClient(app) as client:
        yield client

class TestAPIEndpoints:

    def test_get_valid_institutions(self, api_client):
        """test whether getting a list of institutions works"""
        response = api_client.get("/institution_ids")
        assert response.status_code == 200
        institutions = response.json()
        assert isinstance(institutions, list)
        assert len(institutions) > 0

    def test_get_institution_details(self, api_client):
        """test whether getting an institution details works"""
        response = api_client.get("/institutions/3yiehdw3bef5")
        assert response.status_code == 200
        institution = response.json()
        assert institution['name'] == "Academia Sinica"

    def test_post_institution(self, api_client):
        """test whether posting an institution works"""
        new_institution = {
            "name": "Test",
            "id": "https://osg-htc.org/iid/12345",
            "ror_id": "https://ror.org/04achrx04",
            "unitid": None,
            "longitude": None,
            "latitude": None,
            "ipeds_metadata": None,
        }

        response = api_client.post("/institutions", json=new_institution)


        assert response.status_code == 200
        assert response.json() == "ok"

    def test_update_institution(self, api_client):
        """test whether updating an institution works"""
        update_data = {
            "name": "Academia Sinica",
            "ror_id": "https://ror.org/04zdhre16"
        }
        response = api_client.put("/institutions/3yiehdw3bef5", json=update_data)

        assert response.status_code == 200
        assert response.json() == "ok"


    def test_invalidate_institution(self, api_client):
        """test whether invalidation of an institution works"""
        response = api_client.delete("/institutions/3yiehdw3bef5")
        assert response.status_code == 200

        assert response.json() == "ok"






