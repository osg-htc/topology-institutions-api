'use client'
import { Box, AppBar, Toolbar, Typography, Button, styled, alpha, InputBase } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useInstitution } from '@/app/context/InstitutionContext';
import React, { useState, useEffect } from 'react';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  flexGrow: 1,
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

export default function NavBar() {

  const { data, setFilteredInstitutions } = useInstitution()
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if(searchTerm === '') {
      setFilteredInstitutions(data);
    } else{
      const filtered = data.filter(institution => institution.name.toLowerCase().includes(searchTerm.toLowerCase()) || institution.id.toLowerCase().includes(searchTerm.toLowerCase()));
      setFilteredInstitutions(filtered);
    }
  }, [searchTerm, data, setFilteredInstitutions])

  const HandleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }

  return (
    <Box>
      <AppBar position='static' sx={{bgcolor: 'black'}}>
        <Toolbar sx={{display: 'flex', justifyContent: 'space-between'}}>
          <a href={"/ui"}>
            <Typography variant='h6'>
              Topology Institutions API
            </Typography>
          </a>
          <Box sx={{display: 'flex', flexGrow: 1, alignItems: 'center'}}>
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ 'aria-label': 'search' }}
                value={searchTerm}
                onChange={HandleSearch}
              />
            </Search>
          </Box>
          <a href='/ui/add-institution'>
          <Button 
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                }
              }}
            >Add Institution</Button>
          </a>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
