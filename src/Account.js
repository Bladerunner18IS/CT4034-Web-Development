import React from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import api from './Api';
import { useDataState } from './DataContext';
import { useAuth } from './AuthContext';
import Roles from './Roles';

const Account = () => {
    const userData = useDataState();
    const [authContext, setauthContext] = useAuth();
    const navigate = useNavigate();

    const user = userData?.user;

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.log('logout error', error);
        } finally {
            Cookies.remove('role');
            setauthContext({ role: Roles.GUEST, accessToken: null });
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-[#DEE5E5] py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-8">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#37323E]">Account</h1>
                        <p className="mt-2 text-sm text-[#6D6A75]">
                            Review your account details.
                        </p>
                    </div>
                </div>

                <div className="mt-8 space-y-6">
                    {user ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="rounded-lg border border-slate-200 p-4">
                                <p className="text-sm font-semibold text-[#37323E]">Name</p>
                                <p className="mt-2 text-base text-[#4A4A4A]">{user.name || 'Not available'}</p>
                            </div>
                            <div className="rounded-lg border border-slate-200 p-4">
                                <p className="text-sm font-semibold text-[#37323E]">Email</p>
                                <p className="mt-2 text-base text-[#4A4A4A]">{user.email || 'Not available'}</p>
                            </div>
                            {user.type && user.type != "public" && (
                                <div className="rounded-lg border border-slate-200 p-4 sm:col-span-2">
                                    <p className="text-sm font-semibold text-[#37323E]">Role</p>
                                    <p className="mt-2 text-base text-[#4A4A4A]">{user.type.replace(/^./, char => char.toUpperCase())}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-6">
                            <p className="text-sm text-yellow-700">
                                You are viewing this page as a guest. Sign in to see your account details.
                            </p>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-8 inline-flex items-center justify-center rounded-md bg-[#DE9E36] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#c6841f] focus:ring-2 focus:ring-[#DE9E36] focus:ring-offset-2"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Account;
