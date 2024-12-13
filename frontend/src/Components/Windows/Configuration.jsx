import React, { useState, useEffect } from 'react';
import Navbar from '../NavBar/Navbar';
import ConfigurationForm from '../Forms/ConfigurationForm.jsx';
import UsernameForm from '../Forms/UsernameForm.jsx';
import EmailForm from '../Forms/EmailForm.jsx';
import PasswordForm from '../Forms/PasswordForm.jsx';
import './Configuration.css';
import client from '../../apiClient.jsx';


const Configuration = ({ handleLogout }) => {
    const [showForm, setShowForm] = useState(false);
    const [showUsernameForm, setShowUsernameForm] = useState(false)
    const [showEmailForm, setShowEmailForm] = useState(false)
    const [showPasswordForm, setShowPasswordForm] = useState(false)
    const [configuration, setConfiguration] = useState(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userId, setUserId] = useState('');

    useEffect(() => {
        const appName = document.querySelector('meta[name="app-name"]').getAttribute('content');
        document.title = `Configuration - ${appName}`;
      }, []);

    // Obtener configuración existente al cargar el componente
    useEffect(() => {
        const fetchConfiguration = async () => {
            try {
                const response = await client.get('/api/configuration', {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
                });
                console.log(response);
                // Acceder a la estructura de la respuesta
                setConfiguration(response.data.configuration);
            } catch (error) {
                console.error('Error fetching configuration:', error);
            }
        };

        const fetchUsername = async () => {
            try {
                const response = await client.get('/api/users', {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
                });
                setUsername(response.data.user.username);
                setUserId(response.data.user.user_id);
                console.log(userId);
            } catch (error) {
                console.error('Error fetching username:', error);
            }
        };

        const fetchUserEmail = async () => {
            try {
                const response = await client.get('/api/users', {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
                });
                //setUsername(response.data.profile.name);
                setEmail(response.data.user.email);
            } catch (error) {
                console.error('Error fetching username:', error);
            }
        };

        const fetchPassword = async () => {
            try {
                const response = await client.get('/api/profile', {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
                });
                setPassword(response.data.profile.bio);
            } catch (error) {
                console.error('Error fetching username:', error);
            }
        };

        fetchConfiguration();
        fetchUsername();
        fetchUserEmail();
        fetchPassword();
    }, []);

    // Manejar actualización de la configuración
    const handleSaveConfiguration = () => {
        setShowForm(false);
        // Volver a cargar la configuración después de guardar
        const fetchConfiguration = async () => {
            try {
                const response = await client.get('/api/configuration', {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
                });
                setConfiguration(response.data.configuration);
            } catch (error) {
                console.error('Error fetching configuration:', error);
            }
        };
        fetchConfiguration();
    };

    const handleUsernameUpdate = () => {
        setShowUsernameForm(false);

        const fetchUsername = async () => {
            try {
                const response = await client.get('/api/users', {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
                });
                setUsername(response.data.user.username);
            } catch (error) {
                console.error('Error fetching username:', error);
            }
        };

        fetchUsername();
    };

    const handleEmailUpdate = () => {
        setShowEmailForm(false);

        const fetchUserEmail = async () => {
            try {
                const response = await client.get('/api/users', {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
                });
                //setUsername(response.data.profile.name);
                setEmail(response.data.user.email);
            } catch (error) {
                console.error('Error fetching email:', error);
            }
        };

        fetchUserEmail();
    };

    const handlePasswordUpdate = () => {
        setShowPasswordForm(false);

        const fetchPassword = async () => {
            try {
                const response = await client.get('/api/users', {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` },
                });
                setPassword(response.data.user.password);
            } catch (error) {
                console.error('Error fetching password:', error);
            }
        };

        fetchPassword();
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
        <div className="configuration">
            <Navbar handleLogout={handleLogout} />
            <h1 >Configuration Page</h1>

            <div className="cards1Container">
                <div className="card1">
                    <h2>Email Sending</h2>
                    <button className="toggle-button" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : 'Edit Configuration'}
                    </button>
                </div>
                <div className="card1">
                    <h2>Username</h2>
                    <button className="toggle-button" onClick={() => setShowUsernameForm(!showUsernameForm)}>
                        {showUsernameForm ? 'Cancel' : 'Change Username'}
                    </button>
                </div>
                <div className="card1">
                    <h2>Email</h2>
                    <button className="toggle-button" onClick={() => setShowEmailForm(!showEmailForm)}>
                        {showEmailForm ? 'Cancel' : 'Change Email'}
                    </button>
                </div>
                <div className="card1">
                    <h2>Password</h2>
                    <button className="toggle-button" onClick={() => setShowPasswordForm(!showPasswordForm)}>
                        {showPasswordForm ? 'Cancel' : 'Change Password'}
                    </button>
                </div>
            </div>

            {showForm && (
                <ConfigurationForm
                    initialData={configuration} // Datos iniciales 
                    onSaveConfiguration={handleSaveConfiguration}
                />
            )}

            {showUsernameForm && (
                <UsernameForm
                    currentUsername={username}
                    onUpdate={handleUsernameUpdate}
                    userId={userId}
                />
            )}
            
            {showEmailForm && (
                <EmailForm
                    currentEmail={email}
                    onUpdate={handleEmailUpdate}
                    userId={userId}
                />
            )}

            {showPasswordForm && (
                <PasswordForm
                    currentPassword={password}
                    onUpdate={handlePasswordUpdate}
                    userId={userId}
                />
            )}
            
        </div>
    );
};

export default Configuration;

