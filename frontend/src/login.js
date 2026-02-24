import React, { useContext, useEffect, useState } from 'react';
import $ from 'jquery';
import { AuthContext } from './AuthContext';


const Login = () => {
    const [email, setEmail] = useState("");
    const [result, setResult] = useState("");
    
    const [accessToken, setaccessToken] = useContext(AuthContext);

    const handleLogin = (e) => {

        e.preventDefault();
        const form = $(e.target);

        $.ajax({
            type: "POST",
            url: form.attr("action"),
            data: form.serialize(),
            success(data) {
                setResult(data);

            }
        });
    };

    return (
        <div className="Login">
            <h2>Login</h2>
            <form 
                action="/api/login.php" 
                method="post"
                onSubmit={(event) => handleLogin(event)}
            >
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="text" id="email" name="email" required/>
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required/>
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