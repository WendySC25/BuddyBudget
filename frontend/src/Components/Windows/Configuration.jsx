import React, { useState, useEffect } from 'react';
import Navbar from '../NavBar/Navbar';
import ConfigurationForm from '../Forms/ConfigurationForm.jsx';
import './Transactions.css';
import client from '../../apiClient.jsx';

const Configuration = ({ handleLogout }) => {
    const [showForm, setShowForm] = useState(false);
    const [configuration, setConfiguration] = useState(null);

    // Obtener configuración existente al cargar el componente
    useEffect(() => {
        const fetchConfiguration = async () => {
            try {
                const response = await client.get('/api/configuration', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
                });
                console.log(response);
                // Acceder a la estructura de la respuesta
                setConfiguration(response.data.configuration);
            } catch (error) {
                console.error('Error fetching configuration:', error);
            }
        };

        fetchConfiguration();
    }, []);

    // Manejar actualización de la configuración
    const handleSaveConfiguration = () => {
        setShowForm(false);
        // Volver a cargar la configuración después de guardar
        const fetchConfiguration = async () => {
            try {
                const response = await client.get('/api/configuration', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
                });
                setConfiguration(response.data.configuration);
            } catch (error) {
                console.error('Error fetching configuration:', error);
            }
        };
        fetchConfiguration();
    };

    const getSendTimeText = (sendTime) => {
      switch (sendTime) {
          case 'MON':
              return 'Monthly';
          case 'WEK':
              return 'Weekly';
          case 'FOR':
              return 'Fortnight';
          case 'DAY':
              return 'Daily';
          default:
              return sendTime || 'Unknown'; // Devuelve el valor por defecto o 'Unknown' si no coincide
      }
    };

    return (
        <div className="transaction">
            <Navbar handleLogout={handleLogout} />
            <h1>Configuration Page</h1>
            
            <h2 style={{ marginTop: '20px' }}>Email Sending Configuration</h2>
  

            {/* Contenedor principal */}
            <div className="table-container">

              {/* Mostrar detalles de configuración si la información existe */}
              {configuration && (
                  <div className="configuration-details">
                      <p><strong>Send Time:</strong> {getSendTimeText(configuration?.send_time)}</p>
                      <p><strong>Add Graph:</strong> {configuration?.add_graph ? 'Yes' : 'No'}</p>
                      <p><strong>Send At:</strong> {configuration?.send_at}</p>
                  </div>
              )}

              {/* Botón para alternar la edición */}
              <button className="toggle-button" onClick={() => setShowForm(!showForm)}>
                  {showForm ? 'Cancel' : 'Edit Configuration'}
              </button>
            </div>

            {showForm && (
                <ConfigurationForm
                    initialData={configuration} // Datos iniciales 
                    onSaveConfiguration={handleSaveConfiguration}
                />
            )}
        </div>
    );
};

export default Configuration;

