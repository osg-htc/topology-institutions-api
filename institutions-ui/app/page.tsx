import Header from "./components/Header";
import { Container } from "@mui/material";
import InstitutionsTable from "./components/Table";
import CssBaseline from '@mui/material/CssBaseline';

export default function Home() {
  return (
    <>
    <CssBaseline />
    <Container maxWidth="xl" sx={{ width: "100vw", height: "100vh", padding: 0 }} disableGutters>
      <Header />
      <InstitutionsTable />
    </Container>
    </>
  );
}
