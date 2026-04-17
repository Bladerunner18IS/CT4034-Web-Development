import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthState } from './AuthContext';
import Roles from './Roles'; 

const Navbar = () => {

    const authState = useAuthState();

    switch (authState['role']) {
        case Roles.PUBLIC:
            return (
                <nav>
                    <Link to="/">Dashboard</Link>
                    <Link to="/cases">Cases</Link>
                    <Link to="/profile">Account</Link>
                </nav>
            );

        case Roles.POLICE:
            return (
                <nav>
                    <Link to="/police">Dashboard</Link>
                    <Link to="/police/cases">Cases</Link>
                    <Link to="/profile">Account</Link>
                </nav>
            );

        case Roles.ADMIN:
            return (
                <nav>
                    <Link to="/admin">Dashboard</Link>
                    <Link to="/admin/users">Users</Link>
                    <Link to="/admin/cases">Audit</Link>
                    <Link to="/admin/data">Database</Link>
                    <Link to="/profile">Account</Link>
                </nav>
            );

        default:
            return (
                <nav>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Sign up</Link>
                </nav>
            );
    };
};

export default Navbar;