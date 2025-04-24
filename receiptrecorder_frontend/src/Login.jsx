import React, {useState} from 'react';
import { useNavigate } from "react-router-dom";

import axios from "axios";

function Login(){
    const URL = process.env.REACT_APP_API_URL;
    const TOKEN_EXPIRETIME = 5 * 60000;

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [warning, setWarning] = useState("");
    const navigate = useNavigate();
    
    function handleLogin(e) {
        e.preventDefault();
        axios.post(URL+ "token/", {
            'username': username,
            'password': password
        }).then(
            response => {
                console.log(response);
                sessionStorage.setItem('access', 'Bearer ' + response.data.access);
                sessionStorage.setItem('accessExpire', Date.now() + TOKEN_EXPIRETIME);
                sessionStorage.setItem('refresh', response.data.refresh);
                navigate("/");
            }
        ).catch(error => {
            console.log(error);
            setWarning("User name doesn't match with password.");
        });
    }

    function clearInputs() {
        setConfirmPassword("");
        setPassword("");
        setUsername("");
        setWarning("");
    }

    function showRegister(e) {
        e.preventDefault();
        clearInputs();
        const loginPane = document.querySelector("#loginPane");
        loginPane.classList.remove("d-flex");
        loginPane.classList.add("d-none");

        const registerPane = document.querySelector("#registerPane");
        registerPane.classList.remove("d-none");
        registerPane.classList.add("d-flex");
    }

    function showLogin(e) {
        e.preventDefault();
        clearInputs();
        const loginPane = document.querySelector("#loginPane");
        loginPane.classList.add("d-flex");
        loginPane.classList.remove("d-none");

        const registerPane = document.querySelector("#registerPane");
        registerPane.classList.add("d-none");
        registerPane.classList.remove("d-flex");
    }

    function handleRegister(e) {
        e.preventDefault();
        if (password !== confirmPassword) {
            setWarning("Password not matching with confirm.");
            return;
        }

        axios.post(URL + "register/", {
            'username': username,
            'password': password
        }).then(
            response => {
                if (response.status === 201) {
                    handleLogin(e);
                }
            }
        ).catch(error => {
            setWarning("Invalid user name.");
        });
    }

    return <>
        <div id='loginPane' className={'d-flex justify-content-center align-items-center flex-column'} style={{height:"100vh"}}>
                <label>
                    User Name <input type='text' name='userName' value={username} onChange={(e) => setUsername(e.target.value)} />
                </label>
                <label>
                    Password <input type='password' name='password' value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>
                <p className='text-danger'>{warning}</p>
                <div>
                    <button onClick={(e) => handleLogin(e)} className='btn btn-primary mr-3'>Login</button>
                    <button onClick={(e) => showRegister(e)} className='btn btn-secondary mr-3'>Register</button>
                    
                </div>
                <div className='mt-2'>
                    <button onClick={() => {navigate("/");}} className='btn btn-link mr-3'>Continue as a guest</button>
                </div>
                
        </div>
        <div id='registerPane' className='d-none justify-content-center align-items-center flex-column' style={{height:"100vh"}}>
                <label>
                    User Name <input type='text' name='userName' value={username} onChange={(e) => setUsername(e.target.value)} />
                </label>
                <label>
                    Password <input type='password' name='password' value={password} onChange={(e) => setPassword(e.target.value)} />
                </label>
                <label>
                    Confirm Password <input type='password' name='confirmPassword' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </label>
                <p className='text-danger'>{warning}</p>
                <div>
                    <button onClick={(e) => handleRegister(e)} className='btn btn-primary mr-3'>Register</button>
                    <button onClick={(e) => showLogin(e)} className='btn btn-secondary mr-3'>Login</button>
                </div>
        </div>
    </>
}

export default Login