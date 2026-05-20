import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from './Api';
import { useAuthState } from './AuthContext';


const typeOptions = [
    { value: 'public', label: 'Public' },
    { value: 'police', label: 'Police' },
    { value: 'admin', label: 'Admin' },
    { value: 'all', label: 'All' },
];

const AdminDashboard = () => {
    const authState = useAuthState();
    const [users, setUsers] = useState([]);
    const [typeFilter, settypeFilter] = useState('police');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editForms, setEditForms] = useState({});


    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {};
            params.type = typeFilter;
            if (search) params.search = search;

            const resp = await api.get('/users', { params });
            const list = Array.isArray(resp.data) ? resp.data : resp.data?.users || [];
            setUsers(list.sort((a, b) => (a.name || '').localeCompare(b.name || '')));
        } catch (err) {
            console.error('fetchUsers', err);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [typeFilter]);

    const handleSearch = async (e) => {
        setSearch(e.target.value);
        // debounce could be added; keep simple and refetch
        try {
            const params = {};
            params.type = typeFilter;
            if (e.target.value) params.search = e.target.value;
            const resp = await api.get('/users', { params });
            const list = Array.isArray(resp.data) ? resp.data : resp.data?.users || [];
            setUsers(list.sort((a, b) => (a.name || '').localeCompare(b.name || '')));
        } catch (err) {
            console.error('search users', err);
        }
    };

    const startEdit = (u) => {
        setEditingId(u.user_id);
        setEditForms({
            ...editForms,
            [u.user_id]: {
                name: u.name || '',
                email: u.email || '',
                type: u.type || 'public'
            }
        });
    };


    const cancelEdit = () => {
        setEditingId(null);
    };


    const saveEdit = async (id) => {
        try {
            const form = editForms[id];
            const body = { name: form.name, email: form.email };

            if (['police', 'public'].includes(form.type)) {
                body.type = form.type;
            }

            await api.put(`/users/${id}`, body);
            await fetchUsers();
            cancelEdit();
        } catch (err) {
            console.error(err);
            alert('Failed to save user');
        }
    };


    const deleteUser = async (u) => {
        if (u.type === 'admin') {
            alert('Cannot delete admin accounts from this interface.');
            return;
        }
        if (!window.confirm(`Delete user ${u.name || u.email}? This cannot be undone.`)) return;
        try {
            await api.delete(`/users/${u.user_id}`);
            await fetchUsers();
        } catch (err) {
            console.error('deleteUser', err);
            alert('Failed to delete user');
        }
    };

    return (
        <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-[#F6F8F9]">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="rounded-3xl bg-white border border-[#DEE5E5] p-8 shadow-sm flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-[#37323E]">Admin dashboard</h1>
                        <p className="mt-1 text-sm text-[#6D6A75]">Manage user accounts and enrol police officers.</p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/admin/enrol-police" className="inline-flex items-center rounded-2xl bg-[#FF7F11] px-4 py-2 text-white font-semibold">Enrol Police</Link>
                    </div>
                </div>

                <div className="rounded-3xl bg-white border border-[#DEE5E5] p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <label className="text-sm font-medium text-[#37323E]">type</label>
                        <select value={typeFilter} onChange={(e) => settypeFilter(e.target.value)} className="rounded-2xl border px-3 py-2">
                            {typeOptions.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>

                        <div className="flex-1">
                            <input
                                type="search"
                                value={search}
                                onChange={handleSearch}
                                placeholder="Search by name, email or id"
                                className="w-full rounded-2xl border border-gray-300 px-4 py-2"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-sm text-[#6D6A75]">Name</th>
                                    <th className="px-4 py-3 text-sm text-[#6D6A75]">Email</th>
                                    <th className="px-4 py-3 text-sm text-[#6D6A75]">Role</th>
                                    <th className="px-4 py-3 text-sm text-[#6D6A75]">Created</th>
                                    <th className="px-4 py-3 text-sm text-[#6D6A75]">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} className="px-4 py-6 text-sm text-[#6D6A75]">Loading...</td></tr>
                                ) : users.length === 0 ? (
                                    <tr><td colSpan={5} className="px-4 py-6 text-sm text-[#6D6A75]">No users found.</td></tr>
                                ) : (
                                    users.map((u) => (
                                        <tr key={u.user_id} className="border-t">
                                            <td className="px-4 py-3">
                                                {editingId === u.user_id ? (
                                                    <input
                                                        value={editForms[u.user_id]?.name || ''}
                                                        onChange={(e) =>
                                                            setEditForms({
                                                                ...editForms,
                                                                [u.user_id]: { ...editForms[u.user_id], name: e.target.value }
                                                            })
                                                        }
                                                        className="rounded-md border px-2 py-1"
                                                    />
                                                ) : (
                                                    u.name || '—'
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {editingId === u.user_id ? (
                                                    <input 
                                                        value={editForms[u.user_id]?.email || ''}
                                                        onChange={(e) => 
                                                            setEditForms({
                                                                ...editForms, 
                                                                [u.user_id]: { ...editForms[u.user_id], email: e.target.value }
                                                            })
                                                        }
                                                        className="rounded-md border px-2 py-1" 
                                                    />
                                                ) : (
                                                    u.email || '—'
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {editingId === u.user_id ? (
                                                    <select
                                                        value={editForms[u.user_id]?.type || 'police'}
                                                        onChange={(e) =>
                                                            setEditForms({
                                                                ...editForms,
                                                                [u.user_id]: {
                                                                    ...editForms[u.user_id],
                                                                    type: e.target.value
                                                                }
                                                            })
                                                        }
                                                        className="rounded-md border px-2 py-1"
                                                    >
                                                        <option value="police">Police</option>
                                                        <option value="public">Public</option>
                                                    </select>
                                                ) : (
                                                    (u.type || 'N/A').toUpperCase()
                                                )}
                                            </td>

                                            <td className="px-4 py-3 text-sm text-[#6D6A75]">{u.created_at ? new Date(u.created_at).toLocaleString() : '—'}</td>
                                            <td className="px-4 py-3">
                                                {editingId === u.user_id ? (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => saveEdit(u.user_id)} className="px-3 py-1 bg-[#FF7F11] text-white rounded-md">Save</button>
                                                        <button onClick={cancelEdit} className="px-3 py-1 border rounded-md">Cancel</button>
                                                    </div>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        {u.type !== 'admin' && (
                                                            <>
                                                                <button
                                                                    onClick={() => startEdit(u)}
                                                                    disabled={editingId !== null}
                                                                    className={`px-3 py-1 border rounded-md ${editingId !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                >
                                                                    Edit
                                                                </button>

                                                                <button
                                                                    onClick={() => deleteUser(u)}
                                                                    disabled={editingId !== null}
                                                                    className={`px-3 py-1 border rounded-md text-red-600 ${editingId !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                >
                                                                    Delete
                                                                </button>

                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
