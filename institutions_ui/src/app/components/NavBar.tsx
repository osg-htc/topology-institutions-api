import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function NavBar() {
  return (
    <AppBar position='static'>
      <Toolbar>
        <Typography variant='h6' style={{ flexGrow: 1 }}>
          Institutions
        </Typography>
        <Link href='/institution-list' passHref>
          <Button color='inherit'>Institution List</Button>
        </Link>
        <Link href='/add-institution' passHref>
          <Button color='inherit'>Add Institution</Button>
        </Link>
      </Toolbar>
    </AppBar>
  );
}
