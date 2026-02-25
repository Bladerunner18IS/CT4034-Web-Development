import React, { useContext, useEffect, useState } from 'react';
import $ from 'jquery';
import { AuthContext } from './AuthContext';


const Login = () => {
    const [formData, setformData] = useState({
        email: '',
        password: '',
    });

    const [result, setresult] = useState("");
    const [accessToken, setaccessToken] = useContext(AuthContext);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setformData({
            ...formData,
            [name]: value,
        });
    };

    const handleLogin = (e) => {

        e.preventDefault();

        $.ajax({
            type: "POST",
            url: "api/login.php",
            data: JSON.stringify(formData),
            contentType: "application/json",
            traditional: true,
            success(data) {
                setaccessToken({
                    token: data['token'],
                    expiry: Date.now() + data['expires_in']
                });
            },
            error(data) {
                setresult({data});
                
            },
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
}

export default Login;