import {Button, Container} from "@mui/material";
import Link from "next/link";

export default function Home() {
  return (
      <Container>
        <Link href="/institution-list" passHref>
          <Button color="success"> Institution List</Button>
        </Link>
      </Container>
  );
}


