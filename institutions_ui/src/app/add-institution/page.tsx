'use client';
import NavBar from "@/app/components/NavBar";
import {Button, Container, TextField, Typography} from "@mui/material";
import {useState} from "react";
import axios from "axios";


export default function AddInstitution() {
    const [name, setName] = useState("");
    const [id, setId] = useState("");
    const [rorId, setRorId] = useState("");
    const [unitId, setUnitId] = useState("");

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateForm = () => {
        const validationErrors: { [key: string]: string } = {};

        if(!name) {
            validationErrors.name = "Name is required";
        }

        if (unitId && (!/^\d{6}$/.test(unitId))) {
            validationErrors.unitId = "Unit ID must be 6 digits long";
        }

        if (rorId && !/^https:\/\/ror\.org\/.+$/.test(rorId)) {
            validationErrors.rorId = "Invalid ROR ID format (must start with https://ror.org/)";
        }

        return validationErrors;

    }


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return
        }

        const institutionData = {
            name,
            id,
            ror_id: rorId,
            unitid: unitId,
        };

        const response = await axios.post("http://localhost:8089/institution", institutionData, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        try{
            if (response.status === 200) {
                alert("Institution added successfully");
                setErrors({})

                // Reset form data
                setName("");
                setId("");
                setRorId("");
                setUnitId("");
            } else {
                alert("Failed to add institution. Please try again.");
            }
        } catch (error){
            console.error("Failed to add institution:", error);
        }

    }

    return (
        <>
            <NavBar/>
            <Container>
                <Typography variant="h4" gutterBottom>
                    Add a new institution
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        required
                        id="name"
                        label="Institution Name"
                        margin="normal"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={!!errors.name}
                        helperText={errors.name}
                    />

                    <TextField
                        id="id"
                        label="ID"
                        margin="normal"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        error={!!errors.name}
                        helperText={errors.name}
                    />

                    <TextField
                        id="rorId"
                        label="ROR ID"
                        margin="normal"
                        value={rorId}
                        onChange={(e) => setRorId(e.target.value)}
                        error={!!errors.rorId}
                        helperText={errors.rorId}
                    />

                    <TextField
                        id="unitId"
                        label="Unit ID"
                        margin="normal"
                        value={unitId}
                        onChange={(e) => setUnitId(e.target.value)}
                        error={!!errors.unitId}
                        helperText={errors.unitId}
                    />

                    <Button variant="contained" color="primary" type="submit">
                        Submit
                    </Button>
                </form>
            </Container>

        </>

    );
}
