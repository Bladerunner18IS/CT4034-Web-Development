import { Typography } from '@material-tailwind/react';
import { useDataState } from './DataContext';
import { useEffect, useState } from 'react';

export const BikeCarousel = ({ initialBikeId = null }) => {

    const userData = useDataState();
    const [carouselItems, setcarouselItems] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        if (!userData || !userData.bikes || userData.bikes.length === 0) {
            setcarouselItems([]);
            setActiveIndex(0);
            return;
        }

        setcarouselItems(userData.bikes);

        if (initialBikeId !== null && initialBikeId !== undefined) {
            const index = userData.bikes.findIndex((bike) => `${bike.bike_id}` === `${initialBikeId}`);
            setActiveIndex(index >= 0 ? index : 0);
        } else {
            setActiveIndex(0);
        }
    }, [userData, initialBikeId]);

    if (!carouselItems || carouselItems.length === 0) {
        return (
            <div className="rounded-3xl border border-[#DEE5E5] bg-[#F7F6F3] p-10 text-center text-[#6D6A75] shadow-sm">
                No bike records available yet. Add your first bike to keep your details secure.
            </div>
        );
    }

    const prev = () => setActiveIndex((i) => (i - 1 + carouselItems.length) % carouselItems.length);
    const next = () => setActiveIndex((i) => (i + 1) % carouselItems.length);

    const bike = carouselItems[activeIndex];
    const imageSrc = bike.images && bike.images[0] ? `data:image/png;base64,${bike.images[0]}` : null;

    return (
        <div className="relative overflow-hidden rounded-3xl border border-[#DEE5E5] bg-[#37323E] shadow-xl shadow-[#37323e]/10">
            <div className="relative h-[420px] w-full">
                <img
                    src={imageSrc}
                    alt={bike.model || 'bike'}
                    className="absolute inset-0 h-full w-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#37323E]/90 via-[#37323E]/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                    <div className="max-w-2xl rounded-3xl bg-[#37323E]/80 p-5 shadow-xl shadow-black/20 backdrop-blur-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <Typography variant="h4" color="white" className="font-bold text-3xl">
                                    {bike.model || 'Unknown Bike'}
                                </Typography>
                                <p className="mt-2 text-sm text-[#DEE5E5] opacity-90">
                                    {bike.brand || 'Unknown brand'} · {bike.type || 'Unknown type'}
                                </p>
                            </div>
                            <div className="rounded-full border border-[#DE9E36] bg-[#DE9E36]/10 px-4 py-2 text-sm font-semibold text-[#DE9E36]">
                                Bike {activeIndex + 1} of {carouselItems.length}
                            </div>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm text-[#DEE5E5] opacity-90">
                            <div>
                                <p className="font-semibold">MPN</p>
                                <p>{bike.manufacturer_part_number || 'Not available'}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Colour</p>
                                <p>{bike.colour || 'Not available'}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Location</p>
                                <p>{bike.location || 'Not available'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[#DEE5E5]/40 bg-[#DEE5E5] px-6 py-4">
                <button
                    onClick={prev}
                    className="inline-flex items-center justify-center rounded-full border border-[#37323E] bg-white px-4 py-2 text-sm font-semibold text-[#37323E] transition hover:bg-[#DEE5E5]"
                >
                    Previous
                </button>
                <div className="text-sm text-[#37323E]">
                    Viewing bike {activeIndex + 1} of {carouselItems.length}
                </div>
                <button
                    onClick={next}
                    className="inline-flex items-center justify-center rounded-full border border-[#37323E] bg-[#FF7F11] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#DE9E36]"
                >
                    Next
                </button>
            </div>
        </div>
    );
}