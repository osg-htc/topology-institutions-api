'use client'

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Institution } from '@/app';

interface InstitutionContextType {
    data: Institution[];
}

const InstitutionContext = createContext<InstitutionContextType | undefined>(undefined)

export function InstitutionProvider( {children}: { children: ReactNode}) {
    const [data, setData] = useState<Institution[]>([]);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {

        const fetchData = async () => {
            const response = await fetch(`${apiUrl}/institution_ids`);
            const institutions = await response.json();
            setData(institutions);
        }
        fetchData();

    }, [])

    return(
        <InstitutionContext.Provider value={{data}}>
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