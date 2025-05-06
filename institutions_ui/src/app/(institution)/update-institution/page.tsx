'use client';

import {Box} from '@mui/material';
import {useCallback, useEffect, useState} from 'react';
import { useSearchParams } from 'next/navigation';
import { Institution } from '@/app';
import { useRouter } from 'next/navigation';
import InstitutionForm from "@/app/(institution)/components/form";

export default function Page() {
  const searchParams = useSearchParams();
  const id = searchParams?.get('id'); // receiving the id from the URL

  const [institution, setInstitution] = useState<Partial<Institution> | undefined>();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const response = await fetch(`${apiUrl}/institutions/${id}`);
      const data = await response.json();
      setInstitution(data);
    })();
  }, []);

  const onSubmit = useCallback(async (i: Institution) => {

    await handleSubmit(i)

    // If an error wasn't thrown skipping this block then lets go back to the list
    router.push('/')

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
        { institution && <InstitutionForm institution={institution} setInstitution={setInstitution} onSubmit={onSubmit} /> }
      </Box>
    </>
  );
}

const handleSubmit = async (i: Institution) => {

  const id_hash = i.id.replace('https://osg-htc.org/iid/', '');

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/institutions/${id_hash}`, {
    method: 'PUT',
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
