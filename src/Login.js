import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from './Api';
import Roles from './Roles'
import Cookies from 'js-cookie';


const Login = () => {

    const [formData, setformData] = useState({
        email: '',
        password: '',
    });

    const [errors, seterrors] = useState({});
    const [response, setresponse] = useState("");
    const [authContext, setauthContext] = useAuth();
    

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
            api.post("refresh")
            .then(response => {
                var role = Cookies.get('role');
                setauthContext({
                    role: Roles.isValid(role) ? role : Roles.GUEST,
                    accessToken: response.data['token']
                });
                window.location.href = "/";
            });
        })
        .catch(error => {
            if (error.response) {
                if (error.response.data.message) {
                    setresponse(error.response.data.message);
                    seterrors({});
                } else if (error.response.data.validation_errors) {
                    setresponse("");
                    seterrors(error.response.data.validation_errors);
                } 

            } else {
                console.log('Error', error.message);
            }
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
                    {errors.email && <span className='error'>{errors.email}</span>}
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required/>
                    {errors.password && <span className='error'>{errors.password}</span>}
                </div>
                <div class="form-group">
                    <input type="submit" value="Login"/>
                    {response && <span className='response'>{response}</span>}
                </div>
            </form>
        </div>
    );
};

export default Login;