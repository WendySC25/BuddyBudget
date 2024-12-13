// Debts.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../NavBar/Navbar';
import DebtsTable from '../Tables/DebtsTable';
import DebtsForm from '../Forms/DebtsForm.jsx';

import './Transactions.css'
import client from '../../apiClient.jsx';
import SearchBarWithFilter from '../Serchbar/SerchBarWithFilters.jsx';

const Debts = ({ handleLogout, isAdmin }) => {

    const [debts, setDebts] = useState([]); // Estado para almacenar la lista de deudas
    const [debtToEdit, setDebtToEdit] = useState(null); // Estado para almacenar la deuda que se va a editar

    const [showForm, setShowForm] = useState(false); // Estado para controlar la visibilidad del formulario

    useEffect(() => {
        const appName = document.querySelector('meta[name="app-name"]').getAttribute('content');
        document.title = `Debts - ${appName}`;
      }, []);

    // useEffect para realizar acciones cuando cambia `showForm` (Modificar Fondo)
    useEffect(() =>{ 
        fetchAllDebts();
        const background = document.querySelector('.table-container');
        if (background) {
            if (showForm) {
                background.classList.add('blurred');
            } else {
                background.classList.remove('blurred');
            }
        }
    }, [showForm]);

    // Función para obtener todas las deudas desde la API
    // Realiza una solicitud GET a la API de deudas y actualiza el estado con las deudas obtenidas
    const fetchAllDebts = async () => {
        const token = sessionStorage.getItem('authToken');
        try {
            const response = await client.get('/api/debts', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDebts(response.data);
            console.log('Fetched debts:', response.data);
        } catch (error) {
            console.error('Error while fetching debts', error);
        }
    };

    // Función para manejar la acción de guardar una deuda
    // Actualiza la lista de deudas, limpia el estado de la deuda en edición y oculta el formulario
    const handleSaveDebt = () => {
        fetchAllDebts();
        setDebtToEdit(null);
        setShowForm(false);
    };

    // Función para manejar la eliminación de una deuda
    const handleDeleteDebt = async (debtToDelete) => {
        const endpoint = `/api/debts/${debtToDelete.id}/`;
        try {
            await client.delete(endpoint, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
            });
            console.log(`Debt with ID ${debtToDelete.id} deleted successfully.`);
            // Elimina localmente la transacción del estado
            setDebts((prevDebts) =>
                prevDebts.filter((debt) => debt.id !== debtToDelete.id)
            );
        } catch (error) {
            console.error('Error deleting debt:', error);
        }
    };

    const handleEditDebt = (debt) => {
        setDebtToEdit(debt);
        setShowForm(true);
        fetchAllDebts();
    };

    return (
        <div className="transaction">
            <Navbar handleLogout={handleLogout} />
            <h1>Debts Page</h1>

    
                <div className="table-header-buttons">
                    {/* <SearchBarWithFilter options={options}/> */}
                    <button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ Add Debt'}
                    </button>
                </div>

                <div className="table-container">

                <DebtsTable
                    debts={debts}
                    onEditDebt={handleEditDebt}
                    onDeleteDebt={handleDeleteDebt}
                    isAdmin={isAdmin}
                />
            </div>

            {showForm && <DebtsForm
                onSaveDebt={handleSaveDebt}
                debtToEdit={debtToEdit}
                isAdmin={isAdmin}
            />}
        </div>
    );
};

export default Debts;
