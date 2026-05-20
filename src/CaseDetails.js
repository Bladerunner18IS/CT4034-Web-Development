import React, { useEffect, useMemo, useState, createRef, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import api from './Api';
import { useDataState, useData, requestCases } from './DataContext';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const formatDate = (value) => {
    if (!value) return 'Unknown';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const CaseDetails = () => {
    const [searchParams] = useSearchParams();
    const caseReference = searchParams.get('ref');

    const dataState = useDataState();
    const [, setDataContext] = useData();

    const [bikes, setBikes] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [printing, setPrinting] = useState(false);
    const [description, setDescription] = useState('');
    const [newStatus, setNewStatus] = useState('open');
    const [message, setMessage] = useState('');

    const type = dataState.user?.type || 'police';
    const headerRef = useRef(null);
    const bodyRef = useRef(null);

    const caseObj = useMemo(() => {
        if (!caseReference) return null;
        return (dataState?.cases || []).find((item) => String(item.reference) === String(caseReference)) || null;
    }, [caseReference, dataState?.cases]);

    const bike = useMemo(() => {
        if (!caseObj) return null;
        return bikes.find((item) => Number(item.bike_id) === Number(caseObj.bike_id)) || null;
    }, [bikes, caseObj]);

    useEffect(() => {
        let active = true;
        const load = async () => {
            if (!caseReference) {
                setLoading(false);
                return;
            }

            try {
                const [bikesResp, logsResp] = await Promise.all([
                    api.get('/bikes'),
                    api.get(`/cases/${caseReference}/logs`),
                ]);

                if (!active) return;
                setBikes(bikesResp.data || []);
                setLogs(Array.isArray(logsResp.data) ? logsResp.data : []);
            } catch (err) {
                console.log('Failed to load case details', err);
                if (active) {
                    setLogs([]);
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        load();

        return () => {
            active = false;
        };
    }, [caseReference]);

    const sortedLogs = useMemo(() => {
        return [...logs].sort((a, b) => new Date(a.submission_timestamp) - new Date(b.submission_timestamp));
    }, [logs]);

    const handleSubmit = async () => {
        if (!description.trim()) {
            setMessage('Please enter a description for the log entry.');
            return;
        }

        if (!caseReference) {
            setMessage('Invalid case reference.');
            return;
        }

        setSubmitting(true);
        setMessage('');

        try {
            await api.post(`/cases?reference=${encodeURIComponent(caseReference)}&logs=1`, {
                description: description.trim(),
                new_status: newStatus,
            });

            const refreshedLogs = await api.get(`/cases/${caseReference}/logs`);
            setLogs(Array.isArray(refreshedLogs.data) ? refreshedLogs.data : []);
            setDescription('');
            setNewStatus('open');
            setMessage('Log entry submitted successfully.');

            const refreshedCases = await requestCases();
            const casesArray = Array.isArray(refreshedCases) ? refreshedCases : Object.values(refreshedCases || {});
            setDataContext((prev) => ({ ...prev, cases: casesArray }));
        } catch (err) {
            console.log('Failed to submit log entry', err);
            setMessage('Unable to submit log entry.');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePDF = async () => {
        setPrinting(true);

        const doc = new jsPDF("p", "mm", "a4");

        const sections = [
            headerRef.current,
            bodyRef.current
        ];

        let yOffset = 0;

        for (const section of sections) {

            const canvas = await html2canvas(section, {
                scale: 2,          // high quality
                useCORS: true
            });

            const imgData = canvas.toDataURL("image/png");
            const imgProps = doc.getImageProperties(imgData);

            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            // Add image to PDF
            doc.addImage(imgData, "PNG", 0, yOffset, pdfWidth, pdfHeight);

            // Move down for next section
            yOffset += pdfHeight;

            // If next section won't fit, add a new page
            if (yOffset > doc.internal.pageSize.getHeight() - 10) {
                doc.addPage();
                yOffset = 0;
            }
        }

        doc.save(`Case ${caseReference}.pdf`);

        setPrinting(false);
    }

    if (!caseReference) {
        return (
            <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-[#DEE5E5]">
                <div className="max-w-4xl mx-auto rounded-3xl bg-white border border-[#DEE5E5] p-8 shadow-sm">
                    <h1 className="text-3xl font-bold text-[#37323E]">Case details</h1>
                    <p className="mt-4 text-sm text-[#6D6A75]">No case reference was provided.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-[#DEE5E5]">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="rounded-3xl bg-white border border-[#DEE5E5] p-8 shadow-sm">
                    <h1 className="text-3xl font-bold text-[#37323E]">Case details</h1>
                    <p className="mt-2 text-sm text-[#6D6A75]">Review logs for this case and submit a new officer update.</p>
                </div>

                <div ref={headerRef} className="rounded-3xl bg-white border border-[#DEE5E5] p-6 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                            <p className="text-sm text-[#6D6A75]">Case Reference: {caseReference}</p>
                            <h2 className="mt-2 text-2xl font-semibold text-[#37323E]">
                                {caseObj?.brand || bike?.brand ? `${caseObj?.brand || bike?.brand} ${caseObj?.model || bike?.model}` : `Bike #${caseObj?.bike_id || ''}`}
                            </h2>
                            <p className="mt-2 text-sm text-[#6D6A75]">
                                {caseObj?.manufacturer_part_number || bike?.manufacturer_part_number || bike?.mpn ? `MPN ${caseObj?.manufacturer_part_number || bike?.manufacturer_part_number || bike?.mpn}` : 'MPN unavailable'}
                            </p>
                        </div>
                        <div className="space-y-2 text-right">
                            <span 
                                className="inline-flex items-center rounded-full bg-[#FF7F11] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white"
                                style={{ lineHeight: "1.4" }}
                            >
                                {caseObj?.case_status || 'Unknown'}
                            </span>
                            <p className="text-sm text-[#6D6A75]">Opened {formatDate(caseObj?.date_opened)}</p>
                        </div>
                    </div>
                </div>

                <div ref={bodyRef} className="rounded-3xl bg-white border border-[#DEE5E5] p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-[#37323E]">Case timeline</h2>
                    <p className="mt-1 text-sm text-[#6D6A75]">All log entries for this case, ordered oldest first.</p>

                    <div className="mt-6">
                        {loading ? (
                            <p className="text-sm text-[#6D6A75]">Loading logs…</p>
                        ) : logs.length === 0 ? (
                            <p className="text-sm text-[#6D6A75]">No log entries yet.</p>
                        ) : (
                            <div className="relative pl-10">
                                <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
                                {sortedLogs.map((log, idx) => {
                                    const prevStatus = idx > 0 ? sortedLogs[idx - 1].new_status : null;
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
                                                        <span 
                                                            className="rounded-full bg-[#DE9E36] px-3 py-1 text-xs font-semibold text-white"
                                                            style={{ lineHeight: "1.4" }}
                                                        >
                                                            {label}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-[#6D6A75]">&nbsp;</span>
                                                    )}
                                                </div>
                                                <p className="mt-2 text-sm text-[#4A4A4A]">{log.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {type === 'police' ? (
                    <div className="rounded-3xl bg-white border border-[#DEE5E5] p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-[#37323E]">Submit a new log entry</h2>
                        <p className="mt-1 text-sm text-[#6D6A75]">Add a new officer update for this case.</p>

                        <div className="mt-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#37323E]">Status</label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-[#DE9E36] focus:outline-none"
                                >
                                    <option value="open">Open</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#37323E]">Description</label>
                                <textarea
                                    rows={5}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="mt-2 w-full rounded-3xl border border-gray-300 bg-white px-4 py-3 text-[#37323E] shadow-sm focus:border-[#DE9E36] focus:outline-none"
                                    placeholder="Describe the update, actions taken or status changes"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                {message && <p className="text-sm text-[#37323E]">{message}</p>}
                                <button
                                    type="button"
                                    disabled={submitting}
                                    onClick={handleSubmit}
                                    className="inline-flex items-center justify-center rounded bg-[#FF7F11] px-5 py-2 text-white disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting…' : 'Submit log entry'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        disabled={printing}
                        onClick={handlePDF}
                        className="inline-flex items-center justify-center rounded bg-[#FF7F11] px-5 py-2 text-white disabled:opacity-50"
                    >
                        {printing ? 'Converting…' : 'Convert to PDF'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default CaseDetails;
