import React, { useState } from 'react';
import api from './Api';

const Register = () => {

    const [formData, setformData] = useState({
            email: '',
            name: '',
            password: '',
        });

    const [errors, seterrors] = useState({});
    const [response, setresponse] = useState("");


    const handleChange = (e) => {
        const { name, value } = e.target;
        setformData({
            ...formData,
            [name]: value,
        });
    };

    const handleRegister = (e) => {

        e.preventDefault();

        api.post("/register", formData)
        .then(response => {
            setresponse(response.data.message)
            setTimeout(() => {
                window.location.href = "/login";
            }, 2000);
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
        <div class="container">
            <h2>Public Registration</h2>
            <form
                onSubmit={handleRegister}
            >
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="text" name="email" value={formData.email} onChange={handleChange} required/>
                    {errors.email && <span className='error'>{errors.email}</span>}
                </div>
                <div class="form-group">
                    <label for="name">Name:</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required/>
                    {errors.name && <span className='error'>{errors.name}</span>}
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required/>
                    {errors.password && <span className='error'>{errors.password}</span>}
                </div>
                <div class="form-group">
                    <input type="submit" value="Register"/>
                    {response && <span className='error'>{response}</span>}
                </div>
            </form>
        </div>
    );
};

export default Register;