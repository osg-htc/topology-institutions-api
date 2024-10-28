'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import NavBar from '@/app/components/NavBar';
import { router } from 'next/client';
import { useRouter } from 'next/navigation';

interface Institution {
  id: string;
  name: string;
  ror_id: string;
  unitid: string;
  longitude: number;
  latitude: number;
  ipeds_metadata: IpedsMetadata;
}

interface IpedsMetadata {
  website_address: string;
  historically_black_college_or_university: boolean;
  tribal_college_or_university: boolean;
  program_length: string;
  control: string;
  state: string;
  institution_size: string;
}

export default function InstitutionList() {
  const [data, setData] = useState<Institution[]>([]);
  const router = useRouter();

  useEffect(() => {}, []);

  const extractShortId = (fullId: string) => {
    const parts = fullId.split('/');
    const shortId = parts[parts.length - 1];
    return shortId.endsWith('/') ? shortId.slice(0, -1) : shortId;
  };

  const handleEdit = (shortId: string) => {
    const id = extractShortId(shortId);
    router.push(`/update-institution?id=${id}`);
  };

  return (
    <TableContainer>
      <NavBar></NavBar>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>ID</TableCell>
            <TableCell>Website</TableCell>
            <TableCell>Historically Black College or University</TableCell>
            <TableCell>Tribal College or University</TableCell>
            <TableCell>Program Length</TableCell>
            <TableCell>Control</TableCell>
            <TableCell>State</TableCell>
            <TableCell>Institution Size</TableCell>
            <TableCell>Longitude</TableCell>
            <TableCell>Latitude</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.length > 0 ? (
            data.map((institution) => (
              <TableRow key={institution.id}>
                <TableCell>
                  <IconButton
                    onClick={() => handleEdit(institution.id)}
                    aria-label='edit'
                  >
                    <EditIcon />
                  </IconButton>
                  {institution.name}
                </TableCell>
                <TableCell>{institution.id}</TableCell>
                <TableCell>
                  {institution.ipeds_metadata?.website_address || 'N/A'}
                </TableCell>
                <TableCell>
                  {institution.ipeds_metadata
                    ?.historically_black_college_or_university
                    ? 'Yes'
                    : 'No'}
                </TableCell>
                <TableCell>
                  {institution.ipeds_metadata?.tribal_college_or_university
                    ? 'Yes'
                    : 'No'}
                </TableCell>
                <TableCell>
                  {institution.ipeds_metadata?.program_length || 'N/A'}
                </TableCell>
                <TableCell>
                  {institution.ipeds_metadata?.control || 'N/A'}
                </TableCell>
                <TableCell>
                  {institution.ipeds_metadata?.state || 'N/A'}
                </TableCell>
                <TableCell>
                  {institution.ipeds_metadata?.institution_size || 'N/A'}
                </TableCell>
                <TableCell>{institution.longitude || 'N/A'}</TableCell>
                <TableCell>{institution.latitude || 'N/A'}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={11}>No data available</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
