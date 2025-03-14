'use client';
import React from 'react';
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

import { useInstitution } from './context/InstitutionContext';

export default function InstitutionList() {
  const { data } = useInstitution();

  const extractShortId = (fullId: string) => {
    const parts = fullId.split('/');
    const shortId = parts[parts.length - 1];
    return shortId.endsWith('/') ? shortId.slice(0, -1) : shortId;
  };

  return (
    <TableContainer>
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
                  <a href={`/ui/update-institution?id=${extractShortId(institution.id)}`}>
                    <IconButton
                      aria-label='edit'
                    >
                      <EditIcon />
                    </IconButton>
                  </a>
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
