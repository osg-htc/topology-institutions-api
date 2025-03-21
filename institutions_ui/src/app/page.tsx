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
  Checkbox
} from '@mui/material';
import { pink } from '@mui/material/colors';
import { useInstitution } from './context/InstitutionContext';
import { useState } from 'react';

export default function InstitutionList() {
  const { filteredInstitutions } = useInstitution();
  const [showOnlyWithUnitIds, setShowOnlyWithUnitIds] = useState<boolean>(false);

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
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>ID</TableCell>
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
          {displayData?.length > 0 ? (
            displayData.map((institution) => (
              <TableRow key={institution.id}>
                <TableCell>
                  <a href={`/ui/update-institution?id=${extractShortId(institution.id)}`}>
                  <Tooltip title="click to update institution">
                    <IconButton
                      aria-label='edit'
                    >
                      <EditIcon />
                    </IconButton>
                    </Tooltip>
                  </a>
                  {institution.name}
                </TableCell>
                <TableCell>{institution.id}</TableCell>
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
  );
}

function deleteTrailingSlash(url: string){
  return url.endsWith('/')? url.slice(0, -1) : url;
}
