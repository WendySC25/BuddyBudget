import React, { useState } from 'react';
import './LoginRegister.css';
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import axios from 'axios';


axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

const client = axios.create({
    baseURL: "http://127.0.0.1:8000"
});

const LoginRegister = () => {
    const [action, setAction] = useState(''); // login/register
    const [currentUser, setCurrentUser] = useState();
    const [email, setEmail] = useState(''); 
    const [username, setUsername] = useState(''); 
    const [password, setPassword] = useState(''); 
    const [errorMessage, setErrorMessage] = useState(''); // error

    const registerLink = () => {
        setAction(' active');
    };

    const loginLink = () => {
        setAction('');
    };

    const submitRegistration = (e) => {
        e.preventDefault();
        client.post("/api/register", {
            email: email,
            username: username,
            password: password
        })
        .then(res => {
            
            return client.post("/api/login", {
                email: email,
                password: password
            });
        })
        .then(res => {
            console.log("Registration successful:", res.data);
            setAction(false);   
           
        })
        .catch(error => {
            setErrorMessage("Registration failed: " + error.response.data.detail || error.message);
            console.error("Registration error:", error);
        });
    };



    const submitLogin = (e) => {
        e.preventDefault();
        client.post("/api/login", {
            email: email,
            password: password
        })
        .then(res => {
            console.log("Login successful:", res.data);
            setCurrentUser(true);   
            
        })
        .catch(error => {
            setErrorMessage("Login failed: " + error.response.data.detail || error.message);
            console.error("Login error:", error);
        });
    };

    const submitLogout = (e) => {
        e.preventDefault();
        client.post("/api/logout", { withCredentials: true })
            .then(res => {
                console.log("Logout successful:", res.data);
                setCurrentUser(false); 
            })
            .catch(error => {
                console.error("Logout error:", error);
            });
    };

    if (currentUser) {
        return (
            <div>
                <h1 style={{ color: 'white' }}>You're logged in!</h1>
                <button onClick={submitLogout}>Logout</button> 
            </div>
        );
    }

    return (
        <div className={`wrapper${action}`}>
            <div className="form-box login">
                <form onSubmit={submitLogin}>
                    <h1>Login</h1>
                    <div className="input-box">
                        <input type="email" placeholder='Email' value={email} onChange={e => setEmail(e.target.value)} required />
                        <FaEnvelope className='icon' />
                    </div>
                    <div className="input-box">
                        <input type="password" placeholder='Password' value={password} onChange={e => setPassword(e.target.value)} required />
                        <FaLock className='icon' />
                    </div>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    <button type="submit">Login</button>
                    <div className="register-link">
                        <p>Don't have an account? <a href="#" onClick={registerLink}>Register</a></p>
                    </div>
                </form>
            </div>

            {/* Second screen */}
            <div className="form-box register">
                <form onSubmit={submitRegistration}>
                    <h1>Registration</h1>
                    <div className="input-box">
                        <input type="text" placeholder='Username' value={username} onChange={e => setUsername(e.target.value)} required />
                        <FaUser className='icon' />
                    </div>
                    <div className="input-box">
                        <input type="email" placeholder='Email' value={email} onChange={e => setEmail(e.target.value)} required />
                        <FaEnvelope className='icon' />
                    </div>
                    <div className="input-box">
                        <input type="password" placeholder='Password' value={password} onChange={e => setPassword(e.target.value)} required />
                        <FaLock className='icon' />
                    </div>
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    <button type="submit">Register</button>
                    <div className="register-link">
                        <p>Already have an account? <a href="#" onClick={loginLink}>Login</a></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginRegister;
