'use client';

import {useCallback, useState} from 'react';
import {Box} from '@mui/material';
import {Institution} from "@/app";
import InstitutionForm from "@/app/(institution)/components/form";

export default function AddInstitution() {

  const [institution, setInstitution] = useState<Partial<Institution>>({});

  const onSubmit = useCallback(async (i: Institution) => {

    await handleSubmit(i)

    // If an error wasn't thrown skipping this block then lets clear the institution
    setInstitution({})

  }, [institution, setInstitution]);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          width: '100%',
        }}
      >
        <InstitutionForm institution={institution} setInstitution={setInstitution} onSubmit={onSubmit} />
      </Box>
    </>
  );
}

const handleSubmit = async (
    i: Institution
) => {

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/institutions`, {
    method: 'POST',
    body: JSON.stringify(i),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status !== 200) {
    let error = `Error adding an institution`
    try {
      const errorResponse = await response.json();
      error = `Error adding an institution: ${JSON.stringify(errorResponse)}`;
    } catch {}

    throw new Error(error);
  }
};