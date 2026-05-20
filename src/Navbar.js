import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthState } from './AuthContext';
import Roles from './Roles';

const Navbar = () => {
    const authState = useAuthState();
    const location = useLocation();

    const getNavItems = () => {
        switch (authState['role']) {
            case Roles.PUBLIC:
                return [
                    { to: '/', label: 'Dashboard' },
                    { to: '/cases', label: 'Cases' },
                    { to: '/profile', label: 'Account' },
                ];
            case Roles.POLICE:
                return [
                    { to: '/police', label: 'Dashboard' },
                    { to: '/profile', label: 'Account' },
                ];
            case Roles.ADMIN:
                return [
                    { to: '/admin', label: 'Dashboard' },
                    { to: '/admin/audit', label: 'Audit' },
                    { to: '/profile', label: 'Account' },
                ];
            default:
                return [
                    { to: '/login', label: 'Login' },
                    { to: '/register', label: 'Sign up' },
                ];
        }
    };

    const navItems = getNavItems();

    return (
        <nav className="bg-[#37323E] shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF7F11] text-white font-bold text-lg mr-3">
                                B
                            </div>
                            <span className="text-white font-semibold text-lg">Bike Registry</span>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                    location.pathname === item.to
                                        ? 'bg-[#FF7F11] text-white'
                                        : 'text-[#DEE5E5] hover:text-white hover:bg-[#6D6A75]'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;