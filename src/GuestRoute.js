import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthState } from './AuthContext';


const GuestRoute = () => {

    const authState = useAuthState();

    return (
        (!authState['loggedIn']
            ? <Outlet />
            : <Navigate to='/' />)
    );
};

export default GuestRoute;