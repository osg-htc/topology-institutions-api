import uuid
import pytest
from fastapi import Request
from institutions_api.db import db
from unittest.mock import Mock

from sqlalchemy import create_engine, select, delete
from sqlalchemy.orm import sessionmaker, Session, joinedload

from institutions_api.db.db_models import Institution, Base, IdentifierType
from institutions_api.models.api_models import InstitutionValidatorModel
from institutions_api.util.oidc_utils import OIDCUserInfo


@pytest.fixture
def session():
    # Create an in-memory SQLite database engine
    engine = create_engine('sqlite:///:memory:')
    # Create all tables in the in-memory database
    Base.metadata.create_all(engine)
    # Create a configured "Session" class
    Session = sessionmaker(bind=engine)
    # Create a Session
    session = Session()
    yield session
    session.rollback()  # Rollback after every test
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
        new_institution = InstitutionValidatorModel(name=unique_name, ror_id="https://ror.org/05ap1zt54")
        db.add_institution(new_institution, user_info)
        assert True

    def test_add_institution_with_unitid(self, session):
        # Create a new institution with an unitid
        mock_request = self.mock_request()  # Mock a request object
        user_info = OIDCUserInfo(mock_request)

        unique_name = f"test_institution_{uuid.uuid4().hex[:8]}"
        new_institution = InstitutionValidatorModel(name=unique_name, ror_id="https://ror.org/05ap1zt54", unitid="366340")
        db.add_institution(new_institution, user_info)
        assert True

    def test_update_institution(self, session):
        """test whether updating the institution works"""

        mock_request = self.mock_request() # Mock a request object
        user_info = OIDCUserInfo(mock_request)

        unique_name = f"test_institution_{uuid.uuid4().hex[:8]}"
        updated_institution_data = InstitutionValidatorModel(name=unique_name, ror_id="https://ror.org/05xs36f43")
        db.update_institution("djdiowajda", updated_institution_data, user_info)
        assert True

    def test_update_institution_with_existing_unitid(self, session):
        """test whether updating the institution with an existing unitid works"""

        unit_id_type = IdentifierType(name='unitid')
        session.add(unit_id_type)
        session.commit()

        institution = Institution(name="Test Institution", topology_identifier="test_id", created_by="test_user")
        session.add(institution)
        session.commit()

        # Add initial unit ID
        initial_unit_id = "366623"
        db._update_institution_unit_id(session, institution, initial_unit_id)
        session.commit()

        # Update the unit ID
        updated_unit_id = "366632"
        db._update_institution_unit_id(session, institution, updated_unit_id)
        session.commit()

        # Verify the update
        updated_institution = session.scalar(select(Institution).where(Institution.id == institution.id))
        assert updated_institution.identifiers[0].identifier == updated_unit_id

    def test_update_institution_with_no_existing_unitid(self, session):
        """Test updating the institution with a new unit ID when no existing unit ID is present"""

        # Add a unit ID type for 'unitid'
        unit_id_type = IdentifierType(name='unitid')
        session.add(unit_id_type)
        session.commit()

        # Create a test institution without any unit ID
        institution = Institution(name="Institution without UnitID", topology_identifier="test_id_no_unitid",
                                  created_by="test_user")
        session.add(institution)
        session.commit()

        # New unit ID to add
        new_unit_id = "233666"

        # Update the institution with the new unit ID
        db._update_institution_unit_id(session, institution, new_unit_id)
        session.commit()

        # Verify the addition of the unit ID
        updated_institution = session.scalar(select(Institution).where(Institution.id == institution.id))
        assert updated_institution.identifiers[0].identifier == new_unit_id

    def test_delete_existing_unit_id(self, session):
        """Test deleting an existing unit ID"""

        unit_id_type = IdentifierType(name='unitid')
        session.add(unit_id_type)
        session.commit()

        institution = Institution(name="Test Institution", topology_identifier="test_id", created_by="test_user")
        session.add(institution)
        session.commit()

        # Add initial unit ID
        initial_unit_id = "366632"
        db._update_institution_unit_id(session, institution, initial_unit_id)
        session.commit()

        # Remove the unit ID by setting it to an empty string
        db._update_institution_unit_id(session, institution, " ")
        session.commit()

        # Verify the removal
        updated_institution = session.scalar(select(Institution).where(Institution.id == institution.id))
        assert len(updated_institution.identifiers) == 0

    def test_add_new_unit_id(self, session):
        """Test adding a new unit ID"""

        unit_id_type = IdentifierType(name='unitid')
        session.add(unit_id_type)
        session.commit()

        institution = Institution(name="Test Institution", topology_identifier="test_id", created_by="test_user")
        session.add(institution)
        session.commit()

        # Add new unit ID
        new_unit_id = "366632"
        db._update_institution_unit_id(session, institution, new_unit_id)
        session.commit()

        # Verify the addition
        updated_institution = session.scalar(select(Institution).where(Institution.id == institution.id))
        assert updated_institution.identifiers[0].identifier == new_unit_id

    def test_invalidate_institution(self, session):
        """test whether invalidation of the institution works"""

        mock_request = self.mock_request() # Mock a request object
        user_info = OIDCUserInfo(mock_request)

        db.invalidate_institution("3yiehdw3bef5", user_info)
        assert True

