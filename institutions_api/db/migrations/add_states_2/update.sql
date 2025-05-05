ALTER TABLE institution
ADD COLUMN state VARCHAR(255);

UPDATE institution
SET state = metadata.state
FROM institution_ipeds_metadata AS metadata
WHERE institution.id = metadata.institution_id;

