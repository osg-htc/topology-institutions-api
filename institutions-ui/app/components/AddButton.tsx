"use client";
import React from 'react';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const AddButton: React.FC = () => {
    const handleClick = () => {
        window.open('https://topology-institutions.osgdev.chtc.io/ui/add', '_blank');
    }
    return (
        <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ padding: "1em" }}
            onClick={handleClick}
        >
            Add Institution
        </Button>
    );
};

export default AddButton;