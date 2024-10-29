'use client';
import NavBar from "@/app/components/NavBar";
import {Button, Container, TextField, Typography} from "@mui/material";
import {useState} from "react";
import axios from "axios";
import {Stack, Box, Paper} from "@mui/material";
import { styled } from "@mui/material";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));


export default function AddInstitution() {
    const [name, setName] = useState("");
    const [id, setId] = useState("");
    const [rorId, setRorId] = useState("");
    const [unitId, setUnitId] = useState("");
    const [longitude, setLongitude] = useState(""); // Keep as string for now. Will convert later
    const [latitude, setLatitude] = useState("");

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [disabled, setDisabled] = useState(false);

    const validateForm = () => {
        const validationErrors: { [key: string]: string } = {};

        // Check if name is empty
        if(!name) {
            validationErrors.name = "Name is required";
        }


        if (unitId && (!/^\d{6}$/.test(unitId))) {
            validationErrors.unitId = "Unit ID must be 6 digits long";
        }

        // Check if ROR ID is a valid URL
        if (rorId && !/^https:\/\/ror\.org\/.+$/.test(rorId)) {
            validationErrors.rorId = "Invalid ROR ID format (must start with https://ror.org/)";
        }

        // only validate longitude and latitude if unitId is not present
        if (!unitId){
            // Check if longitude and latitude are numbers
            if (longitude && isNaN(parseFloat(longitude))) {
                validationErrors.longitude = "Longitude must be a number";
            }

            if (latitude && isNaN(parseFloat(latitude))) {
                validationErrors.latitude = "Latitude must be a number";
            }
        }


        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    }

    const handleUnitIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUnitId(e.target.value);
        if(e.target.value.trim() !== "") {
            setDisabled(true)
        } else{
            setDisabled(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()){
            return
        }

        const institutionData = {
            name,
            id: id || null,
            ror_id: rorId || null,
            unitid: unitId || null,
            longitude: longitude ? parseFloat(longitude) : null, //Originally was inputted as string and needed to be converted to a float to be passed to the backend
            latitude: latitude ? parseFloat(latitude) : null,
            ipeds_metadata: null,
        };

        const response = await axios.post("http://localhost:8089/institutions", institutionData, {
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
            <Box>
                <Stack>
                    <Item>
                        <Typography variant="h4" gutterBottom>
                            Add a new institution
                        </Typography>
                    </Item>
                        <form onSubmit={handleSubmit}>
                            <Item>
                                <TextField
                                id="name"
                                label="Institution Name"
                                margin="normal"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                error={!!errors.name}
                                helperText={errors.name}
                                sx={{width: '400px'}}
                            />
                            </Item>
                            <Item>
                                <TextField
                                id="rorId"
                                label="ROR ID"
                                margin="normal"
                                value={rorId}
                                onChange={(e) => setRorId(e.target.value)}
                                error={!!errors.rorId}
                                helperText={errors.rorId}
                                sx={{width: '400px'}}
                            />
                            </Item>
                            <Item>
                                <TextField
                                id="unitId"
                                label="Unit ID"
                                margin="normal"
                                value={unitId}
                                onChange={handleUnitIdChange}
                                error={!!errors.unitId}
                                helperText={errors.unitId}
                                sx={{width: '400px'}}
                            />
                            </Item>
                            <Item>
                                <TextField
                                id="longitude"
                                label="Longitude"
                                margin="normal"
                                value={longitude}
                                onChange={(e) => setLongitude(e.target.value)}
                                error={!!errors.longitude}
                                disabled={disabled}
                                helperText={errors.longitude}
                                sx={{width: '400px'}}
                            />
                            </Item>
                            <Item>
                                <TextField
                                id="latitude"
                                label="Latitude"
                                margin="normal"
                                value={latitude}
                                onChange={(e) => setLatitude(e.target.value)}
                                error={!!errors.latitude}
                                disabled={disabled}
                                helperText={errors.latitude}
                                sx={{width: '400px'}}
                            />
                            </Item>
                            <Item>
                                <Button variant="contained" color="primary" type="submit">
                                Submit
                                </Button>
                            </Item>
                        </form>
                    <Item>


                    </Item>

                </Stack>
            </Box>
        </>

    );
}
