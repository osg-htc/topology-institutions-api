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

  useEffect(() => {
    (async () => {
      const response = await fetch(`/api/institutions/${id}`)
      const data = await response.json();
      setInstitution(data);
    })()

  }, []);

  // Handle changes to the form fields
  const handleFieldChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    field: keyof Institution
  ) => {
    setInstitution((prev: Institution | undefined) => {

      // This can't happen
      if( prev === undefined) return prev;

      return { ...prev, [field]: e.target.value };
    })
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
      await fetch(`/api/institutions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(institution),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      alert('Institution updated successfully');
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