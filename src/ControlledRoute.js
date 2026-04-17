import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthState } from './AuthContext';
import Roles from './Roles';


const ControlledRoute = ({roles}) => {

    const authState = useAuthState();

    const routeRoles = Array.isArray(roles) ? roles : [roles];

    return (
        (routeRoles.includes(authState.role)
            ? <Outlet />
            : <Navigate to={Roles.homepage(authState.role)} />)
    );
};

export default ControlledRoute;