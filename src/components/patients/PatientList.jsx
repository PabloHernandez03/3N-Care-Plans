import { useEffect, useState, useMemo } from "react";
import api from "@/utils/api";
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

const DEFAULT_PAGE_SIZE = 20;

export default function PatientList({ showToast }) {
    const [patients, setPatients] = useState([]);
    const [sort, setSort]         = useState('reciente');
    const [sortDir, setSortDir]   = useState('asc');
    const [page, setPage]               = useState(1);
    const [gridPageSize, setGridPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [listPageSize, setListPageSize] = useState(DEFAULT_PAGE_SIZE);

    useEffect(() => {
        api.get('/api/patients/with-admission')
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
        setPage(1);
    }

    function handlePageSizeChange(view, size) {
        if (view === 'grid') setGridPageSize(size);
        else setListPageSize(size);
        setPage(1);
    }

    function handleDeletePatient(deleteId) {
        setPatients(prev => prev.filter(p => p._id !== deleteId)); 
    }

    return (
        <PatientCards
            allPatients={sorted}
            sort={sort}
            sortDir={sortDir}
            onSortChange={handleSortChange}
            page={page}
            onPageChange={setPage}
            gridPageSize={gridPageSize}
            listPageSize={listPageSize}
            onPageSizeChange={handlePageSizeChange}
            onSelectPatient={(p) => console.log('Seleccionado:', p)}
            onDeletePatient={handleDeletePatient}
            showToast={showToast}
        />
    );
}