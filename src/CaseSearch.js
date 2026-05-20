import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from './Api';

// ─── Constants ───────────────────────────────────────────────────────────────

const rangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week',  label: 'This week' },
    { value: 'month', label: 'This month' },
    { value: 'year',  label: 'This year' },
    { value: 'all',   label: 'Show all' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

const getRangeThreshold = (range) => {
    const now = new Date();
    switch (range) {
        case 'today':
            return new Date(now.getFullYear(), now.getMonth(), now.getDate());
        case 'week':
            return new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000);
        case 'month':
            return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case 'year':
            return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        default:
            return new Date(0);
    }
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * CaseSearch
 *
 * Props:
 *   cases  {Array}  – raw case objects from DataContext / API
 *   bikes  {Array}  – raw bike objects used to enrich case display data
 *
 * Usage:
 *   import CaseSearch from './CaseSearch';
 *   <CaseSearch cases={dataState.cases} bikes={dataState.bikes} />
 */
const CaseSearch = ({ cases = [], bikes = [] }) => {
    const [search, setSearch] = useState('');
    const [range,  setRange]  = useState('week');
    const [imageData, setImageData] = useState({});
    const roleFromPath = useLocation().pathname.match(/police|admin/);

    // Enrich raw cases with display-friendly fields
    const caseRows = useMemo(() => {
        return cases.map((c) => {
            const bike      = bikes.find((b) => Number(b.bike_id) === Number(c.bike_id));
            const brand     = c.brand  || bike?.brand  || '';
            const model     = c.model  || bike?.model  || '';
            const mpn       = c.manufacturer_part_number || bike?.manufacturer_part_number || bike?.mpn || '';
            const bikeModel = [brand, model].filter(Boolean).join(' ') || `Bike #${c.bike_id}`;

            return {
                ...c,
                bikeModel,
                brand,
                model,
                mpn,
                reference:       c.reference || null,
                primaryImageUrl: c.image_filename
                    ? `/images/bikes/${c.bike_id}/${c.image_filename}`
                    : null,
            };
        });
    }, [cases, bikes]);

    // Filtering + sorting
    const searchTerm      = search.trim().toLowerCase();
    const rangeThreshold  = useMemo(() => getRangeThreshold(range), [range]);

    const filteredCases = useMemo(() => {
        return [...caseRows]
            .filter((c) => {
                if (range !== 'all') {
                    const opened = new Date(c.date_opened);
                    if (Number.isNaN(opened.getTime()) || opened < rangeThreshold) return false;
                }
                if (!searchTerm) return true;
                return [c.reference, c.bikeModel, c.mpn]
                    .some((v) => v?.toString().toLowerCase().includes(searchTerm));
            })
            .sort((a, b) => new Date(b.date_opened) - new Date(a.date_opened));
    }, [caseRows, range, rangeThreshold, searchTerm]);

    // Lazy-load images for visible case rows
    useEffect(() => {
        if (!caseRows.length) return;

        const missingImages = caseRows.filter((c) => c.primaryImageUrl && !(c.case_id in imageData));
        if (!missingImages.length) return;

        let active = true;

        const loadImages = async () => {
            const loadedEntries = await Promise.all(
                missingImages.map(async (c) => {
                    try {
                        const response = await api.get(c.primaryImageUrl, { responseType: 'arraybuffer' });
                        const contentType = response.headers['content-type'] || 'image/jpeg';
                        const base64 = btoa(String.fromCharCode(...new Uint8Array(response.data)));
                        return [c.case_id, `data:${contentType};base64,${base64}`];
                    } catch {
                        return [c.case_id, null];
                    }
                })
            );

            if (!active) return;

            setImageData((prev) => {
                const next = { ...prev };
                loadedEntries.forEach(([caseId, uri]) => { next[caseId] = uri; });
                return next;
            });
        };

        loadImages();
        return () => { active = false; };
    }, [caseRows, imageData]);

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="rounded-3xl bg-white border border-[#DEE5E5] p-6 shadow-sm">

            {/* Header + date-range picker */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-[#37323E]">Case search and history</h2>
                    <p className="mt-1 text-sm text-[#6D6A75]">Filter by date range.</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <label className="block text-sm font-medium text-[#37323E]">Date range</label>
                    <select
                        value={range}
                        onChange={(e) => setRange(e.target.value)}
                        className="rounded-2xl border border-gray-300 bg-white px-3 py-2 text-sm text-[#37323E] shadow-sm focus:border-[#DE9E36] focus:outline-none"
                    >
                        {rangeOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Search input */}
            <div className="mt-6">
                <label htmlFor="case-search" className="sr-only">Search cases</label>
                <input
                    id="case-search"
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by reference, bike model, or MPN"
                    className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-[#37323E] shadow-sm focus:border-[#DE9E36] focus:outline-none"
                />
            </div>

            {/* Results */}
            <div className="mt-6 space-y-4">
                {filteredCases.length === 0 ? (
                    <p className="text-sm text-[#6D6A75]">No cases match the selected range or search term.</p>
                ) : (
                    filteredCases.map((c) => (
                        <Link
                            key={c.case_id}
                            to={`/${encodeURIComponent(roleFromPath)}/case-details?ref=${encodeURIComponent(c.reference)}`}
                            className="block rounded-3xl border border-slate-200 bg-slate-50 p-4 transition duration-150 hover:border-slate-300 hover:bg-slate-100"
                        >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                {/* Image + text */}
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
                                    <div className="h-24 w-full overflow-hidden rounded-3xl bg-slate-200 sm:w-36">
                                        {c.primaryImageUrl ? (
                                            imageData[c.case_id] ? (
                                                <img
                                                    src={imageData[c.case_id]}
                                                    alt={`${c.bikeModel} primary`}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-xs text-[#6D6A75]">
                                                    Loading…
                                                </div>
                                            )
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-xs text-[#6D6A75]">
                                                No image
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm text-[#6D6A75]">Reference {c.reference}</p>
                                        <h3 className="mt-1 text-lg font-semibold text-[#37323E]">{c.bikeModel}</h3>
                                        <p className="mt-1 text-sm text-[#6D6A75]">
                                            {c.mpn ? `MPN ${c.mpn}` : 'MPN unavailable'}
                                        </p>
                                    </div>
                                </div>

                                {/* Status + date */}
                                <div className="space-y-1 text-right">
                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                                        c.case_status === 'open'
                                            ? 'bg-[#FF7F11] text-white'
                                            : 'bg-[#E2E8F0] text-[#37323E]'
                                    }`}>
                                        {c.case_status}
                                    </span>
                                    <p className="text-sm text-[#6D6A75]">Opened {formatDate(c.date_opened)}</p>
                                </div>

                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default CaseSearch;
