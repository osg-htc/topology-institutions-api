'use client'
import React, {useEffect, useState} from "react";
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";

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

const Page = () => {
    const [data, setData] = useState<Institution[]>([]);

    useEffect(() => {
    // Fetch data from the local JSON file in the public folder
    fetch('/ui/institution_ids.json')
      .then((response) => response.json())
      .then((jsonData) => {
        setData(jsonData);
      })
      .catch((error) => {
        console.error('Error loading data:', error);
      });
  }, []);

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
                      </TableRow>
                  </TableHead>
                  <TableBody>
                      {data.map((institution) => (
                          <TableRow key={institution.id}>
                              <TableCell>{institution.name}</TableCell>
                              <TableCell>{institution.id}</TableCell>
                              <TableCell>{institution.ipeds_metadata?.website_address || 'N/A'}</TableCell>
                              <TableCell>{institution.ipeds_metadata?.historically_black_college_or_university === true ? 'Yes' : 'No'}</TableCell>
                              <TableCell>{institution.ipeds_metadata?.tribal_college_or_university === true ? 'Yes' : 'No'}</TableCell>
                              <TableCell>{institution.ipeds_metadata?.program_length || 'N/A'}</TableCell>
                              <TableCell>{institution.ipeds_metadata?.control || 'N/A'}</TableCell>
                              <TableCell>{institution.ipeds_metadata?.state || 'N/A'}</TableCell>
                              <TableCell>{institution.ipeds_metadata?.institution_size || 'N/A'}</TableCell>
                          </TableRow>
                          )
                          )}
                  </TableBody>
              </Table>
          </TableContainer>
  );

}

export default Page;