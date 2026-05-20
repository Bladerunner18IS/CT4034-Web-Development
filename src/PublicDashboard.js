import React from 'react';
import { useLocation } from 'react-router-dom';
import { BikeCarousel } from './BikeCarousel';
import { useDataState } from './DataContext';

const getGreeting = () => {
    const now = new Date();
    const londonTime = new Date(now.toLocaleString('en-GB', { timeZone: 'Europe/London' }));
    const hour = londonTime.getHours();

    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
};

const PublicDash = () => {

    const userData = useDataState();

    const location = useLocation();
    const selectedBikeId = location.state?.selectedBikeId ?? null;
    const greeting = getGreeting();
    const userName = userData.user?.name ?? null;

    const isSameDay = (a, b) => {
        return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    };

    const getLastUpdateLabel = () => {
        const bikes = userData?.bikes || [];
        if (!bikes || bikes.length === 0) return 'N/A';

        const dates = bikes
            .map(b => b.date_last_updated)
            .filter(Boolean)
            .map(s => {
                const d = new Date(s);
                return isNaN(d) ? null : d;
            })
            .filter(Boolean);

        if (dates.length === 0) return 'N/A';

        const latest = dates.reduce((a, b) => (a > b ? a : b));

        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (isSameDay(latest, today)) return 'Today';
        if (isSameDay(latest, yesterday)) return 'Yesterday';

        return latest.toLocaleDateString('en-GB');
    };

    const lastUpdateLabel = getLastUpdateLabel();

    return (
        <div className="min-h-screen bg-[#DEE5E5] text-[#37323E]">
            <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr] items-start">
                    <div className="space-y-6">
                        <div className="rounded-3xl bg-white/90 border border-[#DEE5E5] p-8 shadow-xl shadow-[#37323e]/5 backdrop-blur-sm">
                            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6D6A75]">
                                        Dashboard overview
                                    </p>
                                    <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[#37323E] sm:text-5xl">
                                        {greeting}, {userName}
                                    </h1>
                                    <p className="mt-3 max-w-2xl text-base leading-7 text-[#6D6A75]">
                                        Manage your bikes and track investigations from one secure dashboard. Keep your records safe so you're ready if a theft occurs.
                                    </p>
                                </div>
                                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#FF7F11] text-3xl font-bold text-white shadow-lg shadow-[#37323e]/15">
                                    U
                                </div>
                            </div>

                            <div className="mt-8 grid gap-4 sm:grid-cols-3">
                                <div className="rounded-3xl border border-[#DEE5E5] bg-[#F7F6F3] p-5">
                                        <p className="text-sm text-[#6D6A75]">Bikes registered</p>
                                        <p className="mt-3 text-3xl font-semibold text-[#37323E]">{(userData?.bikes?.length) ?? 0}</p>
                                    </div>
                                    <div className="rounded-3xl border border-[#DEE5E5] bg-[#F7F6F3] p-5">
                                        <p className="text-sm text-[#6D6A75]">Open investigations</p>
                                        <p className="mt-3 text-3xl font-semibold text-[#37323E]">{(userData?.cases?.length) ?? 0}</p>
                                    </div>
                                <div className="rounded-3xl border border-[#DEE5E5] bg-[#F7F6F3] p-5">
                                    <p className="text-sm text-[#6D6A75]">Last update</p>
                                    <p className="mt-3 text-3xl font-semibold text-[#37323E]">{lastUpdateLabel}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-[#37323E]">Your bikes</h2>
                                <p className="text-sm text-[#6D6A75]">Browse your current bike records and check image details for each one.</p>
                            </div>
                            <button
                                type="button"
                                className="inline-flex items-center justify-center rounded-full bg-[#FF7F11] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#37323e]/15 transition hover:bg-[#DE9E36]"
                                onClick={() => window.location.href = '/add-bike'}
                            >
                                Add new bike
                            </button>
                        </div>
                        <div className="rounded-3xl bg-white/95 border border-[#DEE5E5] p-6 shadow-xl shadow-[#37323e]/5">
                            <BikeCarousel initialBikeId={selectedBikeId} />
                        </div>
                    </div>

                    <aside className="space-y-6">
                        <div className="rounded-3xl bg-white/95 border border-[#DEE5E5] p-6 shadow-xl shadow-[#37323e]/5">
                            <h2 className="text-lg font-semibold text-[#37323E]">Security notes</h2>
                            <p className="mt-4 text-sm leading-6 text-[#6D6A75]">
                                Store your bike details and case records securely, and update them whenever you add a new ride. This dashboard helps you keep theft evidence organised and accessible.
                            </p>
                        </div>
                        <div className="rounded-3xl bg-[#37323E] p-6 text-white shadow-xl shadow-[#37323e]/10">
                            <p className="text-sm uppercase tracking-[0.24em] text-[#DEE5E5]">Need help?</p>
                            <p className="mt-3 text-2xl font-semibold">Support available 24/7</p>
                            <p className="mt-4 text-sm leading-6 text-[#DEE5E5]/90">
                                Contact our support team if you suspect theft or need assistance updating case information.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
            <footer className="border-t border-[#DEE5E5] bg-[#F7F6F3] py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-[#37323E]">Secure Bike Registry</p>
                            <p className="mt-1 text-sm text-[#6D6A75]">123 Safety Street, London, UK</p>
                        </div>
                        <div className="text-sm text-[#6D6A75]">
                            <p>support@example.com</p>
                            <p>+44 01234 567 890</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicDash;