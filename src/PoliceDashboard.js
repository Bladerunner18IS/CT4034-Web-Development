import React, { useMemo } from 'react';
import { useDataState } from './DataContext';
import CaseSearch from './CaseSearch';

const PoliceDashboard = () => {
    const dataState = useDataState();

    const cases = dataState?.cases || [];
    const bikes = dataState?.bikes || [];

    const activeOpenCases = useMemo(
        () => cases.filter((c) => c.case_status === 'open'),
        [cases]
    );

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

    return (
        <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-[#DEE5E5]">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Page header */}
                <div className="rounded-3xl bg-white border border-[#DEE5E5] p-8 shadow-sm">
                    <h1 className="text-3xl font-bold text-[#37323E]">Police dashboard</h1>
                    <p className="mt-2 text-sm text-[#6D6A75]">
                        Review active investigations and view new cases.
                    </p>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_1.5fr]">

                    {/* Open cases summary */}
                    <div className="rounded-3xl bg-white border border-[#DEE5E5] p-6 shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-semibold text-[#37323E]">Your previous cases</h2>
                                <p className="mt-1 text-sm text-[#6D6A75]">
                                    Open cases that you updated recently.
                                </p>
                            </div>
                            <div className="rounded-full bg-[#EFF5F7] px-4 py-2 text-sm font-semibold text-[#37323E]">
                                {activeOpenCases.length} open
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            {activeOpenCases.length === 0 ? (
                                <p className="text-sm text-[#6D6A75]">No open cases available right now.</p>
                            ) : (
                                activeOpenCases.map((c) => {
                                    const bike      = bikes.find((b) => Number(b.bike_id) === Number(c.bike_id));
                                    const brand     = c.brand || bike?.brand || '';
                                    const model     = c.model || bike?.model || '';
                                    const bikeModel = [brand, model].filter(Boolean).join(' ') || `Bike #${c.bike_id}`;

                                    return (
                                        <a
                                            key={c.case_id}
                                            href={`/police/case-details?ref=${encodeURIComponent(c.reference)}`}
                                            className="block rounded-3xl border border-slate-200 bg-slate-50 p-4 transition duration-150 hover:border-slate-300 hover:bg-slate-100"
                                        >
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="min-w-0">
                                                    <p className="text-sm text-[#6D6A75]">Reference {c.reference}</p>
                                                    <h3 className="mt-1 text-lg font-semibold text-[#37323E]">{bikeModel}</h3>
                                                </div>
                                                <div className="space-y-1 text-right">
                                                    <span className="inline-flex items-center rounded-full bg-[#FF7F11] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white">
                                                        Open
                                                    </span>
                                                    <p className="text-sm text-[#6D6A75]">Opened {formatDate(c.date_opened)}</p>
                                                </div>
                                            </div>
                                        </a>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Case search — reusable component */}
                    <CaseSearch cases={cases} bikes={bikes} />

                </div>
            </div>
        </div>
    );
};

export default PoliceDashboard;
