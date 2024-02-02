"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, Link, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TableSortLabel } from "@mui/material";
import rawData from "../utils/institution_ids.json";
import SearchBar from "./SearchBar";
import AddButton from "./AddButton";

export default function InstitutionsTable() {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('asc');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>(searchQuery);
    const [sortColumn, setSortColumn] = useState<'name' | 'osg_id' | 'ror_id'>('name');

    // Simplify data processing and include the unique id extraction
    const data = useMemo(() => rawData.map(item => ({
        ...item,
        osg_id: item.id.split('/').pop() ?? null, // Convert undefined to null using nullish coalescing operator
    })), []);

    // Filter data based on search query
    const filteredData = useMemo(() => {
        const lowercasedFilter = debouncedSearchQuery.toLowerCase();
        return data.filter(({ name }) => name.toLowerCase().includes(lowercasedFilter));
    }, [data, debouncedSearchQuery]);

    // Debounce search query
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500); // Delay in milliseconds

        return () => {
            clearTimeout(handler);
        };
    }, [searchQuery]);

    const handleSort = (column: 'name' | 'osg_id' | 'ror_id') => {
        const isAsc = sortColumn === column && orderDirection === 'asc';
        setOrderDirection(isAsc ? 'desc' : 'asc');
        setSortColumn(column);
    };

    // Sort data for display
    const sortedAndFilteredData = useMemo(() => {
        return [...filteredData].sort((a, b) => {
            const valA = a[sortColumn] ? a[sortColumn]!.toLowerCase() : ''; // Ensuring non-null and lowercase for comparison
            const valB = b[sortColumn] ? b[sortColumn]!.toLowerCase() : '';
            return (orderDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA));
        });
    }, [filteredData, orderDirection, sortColumn]);

    // SearchBar handler
    const handleSearch = (value: string) => setSearchQuery(value);

    // Simplified renderContent function
    const renderContent = () => {
        return (
            <Box>
                <Box sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: '100%', 
                    marginY: '16px',
                }}>
                    <Box sx={{ 
                        flexGrow: 1
                    }}>
                        <AddButton />
                    </Box>
                    <Box sx={{ 
                        flexGrow: 1, 
                    }}>
                        <SearchBar options={filteredData.map(({ name }) => name)} onSearch={handleSearch} />
                    </Box>
                </Box>
                <TableContainer>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">

                        <TableHead>             
                            <TableRow>

                                <TableCell align="left">
                                    <TableSortLabel
                                        active={sortColumn === 'name'}
                                        direction={orderDirection}
                                        onClick={() => handleSort('name')}
                                    >
                                        <Typography variant="h6">
                                            Institution Name
                                        </Typography>
                                    </TableSortLabel>
                                </TableCell>

                                <TableCell align="left">
                                    <TableSortLabel
                                        active={sortColumn === 'osg_id'}
                                        direction={orderDirection}
                                        onClick={() => handleSort('osg_id')}
                                    >
                                        <Typography variant="h6">
                                            OSG ID
                                        </Typography>
                                    </TableSortLabel>
                                </TableCell>

                                <TableCell align="left">
                                    <TableSortLabel
                                        active={sortColumn === 'ror_id'}
                                        direction={orderDirection}
                                        onClick={() => handleSort('ror_id')}
                                    >
                                        <Typography variant="h6">
                                            ROR ID
                                        </Typography>
                                    </TableSortLabel>
                                </TableCell>

                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {sortedAndFilteredData.map((item) => (
                                <TableRow key={item.id}>

                                    <TableCell component="th" scope="row">
                                        <Typography variant="body1">
                                            <Link href={`https://topology-institutions.osgdev.chtc.io/ui/edit/${item.osg_id}`}>
                                                {item.name}
                                            </Link>
                                        </Typography>
                                    </TableCell>

                                    <TableCell align="left">
                                        <Typography variant="body1">
                                            {item.id}
                                        </Typography>
                                    </TableCell>

                                    <TableCell align="left">
                                        <Typography variant="body1">
                                            {item.ror_id}
                                        </Typography>
                                    </TableCell>

                                </TableRow>
                            ))}
                        </TableBody>

                    </Table>
                </TableContainer>
            </Box>
        );
    };

    return <>{renderContent()}</>;
}
// The original code for fetching data from the API is commented out below:
    // const [isLoading, setIsLoading] = useState<boolean>(false);
    // const [error, setError] = useState<string | null>(null);

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

    // This is the original render when feth data from API is used, right now it's not necessary.
        // if (isLoading) return <CircularProgress sx={{ display: "block", margin: "2em auto" }} />;
        // if (error) return <Alert severity="error" sx={{ margin: "2em" }}><Typography variant="h6">Oops! Something went wrong. Please try again later.</Typography></Alert>;
