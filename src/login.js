import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from './Api';


const Login = () => {

    const [formData, setformData] = useState({
        email: '',
        password: '',
    });

    const [result, setresult] = useState("");
    const [authContext, setauthContext] = useAuth();

    useEffect(() => {
        console.log(authContext['token']);
    }, [authContext]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setformData({
            ...formData,
            [name]: value,
        });
    };

    const handleLogin = (e) => {

        e.preventDefault();

        api.post("/login", formData)
        .then(() => {
            api.get("refresh")
            .then(response => {
                setauthContext({
                    loggedIn: true,
                    accessToken: response.data['token']
                });
                window.location.href("/");
            });
        })
        .catch(error => {
            console.log('Error', error.message);
        });
    };

    

    return (
        <div className="Login">
            <h2>Login</h2>
            <form 
                onSubmit={handleLogin}
            >
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="text" name="email" value={formData.email} onChange={handleChange} required/>
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required/>
                </div>
                <div class="form-group">
                    <input type="submit" value="Login"/>
                </div>
            </form>
            <h1>{result}</h1>
        </div>
    );
};

export default Login;