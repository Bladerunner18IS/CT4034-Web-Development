import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthState } from './AuthContext';


const PrivateRoute = () => {

    const authState = useAuthState();

    return (
        (authState['loggedIn']
            ? <Outlet />
            : <Navigate to='/login' />)
    );
};

export default PrivateRoute;