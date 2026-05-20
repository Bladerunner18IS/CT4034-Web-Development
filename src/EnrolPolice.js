import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './Api';

const EnrolPolice = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!name || !email || !password) {
            setError('Name, email and password are required');
            return;
        }
        setLoading(true);
        try {
            const body = { name, email, password, role: 'police' };
            await api.post('/users', body);
            navigate('/admin');
        } catch (err) {
            console.error('enrol police', err);
            setError(err.response?.data?.message || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-[#F6F8F9]">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="rounded-3xl bg-white border border-[#DEE5E5] p-8 shadow-sm">
                    <h1 className="text-2xl font-bold text-[#37323E]">Enrol police officer</h1>
                    <p className="mt-1 text-sm text-[#6D6A75]">Create a new police account.</p>
                </div>

                <form onSubmit={handleSubmit} className="rounded-3xl bg-white border border-[#DEE5E5] p-6 shadow-sm">
                    {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-[#37323E]">Full name</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-2xl border px-4 py-2" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-[#37323E]">Email</label>
                        <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-2xl border px-4 py-2" type="email" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-[#37323E]">Password</label>
                        <input value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-2xl border px-4 py-2" type="password" />
                    </div>

                    <div className="flex gap-3">
                        <button type="submit" disabled={loading} className="rounded-2xl bg-[#FF7F11] px-4 py-2 text-white font-semibold">{loading ? 'Creating…' : 'Create police account'}</button>
                        <button type="button" onClick={() => navigate('/admin')} className="rounded-2xl border px-4 py-2">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EnrolPolice;
