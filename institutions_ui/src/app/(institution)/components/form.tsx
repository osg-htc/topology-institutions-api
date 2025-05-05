import {Item} from "@/app/components/Item";
import {Button, CircularProgress, TextField} from "@mui/material";
import {Institution} from "@/app";
import {useCallback, useState} from "react";

interface InstitutionFormProps {
  institution: Partial<Institution>;
  setInstitution: (institution: Partial<Institution>) => void;
  onSubmit: (institution: Institution) => Promise<void>;
}

const InstitutionForm = ({institution, setInstitution: _setInstitution, onSubmit}: InstitutionFormProps) => {

  const [errors, setErrors] = useState<Record<keyof ErrorKeys, string>>(structuredClone(defaultErrors))
  const [submitting, setSubmitting] = useState<boolean>(false)

  const setInstitution = useCallback((i: Partial<Institution>) => {

    // Remove empty values from the object
    Object.keys(i).forEach(key => {
      if (i[key as keyof Institution] === '') {
        delete i[key as keyof Institution]
      }
    })

    setErrors(validateInstitution(i))
    _setInstitution(i)
  }, [setErrors, _setInstitution])

  const handleSubmit = useCallback(async (institution: Partial<Institution>) => {
    setSubmitting(true)
    const errors = validateInstitution(institution)
    setErrors(errors)

    if (Object.values(errors).every(error => error === '')) {
      try {
        await onSubmit(institution as Institution)
        alert('Success')
      } catch (e) {
        alert('Error: ' + e)
      }
    } else {
      alert('Please fix the errors before submitting the form.')
    }

    setSubmitting(false)
  }, [onSubmit, setErrors, setSubmitting])

  return (
    <form>
      <Item>
        <TextField
          fullWidth
          id='name'
          label='Institution Name'
          margin='normal'
          value={institution?.name || ''}
          onChange={e => setInstitution({...institution, name: e.target.value})}
          error={!!errors.name}
          helperText={
            errors.name || 'Should match name from ROR id included below'
          }
        />
      </Item>
      <Item>
        <TextField
          fullWidth
          id='rorId'
          label='ROR ID'
          margin='normal'
          value={institution?.ror_id || ''}
          onChange={e => setInstitution({...institution, ror_id: e.target.value})}
          error={!!errors.ror_id}
          helperText={
            errors.ror_id || (
              <a href={'https://ror.org/search'} target={'_blank'}>
                Click on this text to search
              </a>
            )
          }
        />
      </Item>
      <Item>
        <TextField
          fullWidth
          id='unitId'
          label='Unit ID'
          margin='normal'
          value={institution?.unitid || ''}
          onChange={e => setInstitution({...institution, unitid: e.target.value})}
          error={!!errors.unitid}
          helperText={
            errors.unitid || (
              <span>
                Required if US University or College* |
                <a
                  href={
                    'https://nces.ed.gov/ipeds/datacenter/InstitutionByName.aspx'
                  }
                  target={'_blank'}
                >
                  {' '}
                  Click on this text to search
                </a>
              </span>
            )
          }
        />
      </Item>
      <Item>
        <TextField
          fullWidth
          id='latitude'
          label='Latitude'
          margin='normal'
          value={institution?.latitude || ''}
          onChange={e => setInstitution({...institution, latitude: e.target.value})}
          error={!!errors.latitude}
          disabled={!!institution?.unitid}
          helperText={
            errors.latitude ||
            'Required | Will be filled in automatically if UNITID is included'
          }
        />
      </Item>
      <Item>
        <TextField
          fullWidth
          id='longitude'
          label='Longitude'
          margin='normal'
          value={institution?.longitude || ''}
          onChange={e => setInstitution({...institution, longitude: e.target.value})}
          error={!!errors.longitude}
          disabled={!!institution?.unitid}
          helperText={
            errors.longitude ||
            'Required | Will be filled in automatically if UNITID is included'
          }
        />
      </Item>
      <Item>
        <TextField
          fullWidth
          id='state'
          label='State'
          margin='normal'
          value={institution?.state || ''}
          onChange={e => setInstitution({...institution, state: e.target.value})}
          error={!!errors.state}
          disabled={!!institution?.unitid}
          helperText={
            errors.state ||
            'Required | Will be filled in automatically if UNITID is included'
          }
        />
      </Item>
      <Item>
        <Button
          disabled={submitting}
          variant='contained'
          sx={{
            bgcolor: 'black',
            '&:hover': {
              backgroundColor: '#555555',
            },
          }}
          onClick={() => handleSubmit(institution)}
        >
          { submitting ? <CircularProgress/> : 'Create' }
        </Button>
      </Item>
    </form>
  )
}

type ErrorKeys = Pick<Institution, 'name' | 'ror_id' | 'unitid' | 'longitude' | 'latitude' | 'state'>;

const defaultErrors: Record<keyof ErrorKeys, string> = {
  name: '',
  ror_id: '',
  unitid: '',
  longitude: '',
  latitude: '',
  state: ''
}

const validateInstitution = (institution: Partial<Institution>): Record<keyof ErrorKeys, string> => {

  const errors: Record<keyof ErrorKeys, string> = structuredClone(defaultErrors)

    // Check if name is empty
  if (!institution?.name) {
    errors.name = 'Name is required';
  }

  if (institution?.unitid && !/^\d{6}$/.test(institution?.unitid)) {
    errors.unitid = 'Unit ID must be 6 digits long';
  }

  // Check if ROR ID is a valid URL
  if (institution?.ror_id && !/^https:\/\/ror\.org\/.+$/.test(institution?.ror_id)) {
    errors.ror_id =
      'Invalid ROR ID format (must start with https://ror.org/)';
  }

  // only validate longitude, latitude, state if unitId is not present
  if (!institution?.unitid) {

    // Check if longitude and latitude are numbers
    if (institution?.longitude && isNaN(parseFloat(institution?.longitude as string))) {
      errors.longitude = 'Longitude must be a number';
    }
    if (institution?.latitude && isNaN(parseFloat(institution?.latitude as string))) {
      errors.latitude = 'Latitude must be a number';
    }

    // Check if the state is a valid US state abbreviation
    if(institution?.state && institution?.state.length !== 2) {
      errors.state = "State abbreviations must be 2 characters long";
    }
  }

  return errors
}

export default InstitutionForm;
