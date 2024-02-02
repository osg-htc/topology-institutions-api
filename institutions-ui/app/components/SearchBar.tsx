import React, { useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';

interface SearchBarProps {
    options: string[];
    onSearch: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ options, onSearch }) => {
    const [searchValue, setSearchValue] = useState('');

    const [inputValue, setInputValue] = useState(''); // Tracks the input value

    // This handler updates the local input value state and triggers the search
    const handleInputChange = (event: React.SyntheticEvent<Element, Event>, value: string) => {
        setInputValue(value); // Update the local input value state
        onSearch(value); // Trigger the external search handler
    };

    return (
        <Autocomplete
            options={options}
            onInputChange={handleInputChange}
            inputValue={inputValue}
            filterOptions={(x) => x}
            noOptionsText="No institutions"
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Search for an institution"
                    variant="outlined"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    inputProps={{
                        ...params.inputProps,
                        autoComplete: "off", // Suggests to browsers not to autofill
                        name: "search-query",
                        id: "search-query", 
                    }}
                />
            )}
            sx={{ maxWidth: 400, marginLeft:"auto"}}
        />
    );
};

export default SearchBar;
