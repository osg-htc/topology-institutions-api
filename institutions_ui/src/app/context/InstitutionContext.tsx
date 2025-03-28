'use client'

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Institution } from '@/app';

interface InstitutionContextType {
    data: Institution[];
    filteredInstitutions: Institution[];
    setFilteredInstitutions: React.Dispatch<React.SetStateAction<Institution[]>>;
    refreshInstitutions: () => Promise<void>;
}

const InstitutionContext = createContext<InstitutionContextType | undefined>(undefined)

export function InstitutionProvider( {children}: { children: ReactNode}) {
    const [data, setData] = useState<Institution[]>([]);
    const [filteredInstitutions, setFilteredInstitutions] = useState<Institution[]>([]);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const fetchInstitutions = async () => {
        const response = await fetch(`${apiUrl}/institution_ids`);
        const institutions = await response.json();
        setData(institutions);
        setFilteredInstitutions(institutions);
    }

    const refreshInstitutions = async () => {
        await fetchInstitutions();
    }

    useEffect(() => {
        fetchInstitutions();
    }, [])

    return(
        <InstitutionContext.Provider value={{data, filteredInstitutions, setFilteredInstitutions, refreshInstitutions}}>
            {children}
        </InstitutionContext.Provider>
    )
}

export function useInstitution() {
    const context = useContext(InstitutionContext);
    if (context === undefined) {
        throw new Error('useInstitution must be used within a InstitutionProvider');
    }
    return context;
}