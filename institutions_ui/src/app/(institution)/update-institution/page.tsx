'use client'

import { Button, TextField, Box, Typography, Stack } from '@mui/material';
import {useEffect, useState} from 'react';
import {useSearchParams} from "next/navigation";
import { Institution } from '@/app';
import { Item } from '@/app/components/Item';
import { useRouter } from 'next/navigation';
import errorHandler from "@/util/errorHandler";


export default function Page() {

  const searchParams = useSearchParams();
  const id = searchParams?.get('id'); // receiving the id from the URL

  const [institution, setInstitution] = useState<Institution>();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const response = await fetch(`${apiUrl}/institutions/${id}`)
      const data = await response.json();
      setInstitution(data);
    })();
  }, []);

  // Handle changes to the form fields
  const handleFieldChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    field: keyof Institution
  ) => {
    const value = e.target.value;
    setInstitution((prev: Institution | undefined) => {

      // This can't happen
      if( prev === undefined) return prev;

      return { ...prev, [field]: value };
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
        router.push('/')
      } else{
        try{
          const error = await response.json();
          const errorMessage = 'Error updating institution';
          errorHandler(error, errorMessage)
        } catch {
          alert('Response is not a JSON object');
        }
      }
    } catch (error) {
      console.error('Error updating institution:', error);
      alert('Error updating institution');
    }
  };

  return (
    <>
      <Box sx={{display: 'flex', justifyContent: 'center', alignItems:'center', minHeight: "100vh", width: '100%'}}>
        <Stack>
          <Item>
            <Typography variant='h4' gutterBottom sx={{color: 'black'}}>
              Update Institution
            </Typography>
          </Item>
          {institution &&
            <form onSubmit={handleSave}>
              <Item>
                {/* Institution name */}
                <TextField
                    fullWidth
                    label='Institution Name'
                    margin='normal'
                    value={institution?.name || ''}
                    onChange={(e) => handleFieldChange(e, 'name')}
                    error={!!errors.name}
                    helperText={errors.name || "Should match name from ROR id included below"}
                />
              </Item>
              <Item>
                {/* ROR ID */}
                <TextField
                    fullWidth
                    label='ROR ID'
                    margin='normal'
                    value={institution?.ror_id || ''}
                    onChange={(e) => handleFieldChange(e, 'ror_id')}
                    error={!!errors.ror_id}
                    helperText={errors.ror_id || <a href={"https://ror.org/search"}>Click on this text to search</a>}

                />
              </Item>
              <Item>
                {/* Unit ID */}
                <TextField
                    fullWidth
                    label='Unit ID'
                    margin='normal'
                    value={institution?.unitid || ''}
                    onChange={(e) => handleFieldChange(e, 'unitid')}
                    error={!!errors.unitid}
                    helperText={errors.unitid ||  <span>
                      Required if US University or College* |
                      <a href={"https://nces.ed.gov/ipeds/datacenter/InstitutionByName.aspx"}> Click on this text to search</a>
                    </span>}
                />
              </Item>
              <Item>
                {/* Longitude */}
                <TextField
                    fullWidth
                    label='Longitude'
                    margin='normal'
                    value={institution?.longitude || ''}
                    onChange={(e) => handleFieldChange(e, 'longitude')}
                    error={!!errors.longitude}
                    helperText={errors.longitude || "Required | Will be filled in automatically if ROR is included"}
                />
              </Item>
              <Item>
                {/* Latitude */}
                <TextField
                    fullWidth
                    label='Latitude'
                    margin='normal'
                    value={institution?.latitude || ''}
                    onChange={(e) => handleFieldChange(e, 'latitude')}
                    error={!!errors.latitude}
                    helperText={errors.latitude || "Required | Will be filled in automatically if ROR is included"}
                />
              </Item>

              <Item>
                <Button variant='contained' sx={{
                bgcolor: 'black',
                '&:hover': {
                  backgroundColor: '#555555',
                }
              }} onClick={handleSave}>
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
