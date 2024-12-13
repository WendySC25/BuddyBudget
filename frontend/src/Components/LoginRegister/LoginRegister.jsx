import React, { useState } from 'react';
import './LoginRegister.css';
import { FaUser, FaLock, FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from 'axios';
import { useEffect } from 'react';

// Axios configuration for http requests
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

const client = axios.create({
    baseURL: "http://127.0.0.1:8000"
});

const LoginRegister = ({ handleLogin }) => {
    const [action, setAction] = useState(''); //login/register
    const [currentUser, setCurrentUser] = useState();
    const [email, setEmail] = useState(''); 
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState(''); 
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false); // useState for password visibility
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Visibility for confirm password

    useEffect(() => {
        const appName = document.querySelector('meta[name="app-name"]').getAttribute('content');
        document.title = `Login & Register - ${appName}`;
      }, []);

    const registerLink = () => {
        setAction(' active');
        setErrorMessage(''); // Clear error message when switching to registration
    };

    const loginLink = () => {
        setAction('');
        setErrorMessage(''); // Clear error message when switching to login
    };

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

    // Registration methods 
    const submitRegistration = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match");
            return;
        }
        // Password conditions
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/;
        if (!passwordRegex.test(password)) {
            setErrorMessage("Password must be at least 5 characters long with letters and numbers.");
            return;
        }
        // Registration request
        client.post("/api/register", {
            email: email,
            username: username,
            password: password
        })
        .then(() => {
            setErrorMessage("Registration successful");
            loginLink(); // Switch to login forme
            
        })
        .catch(error => {
            // Handle specific registration errors
            const errorMessage = error.response?.data?.detail || "";
            setErrorMessage(`Registration Failed: ${errorMessage}`);
            console.error(`Registration Failed: ${errorMessage}`);
        });
    };


    const submitLogin = (e) => {
        e.preventDefault();
        console.log("Login try...");
        client.post("/api/token/", { email, password })
        .then(res => {
            console.log("Server Answer:", res);  // Verify the server answer
            const token = res.data.access;
            console.log("Acces Token:", token); // print token in console
            localStorage.setItem('token', token);
            handleLogin(token); // Pass username and token
        })
        .catch(error => {
            // Handle specific login errors
            const errorMessage = error.response?.data?.detail || "";
            setErrorMessage(`Login Failed: ${errorMessage}`);
        });
    };

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
                        <input type={showPassword ? "text" : "password"} placeholder='Password' value={password} onChange={e => setPassword(e.target.value)} required />
                        {showPassword ? (
                            <FaEye className="toggle-password" onClick={togglePasswordVisibility} />
                        ) : (
                            <FaEyeSlash className="toggle-password" onClick={togglePasswordVisibility} />
                        )}
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
                        <input type={showPassword ? "text" : "password"} placeholder='Password' value={password} onChange={e => setPassword(e.target.value)} required />
                        {showPassword ? (
                            <FaEye className="toggle-password" onClick={togglePasswordVisibility} />
                        ) : (
                            <FaEyeSlash className="toggle-password" onClick={togglePasswordVisibility} />
                        )}
                    </div>
                    <div className="input-box">
                        <input type={showConfirmPassword ? "text" : "password"} placeholder='Confirm Password' value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                        {showConfirmPassword ? (
                            <FaEye className="toggle-password" onClick={toggleConfirmPasswordVisibility} />
                        ) : (
                            <FaEyeSlash className="toggle-password" onClick={toggleConfirmPasswordVisibility} />
                        )}
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
