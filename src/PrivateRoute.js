import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';


const PrivateRoute = ({ component: Component, ...rest}) => {
    const { authenticated } = useAuth()

    return (
        <Route
            {...rest}
            render={props =>
                authenticated ? <Component {...props} /> : <Navigate to='login' />
            }
        />
    );
};

export default PrivateRoute;