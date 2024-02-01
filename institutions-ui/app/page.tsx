import Header from "./components/Header";
import { Container } from "@mui/material";
import InstitutionsTable from "./components/Table";
import AddButton from "./components/AddButton";

export default function Home() {
  return (
    <Container maxWidth={false}>
      <Header />
      <AddButton />
      <InstitutionsTable />
    </Container>
    
  );
}
