import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import PatientCards from "./PatientCards";

function sortPatients(patients, sort, dir) {
    const arr = [...patients];
    const asc = dir === 'asc';

    switch (sort) {
        case 'nombre':
            return arr.sort((a, b) => {
                const cmp = (a.nombre?.nombre || '').localeCompare(b.nombre?.nombre || '', 'es');
                return asc ? cmp : -cmp;
            });

        case 'apellido':
            return arr.sort((a, b) => {
                const cmp = (a.nombre?.apellidoPaterno || '').localeCompare(b.nombre?.apellidoPaterno || '', 'es');
                return asc ? cmp : -cmp;
            });

        case 'edad':
            return arr.sort((a, b) => {
                const fa = new Date(a.demograficos?.fechaNacimiento || 0);
                const fb = new Date(b.demograficos?.fechaNacimiento || 0);
                // asc = más jóvenes primero = fecha más reciente primero
                return asc ? fb - fa : fa - fb;
            });

        case 'reciente':
        default:
            return arr.sort((a, b) => {
                const cmp = new Date(b.fechaRegistro || 0) - new Date(a.fechaRegistro || 0);
                return asc ? cmp : -cmp;
            });
    }
}

export default function PatientList() {
    const [patients, setPatients] = useState([]);
    const [sort, setSort]         = useState('reciente');
    const [sortDir, setSortDir]   = useState('asc');

    useEffect(() => {
        axios.get("http://localhost:5000/api/patients/with-admission")
            .then(res => setPatients(res.data))
            .catch(err => console.error("Error al cargar pacientes:", err));
    }, []);

    const sorted = useMemo(
        () => sortPatients(patients, sort, sortDir),
        [patients, sort, sortDir]
    );

    function handleSortChange(key, dir) {
        setSort(key);
        setSortDir(dir);
    }

    return (
        <PatientCards
            patients={sorted}
            sort={sort}
            sortDir={sortDir}
            onSortChange={handleSortChange}
            onSelectPatient={(p) => console.log('Seleccionado:', p)}
        />
    );
}