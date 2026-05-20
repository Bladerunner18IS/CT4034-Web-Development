import React, { useEffect, useState } from 'react';
import api from './Api';
import { useDataState, useData, requestCases, requestBikes, requestUser } from './DataContext';

const Cases = () => {
    const dataState = useDataState();
    const [dataContext, setDataContext] = useData();
    const [expanded, setExpanded] = useState({});
    const [logs, setLogs] = useState({});
    const [reporting, setReporting] = useState(false);
    const [reportMsg, setReportMsg] = useState('');
    const [selectedBikeId, setSelectedBikeId] = useState(null);
    const [notes, setNotes] = useState('');

    const toggleExpand = async (caseId) => {
        setExpanded(prev => ({ ...prev, [caseId]: !prev[caseId] }));
        if (!logs[caseId]) {
            try {
                const resp = await api.get(`/cases/${caseId}/logs`);
                setLogs(prev => ({ ...prev, [caseId]: resp.data }));
            } catch (err) {
                console.log('Failed to load logs', err);
                setLogs(prev => ({ ...prev, [caseId]: [] }));
            }
        }
    };

    const handleReport = async () => {
        if (!selectedBikeId) {
            setReportMsg('Please select a bike to report');
            return;
        }
        setReporting(true);
        setReportMsg('');
        try {
            const payload = { bike_id: Number(selectedBikeId), description: notes };
            await api.post('/cases', payload);
            setReportMsg('Reported successfully');
            // refresh cases
            const [c, bikesResp, userResp] = await Promise.all([requestCases(), requestBikes(), requestUser()]);
            const bikesArray = Array.isArray(bikesResp) ? bikesResp : Object.values(bikesResp || {});
            const casesArray = Array.isArray(c) ? c : Object.values(c || {});
            setDataContext({ ...dataContext, bikes: bikesArray, cases: casesArray, user: userResp });
            setSelectedBikeId(null);
            setNotes('');
        } catch (err) {
            console.log('report error', err);
            setReportMsg('Unable to report case');
        } finally {
            setReporting(false);
        }
    };

    const userBikes = dataState?.bikes || [];
    const cases = dataState?.cases || [];
    const openCaseBikeIds = new Set(cases.filter((c) => c.case_status === 'open').map((c) => c.bike_id));
    const availableBikes = userBikes.filter((b) => !openCaseBikeIds.has(b.bike_id));

    return (
        <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-[#DEE5E5]">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-[#37323E]">Cases</h1>
                <p className="mt-2 text-sm text-[#6D6A75]">View your cases and their log entries.</p>

                <div className="mt-6 space-y-4">
                    {!cases || cases.length === 0 && <p className="text-sm text-[#6D6A75]">No cases found.</p>}
                    {cases && cases.length > 0 && cases.map((c, index) => {
                        const caseNumber = index + 1;
                        const bike = (dataState?.bikes || []).find(b => Number(b.bike_id) === Number(c.bike_id));
                        const bikeModel = bike?.model || `Bike #${c.bike_id}`;

                        const logsList = logs[c.case_id] || [];

                        return (
                            <div key={c.case_id} className="bg-white rounded-lg p-4 shadow cursor-pointer" onClick={() => toggleExpand(c.case_id)}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-[#6D6A75]">Case {caseNumber} • {bikeModel}</p>
                                        <p className="mt-1 text-lg font-semibold text-[#37323E]">Status: {c.case_status}</p>
                                        <p className="text-sm text-[#6D6A75]">Opened: {c.date_opened}</p>
                                    </div>
                                    <div className="text-sm text-[#DE9E36]">
                                        <span className={`inline-block transform transition-transform duration-200 ${expanded[c.case_id] ? 'rotate-180' : 'rotate-0'}`}>
                                            ▼
                                        </span>
                                    </div>
                                </div>

                                {expanded[c.case_id] && (
                                    <div className="mt-4 border-t pt-4">
                                        {(!logsList || logsList.length === 0) ? (
                                            <p className="text-sm text-[#6D6A75]">No log entries.</p>
                                        ) : (
                                            <div className="relative pl-10">
                                                <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
                                                {(() => {
                                                    const sorted = [...logsList].sort((a, b) => new Date(a.submission_timestamp) - new Date(b.submission_timestamp));
                                                    return sorted.map((log, idx) => {
                                                        const prevStatus = idx > 0 ? sorted[idx - 1].new_status : null;

                                                        let label = null;
                                                        if (log.new_status !== prevStatus) {
                                                            if (log.new_status === 'open') {
                                                                label = prevStatus === 'closed' ? 'Case reopened' : 'Case opened';
                                                            } else if (log.new_status === 'closed') {
                                                                label = 'Case closed';
                                                            } else {
                                                                label = log.new_status.charAt(0).toUpperCase() + log.new_status.slice(1);
                                                            }
                                                        }

                                                        return (
                                                            <div key={log.log_id} className="relative mb-8 last:mb-0">
                                                                <div className="absolute -left-1.5 top-2 h-3 w-3 rounded-full bg-[#DE9E36] border-2 border-white shadow" />
                                                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                                                                    <div className="flex items-center justify-between gap-4">
                                                                        <p className="text-sm font-semibold text-[#37323E]">{log.submission_timestamp}</p>
                                                                        {label ? (
                                                                            <span className="rounded-full bg-[#DE9E36] px-3 py-1 text-xs font-semibold text-white">{label}</span>
                                                                        ) : (
                                                                            <span className="text-sm text-[#6D6A75]">&nbsp;</span>
                                                                        )}
                                                                    </div>
                                                                    <p className="mt-2 text-sm text-[#4A4A4A]">{log.description}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 bg-white rounded-lg p-6 shadow">
                    <h2 className="text-xl font-semibold text-[#37323E]">Report a stolen bike</h2>
                    <p className="mt-1 text-sm text-[#6D6A75]">Choose one of your registered bikes and submit a report.</p>

                    <div className="mt-4">
                        {userBikes.length === 0 ? (
                            <p className="text-sm text-[#6D6A75]">You have no registered bikes.</p>
                        ) : (
                            <div className="space-y-2">
                                <select value={selectedBikeId || ''} onChange={(e) => setSelectedBikeId(e.target.value ? Number(e.target.value) : null)} className="w-full rounded border px-3 py-2">
                                    <option value="">Select a bike</option>
                                    {availableBikes.map(b => (
                                        <option key={b.bike_id} value={b.bike_id}>{b.brand} {b.model}</option>
                                    ))}
                                </select>

                                {availableBikes.length === 0 && (
                                    <p className="text-sm text-red-600 mt-2">All your bikes already have an open case.</p>
                                )}

                                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes (location, time, description)" className="w-full rounded border px-3 py-2 mt-2" />

                                <div className="flex items-center justify-end mt-4">
                                    <button disabled={reporting} onClick={handleReport} className="inline-flex items-center justify-center rounded bg-[#FF7F11] px-4 py-2 text-white">
                                        {reporting ? 'Reporting…' : 'Report stolen'}
                                    </button>
                                </div>

                                {reportMsg && <p className="mt-2 text-sm text-[#37323E]">{reportMsg}</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cases;
