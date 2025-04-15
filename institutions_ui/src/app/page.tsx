'use client';
import React from 'react';
import EditIcon from '@mui/icons-material/Edit';
import {
  Tooltip,
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  CircularProgress
} from '@mui/material';
import { pink } from '@mui/material/colors';
import { useInstitution } from './context/InstitutionContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function InstitutionList() {
  const { filteredInstitutions, refreshInstitutions } = useInstitution();
  const [showOnlyWithUnitIds, setShowOnlyWithUnitIds] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect( () => {
    setLoading(true);
    refreshInstitutions()
      .finally(() => {
       setLoading(false);
     })

    const handleVisibilityChange = () => {
      if(document.visibilityState === 'visible'){
        setLoading(true);
        refreshInstitutions()
          .finally(() => {
            setLoading(false);
          });
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }

  }, [])

  const extractShortId = (fullId: string) => {
    const parts = fullId.split('/');
    const shortId = parts[parts.length - 1];
    return shortId.endsWith('/') ? shortId.slice(0, -1) : shortId;
  };

  const handleUnitIdFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowOnlyWithUnitIds(e.target.checked);
  };

  const displayData = showOnlyWithUnitIds ? filteredInstitutions.filter((institution) => institution.unitid !== null) : filteredInstitutions;

  return (
    <Box sx={{height: 'calc(100vh - 64px)', width: '100%'}}>
    <TableContainer sx={{maxHeight: 'calc(100vh - 64px)', overflow: 'auto'}}>
      <Table stickyHeader aria-label="sticky table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>ROR ID</TableCell>
            <TableCell>
              <Box sx={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
              <span>Unit ID</span>
              <Tooltip title="Check to show institutions with Unit ID only">
                  <Checkbox 
                  size="small" 
                  sx={{color: pink[800],'&.Mui-checked': {color: pink[600],}, marginRight: 1}}
                  inputProps={{ 'aria-label': 'controlled' }}
                  onChange={handleUnitIdFilter}
                  checked={showOnlyWithUnitIds}
                  /> 
                </Tooltip>
                
              </Box>
            </TableCell>
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
          {loading ? (
            <TableRow>
              <TableCell colSpan={12} align="center" sx={{ height: 300 }}>
                <CircularProgress sx={{color: pink[600]}}/>
              </TableCell>
            </TableRow>
          ) : displayData?.length > 0 ? (
            displayData.map((institution) => (
              <TableRow key={institution.id}>
                <TableCell>
                  <Link href={`/update-institution?id=${extractShortId(institution.id)}`}>
                  <Tooltip title="click to update institution">
                    <IconButton
                      sx={{color: 'black', '&:hover': {color: pink[600]}, marginLeft: -1.5}}
                      aria-label='edit'
                    >
                      <EditIcon />
                    </IconButton>
                    </Tooltip>
                  </Link>
                  {institution.name}
                </TableCell>
                <TableCell>{institution.ror_id || 'N/A'}</TableCell>
                <TableCell>{institution.unitid || 'N/A'}</TableCell>
                  <TableCell>
                    {institution.ipeds_metadata?.website_address ? (<a href={institution.ipeds_metadata?.website_address} target="_blank" style={{ textDecoration: 'underline', color: pink[600] }}>{deleteTrailingSlash(institution.ipeds_metadata?.website_address) || 'N/A'}</a>)
                    : "N/A"}
                    
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
    </Box>
  );
}

function deleteTrailingSlash(url: string){
  return url.endsWith('/')? url.slice(0, -1) : url;
}
