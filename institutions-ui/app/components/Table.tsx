'use client';
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Alert, Link } from "@mui/material";
import { Institution } from "../utils/types";
import rawData from "../utils/institution_ids.json";

export default function InstitutionsTable() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<Institution[]>([]);

    useEffect(() => {
            const processedData = rawData.map(item => ({
                ...item,
                osg_id: item.id.split('/').pop() || null, // Convert undefined to null
            }));
    
            setData(processedData);
        }, []);

    // useEffect(() => {
    //     const fetchData = async () => {
    //         setIsLoading(true);
    //         setError(null); 
    //         try {
    //             const response = await fetch('https://topology-institutions.osg.chtc.io/api/institution_ids');
    //             if (!response.ok) {
    //                 throw new Error(`Error: ${response.status}`); 
    //             }
    //             const jsonData: Institution[] = await response.json();
    //             setData(jsonData); 
    //         } catch (err: any) { 
    //             setError(err.message);
    //         } finally {
    //             setIsLoading(false); 
    //         }
    //     };

    //     fetchData();
    // }, []);

    return (
        <>
            {isLoading ? (
                <CircularProgress sx={{ display: "block", margin: "2em auto" }} /> // Show loading spinner when loading is true
            ) : error ? (
                <Alert severity="error" sx={{ margin: "2em"}}><Typography variant="h6">Oops! Something went wrong. Please try again later.</Typography></Alert> // Show error message when error is not null
            ) : (
                // Show the table when everything is all good
                <TableContainer>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell align="left"><Typography variant="h6">Institution Name</Typography></TableCell>
                                <TableCell align="left"><Typography variant="h6">OSG ID</Typography></TableCell>
                                <TableCell align="left"><Typography variant="h6">ROR ID</Typography></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((row) => (
                                <TableRow
                                    key={row.name}
                                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">
                                        <Typography variant="body1">
                                        <Link href={`https://topology-institutions.osgdev.chtc.io/ui/edit/${row.osg_id}`}>{row.name}</Link>
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="left"><Typography variant="body1">{row.id}</Typography></TableCell>
                                    <TableCell align="left"><Typography variant="body1">{row.ror_id}</Typography></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </>
    );
}