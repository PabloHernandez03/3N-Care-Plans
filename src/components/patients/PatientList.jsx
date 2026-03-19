import { useEffect, useState } from "react";
import axios from "axios";
import PatientCards from "./PatientCards";  

export default function PatientList() {

    const [patients, setPatients] = useState([]);

    useEffect(() => {

        const fetchPatients = async () => {

            try {

                const res = await axios.get("http://localhost:5000/api/patients");

                console.log(res.data);

                setPatients(res.data);

            } catch (error) {

                console.error(error);

            }

        };

        fetchPatients();

    }, []);

    return (
        <div>
            <PatientCards
            patients={patients}
            onSelectPatient={(p) => console.log('Seleccionado:', p)}
            />
        </div>
    );
}