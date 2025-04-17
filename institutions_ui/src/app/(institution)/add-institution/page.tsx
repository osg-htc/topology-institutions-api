'use client';

import { Button, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Stack, Box } from '@mui/material';
import { Item } from '@/app/components/Item';
import { useRouter } from 'next/navigation'
import errorHandler from '@/util/errorHandler';

export default function AddInstitution() {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [rorId, setRorId] = useState('');
  const [unitId, setUnitId] = useState('');
  const [longitude, setLongitude] = useState(''); // Keep as string for now. Will convert later
  const [latitude, setLatitude] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [disabled, setDisabled] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
  
    if (value && errors.name) { //clear error if there is a value and there is an error
      setErrors(prev => ({...prev, name: ''})); 
    }
  }
  
  const handleRorIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRorId(value);
  
    if ((!value || /^https:\/\/ror\.org\/.+$/.test(value)) && errors.rorId) { //clear error if there is not a value or the value is a valid ror id
      setErrors(prev => ({...prev, rorId: ''}));
    }
  }
  
  
  const handleUnitIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUnitId(value);
  
    if((!value || /^\d{6}$/.test(value)) && errors.unitId) {
      setErrors(prev => ({...prev, unitId: ''}));
    }
  
    if (e.target.value.trim() !== '') {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  };
  
  const handleLongitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLongitude(value);
  
    if((!value || !isNaN(parseFloat(value))) && errors.longitude) {
      setErrors(prev => ({...prev, longitude: ''}));
    }
  }
  
  const handleLatitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLatitude(value);
  
    if((!value || !isNaN(parseFloat(value))) && errors.latitude) {
      setErrors(prev => ({...prev, latitude: ''}));
    }
  }

  const handleSubmit = async (e: React.FormEvent, shouldRedirect: boolean = false)=> {
    e.preventDefault();

    const errors = validateForm(name, unitId, rorId, longitude, latitude);
    if (errors && Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    const institutionData = {
      name,
      id: id || null,
      ror_id: rorId || null,
      unitid: unitId || null,
      longitude: longitude ? parseFloat(longitude) : null, //Originally was inputted as string and needed to be converted to a float to be passed to the backend
      latitude: latitude ? parseFloat(latitude) : null,
      ipeds_metadata: null,
    };

    try {
    const response = await fetch(
      `${apiUrl}/institutions`,
      {
        method: 'POST',
        body: JSON.stringify(institutionData),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

      if (response.status === 200) {
        alert('Institution added successfully');
        setErrors({});

        // Reset form data
        setName('');
        setId('');
        setRorId('');
        setUnitId('');
        setLongitude('');
        setLatitude('');
        setDisabled(false);

        if(shouldRedirect) {
          router.push('/')
        }
        
      } else {
        try{
          const error = await response.json();
          const errorMessage = 'Error adding an institution'
          errorHandler(error, errorMessage);
        } catch{
          alert('Response is not a JSON object');
        }
      }
    } catch (error) {
      console.error('Failed to add institution:', error);
    }
  };

  return (
    <>
      <Box sx={{display: 'flex', justifyContent: 'center', alignItems:'center', minHeight: "100vh", width: '100%'}}>
        <Stack>
          <Item>
            <Typography variant='h4' gutterBottom sx={{color: 'black'}}>
              Add a new institution
            </Typography>
          </Item>
          <form>
            <Item>
              <TextField
                fullWidth
                id='name'
                label='Institution Name'
                margin='normal'
                value={name}
                onChange={handleNameChange}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Item>
            <Item>
              <TextField
                fullWidth
                id='rorId'
                label='ROR ID'
                margin='normal'
                value={rorId}
                onChange={handleRorIdChange}
                error={!!errors.rorId}
                helperText={errors.rorId}
              />
            </Item>
            <Item>
              <TextField
                fullWidth
                id='unitId'
                label='Unit ID'
                margin='normal'
                value={unitId}
                onChange={handleUnitIdChange}
                error={!!errors.unitId}
                helperText={errors.unitId}
              />
            </Item>
            <Item>
              <TextField
                fullWidth
                id='longitude'
                label='Longitude'
                margin='normal'
                value={longitude}
                onChange={handleLongitudeChange}
                error={!!errors.longitude}
                disabled={disabled}
                helperText={errors.longitude}
              />
            </Item>
            <Item>
              <TextField
                fullWidth
                id='latitude'
                label='Latitude'
                margin='normal'
                value={latitude}
                onChange={handleLatitudeChange}
                error={!!errors.latitude}
                disabled={disabled}
                helperText={errors.latitude}
              />
            </Item>
            <Item>
                <Button variant='contained' sx={{
                bgcolor: 'black',
                '&:hover': {
                  backgroundColor: '#555555',
                }
              }} onClick={(e) => handleSubmit(e, true)} type='button'>
                  Create
                </Button>
            </Item>
            <Item>
                <Button variant='contained' sx={{
                bgcolor: 'black',
                '&:hover': {
                  backgroundColor: '#555555',
                }
              }} onClick={(e) => handleSubmit(e, false)} type='button'>
                  Create and add another
                </Button>
            </Item>
          </form>
          <Item></Item>
        </Stack>
      </Box>
    </>
  );
}


const validateForm = (name: string, unitId: string, rorId: string, longitude: string, latitude: string ) => {
  const validationErrors: { [key: string]: string } = {};

  // Check if name is empty
  if (!name) {
    validationErrors.name = 'Name is required';
  }

  if (unitId && !/^\d{6}$/.test(unitId)) {
    validationErrors.unitId = 'Unit ID must be 6 digits long';
  }

  // Check if ROR ID is a valid URL
  if (rorId && !/^https:\/\/ror\.org\/.+$/.test(rorId)) {
    validationErrors.rorId =
      'Invalid ROR ID format (must start with https://ror.org/)';
  }

  // only validate longitude and latitude if unitId is not present
  if (!unitId) {
    // Check if longitude and latitude are numbers
    if (longitude && isNaN(parseFloat(longitude))) {
      validationErrors.longitude = 'Longitude must be a number';
    }

    if (latitude && isNaN(parseFloat(latitude))) {
      validationErrors.latitude = 'Latitude must be a number';
    }
  }

  return validationErrors;
};