'use client'

import { Button, TextField, Box, Typography, Stack } from '@mui/material';
import {useEffect, useState} from 'react';
import {useSearchParams} from "next/navigation";

import NavBar from '@/app/components/NavBar';
import { Institution } from '@/app';
import { Item } from '@/app/components/Item';

export default function Page() {

  const searchParams = useSearchParams();
  const id = searchParams.get('id'); // receiving the id from the URL

  const [institution, setInstitution] = useState<Institution>();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    (async () => {
      const response = await fetch(`${apiUrl}/institutions/${id}`)
      const data = await response.json();
      setInstitution(data);
    })()

  }, []);

const validateForm = (institution: Institution | undefined) => {
  const validationErrors: { [key: string]: string } = {};

  // Check if name is empty
  if (!institution?.name) {
    validationErrors.name = 'Name is required';
  }

  if (institution?.unitid && !/^\d{6}$/.test(institution.unitid)) {
    validationErrors.unitid = 'Unit ID must be 6 digits long';
  }

  // Check if ROR ID is a valid URL
  if (
    institution?.ror_id &&
    !/^https:\/\/ror\.org\/.+$/.test(institution?.ror_id as string)
  ) {
    validationErrors.ror_id =
      'Invalid ROR ID format (must start with https://ror.org/)';
  }

  // Check if longitude and latitude are numbers
  if (institution?.longitude && isNaN(parseFloat(institution?.longitude as string))) {
    validationErrors.longitude = 'Longitude must be a number';
  }

  if (institution?.latitude && isNaN(parseFloat(institution?.latitude as string))) {
    validationErrors.latitude = 'Latitude must be a number';
  }

  return validationErrors
};

  // Handle changes to the form fields
  const handleFieldChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    field: keyof Institution
  ) => {
    const value = e.target.value;
    setInstitution((prev: Institution | undefined) => {

      // This can't happen
      if( prev === undefined) return prev;

      return { ...prev, [field]: e.target.value };
    })

        // Clear errors when valid input is provided
        if (field === 'name' && value && errors.name) {
          setErrors(prev => ({...prev, name: ''}));
        } else if (field === 'ror_id' && (!value || /^https:\/\/ror\.org\/.+$/.test(value)) && errors.ror_id) {
          setErrors(prev => ({...prev, ror_id: ''}));
        } else if (field === 'unitid' && (!value || /^\d{6}$/.test(value)) && errors.unitid) {
          setErrors(prev => ({...prev, unitid: ''}));
        } else if (field === 'longitude' && (!value || !isNaN(parseFloat(value))) && errors.longitude) {
          setErrors(prev => ({...prev, longitude: ''}));
        } else if (field === 'latitude' && (!value || !isNaN(parseFloat(value))) && errors.latitude) {
          setErrors(prev => ({...prev, latitude: ''}));
        }

  };

  // Save the changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm(institution)

    if (errors && Object.keys(errors).length > 0) {
      setErrors(errors)
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/institutions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(institution),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if(response.ok){
        alert('Institution updated successfully');
      }
    } catch (error) {
      console.error('Error updating institution:', error);
      alert('Error updating institution');
    }
  };

  return (
    <>
      <NavBar></NavBar>
      <Box>
        <Stack>
          <Item>
            <Typography variant='h4' gutterBottom>
              Update Institution
            </Typography>
          </Item>
          {institution &&
            <form onSubmit={handleSave}>
              <Item>
                {/* Institution name */}
                <TextField
                    label='Institution Name'
                    margin='normal'
                    value={institution?.name || ''}
                    onChange={(e) => handleFieldChange(e, 'name')}
                    sx={{width: '400px'}}
                    error={!!errors.name}
                    helperText={errors.name}
                />
              </Item>
              <Item>
                {/* ROR ID */}
                <TextField
                    label='ROR ID'
                    margin='normal'
                    value={institution?.ror_id || ''}
                    onChange={(e) => handleFieldChange(e, 'ror_id')}
                    sx={{width: '400px'}}
                    error={!!errors.ror_id}
                    helperText={errors.ror_id}
                />
              </Item>
              <Item>
                {/* Unit ID */}
                <TextField
                    label='Unit ID'
                    margin='normal'
                    value={institution?.unitid || ''}
                    onChange={(e) => handleFieldChange(e, 'unitid')}
                    sx={{width: '400px'}}
                    error={!!errors.unitid}
                    helperText={errors.unitid}
                />
              </Item>
              <Item>
                {/* Longitude */}
                <TextField
                    label='Longitude'
                    margin='normal'
                    value={institution?.longitude || ''}
                    onChange={(e) => handleFieldChange(e, 'longitude')}
                    sx={{width: '400px'}}
                    error={!!errors.longitude}
                    helperText={errors.longitude}
                />
              </Item>
              <Item>
                {/* Latitude */}
                <TextField
                    label='Latitude'
                    margin='normal'
                    value={institution?.latitude || ''}
                    onChange={(e) => handleFieldChange(e, 'latitude')}
                    sx={{width: '400px'}}
                    error={!!errors.latitude}
                    helperText={errors.latitude}
                />
              </Item>

              <Item>
                <Button variant='contained' color='primary' onClick={handleSave}>
                  Save
                </Button>
              </Item>
            </form>
          }
        </Stack>
      </Box>
    </>
  );
}
