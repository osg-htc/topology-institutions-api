import { AppBar, Toolbar, Typography, Button } from '@mui/material';

export default function NavBar() {
  return (
    <AppBar position='static'>
      <Toolbar>
        <a href={"/ui"} style={{ flexGrow: 1 }}>
          <Typography variant='h6'>
            Institutions
          </Typography>
        </a>
        <a href='/ui/add-institution.html'>
          <Button color='inherit'>Add Institution</Button>
        </a>
      </Toolbar>
    </AppBar>
  );
}
