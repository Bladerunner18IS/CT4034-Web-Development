import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './Api';
import { useData, requestBikes, requestUser } from './DataContext';

const AddBike = () => {
    const navigate = useNavigate();
    const [, setDataContext] = useData();

    const [formData, setFormData] = useState({
        manufacturer_part_number: '',
        brand: '',
        model: '',
        type: '',
        wheel_size: '',
        colour: '',
        number_of_gears: '',
        brake_type: '',
        suspension: '',
        gender: '',
        age_group: '',
        status: 'active',
        serial_number: '',
        location: '',
        description: '',
    });
    const [errors, setErrors] = useState({});
    const [response, setResponse] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [images, setImages] = useState([]);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageClick = (index) => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setResponse('Please select a valid image file.');
            return;
        }

        setResponse('');
        setImages((prev) => [...prev, file]);
        e.target.value = null; // Reset input
    };

    const removeImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setResponse('');
        setErrors({});

        try {
            // create bike first (JSON payload)
            const dataPayload = {};
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== '' && value !== null) dataPayload[key] = value;
            });

            const result = await api.post('/bikes', dataPayload);
            const selectedBikeId = result.data?.bike_id;

            // if there are images, upload them to /images
            if (selectedBikeId && images.length > 0) {
                const imgForm = new FormData();
                imgForm.append('bike_id', selectedBikeId);
                imgForm.append('primary_image', images[0]);
                images.slice(1).forEach((file) => imgForm.append('secondary_images[]', file));

                try {
                    await api.post('/images', imgForm, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                } catch (imgErr) {
                    console.log('Image upload failed', imgErr);
                    // keep going — bike was created; report issue to user
                    setResponse('Bike saved, but some images failed to upload.');
                }
            }

            // refresh global data so dashboard shows the new bike immediately
            try {
                const [bikeData, userData] = await Promise.all([requestBikes(), requestUser()]);
                const bikesArray = Array.isArray(bikeData) ? bikeData : Object.values(bikeData || {});
                setDataContext({ bikes: bikesArray, cases: null, user: userData });
            } catch (refreshErr) {
                console.log('Data refresh failed', refreshErr);
            }

            setSubmitting(false);
            navigate('/', { state: { selectedBikeId } });
        } catch (error) {
            setSubmitting(false);
            if (error.response) {
                if (error.response.data.validation_errors) {
                    setErrors(error.response.data.validation_errors);
                } else if (error.response.data.message) {
                    setResponse(error.response.data.message);
                } else {
                    setResponse('Unable to add bike. Please try again later.');
                }
            } else {
                setResponse('Network error. Please check your connection.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#DEE5E5] py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-3xl space-y-8">
                <div className="rounded-3xl bg-white/95 border border-[#DEE5E5] p-8 shadow-xl shadow-[#37323e]/10">
                    <div className="text-center">
                        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#6D6A75]">
                            Add a new bike
                        </p>
                        <h1 className="mt-4 text-3xl font-extrabold text-[#37323E] sm:text-4xl">
                            Register your bike details
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-[#6D6A75]">
                            Keep your bike protected by storing the make, model and serial information in your account.
                        </p>
                    </div>

                    <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="model" className="block text-sm font-medium text-[#37323E]">
                                    Model
                                </label>
                                <input
                                    id="model"
                                    name="model"
                                    type="text"
                                    value={formData.model}
                                    onChange={handleChange}
                                    required
                                    className="mt-2 block w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-[#37323E] shadow-sm focus:border-[#DE9E36] focus:outline-none focus:ring-[#DE9E36] sm:text-sm"
                                    placeholder="e.g. Ridgeback Velocity"
                                />
                                {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model}</p>}
                            </div>
                            <div>
                                <label htmlFor="brand" className="block text-sm font-medium text-[#37323E]">
                                    Brand
                                </label>
                                <input
                                    id="brand"
                                    name="brand"
                                    type="text"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    required
                                    className="mt-2 block w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-[#37323E] shadow-sm focus:border-[#DE9E36] focus:outline-none focus:ring-[#DE9E36] sm:text-sm"
                                    placeholder="e.g. Trek"
                                />
                                {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand}</p>}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <label htmlFor="manufacturer_part_number" className="block text-sm font-medium text-[#37323E]">
                                    Manufacturer Part Number
                                </label>
                                <input
                                    id="manufacturer_part_number"
                                    name="manufacturer_part_number"
                                    type="text"
                                    value={formData.manufacturer_part_number}
                                    onChange={handleChange}
                                    className="mt-2 block w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-[#37323E] shadow-sm focus:border-[#DE9E36] focus:outline-none focus:ring-[#DE9E36] sm:text-sm"
                                    placeholder="e.g. MPN12345"
                                />
                            </div>
                            <div>
                                <label htmlFor="wheel_size" className="block text-sm font-medium text-[#37323E]">
                                    Wheel size
                                </label>
                                <input
                                    id="wheel_size"
                                    name="wheel_size"
                                    type="text"
                                    value={formData.wheel_size}
                                    onChange={handleChange}
                                    className="mt-2 block w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-[#37323E] shadow-sm focus:border-[#DE9E36] focus:outline-none focus:ring-[#DE9E36] sm:text-sm"
                                    placeholder="e.g. 29in"
                                />
                            </div>
                            <div>
                                <label htmlFor="number_of_gears" className="block text-sm font-medium text-[#37323E]">
                                    Gears
                                </label>
                                <input
                                    id="number_of_gears"
                                    name="number_of_gears"
                                    type="number"
                                    min="1"
                                    value={formData.number_of_gears}
                                    onChange={handleChange}
                                    className="mt-2 block w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-[#37323E] shadow-sm focus:border-[#DE9E36] focus:outline-none focus:ring-[#DE9E36] sm:text-sm"
                                    placeholder="e.g. 21"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-[#37323E]">
                                    Type
                                </label>
                                <input
                                    id="type"
                                    name="type"
                                    type="text"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="mt-2 block w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-[#37323E] shadow-sm focus:border-[#DE9E36] focus:outline-none focus:ring-[#DE9E36] sm:text-sm"
                                    placeholder="e.g. Road / Hybrid"
                                />
                            </div>
                            <div>
                                <label htmlFor="colour" className="block text-sm font-medium text-[#37323E]">
                                    Colour
                                </label>
                                <input
                                    id="colour"
                                    name="colour"
                                    type="text"
                                    value={formData.colour}
                                    onChange={handleChange}
                                    className="mt-2 block w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-[#37323E] shadow-sm focus:border-[#DE9E36] focus:outline-none focus:ring-[#DE9E36] sm:text-sm"
                                    placeholder="e.g. Matte black"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <label htmlFor="brake_type" className="block text-sm font-medium text-[#37323E]">
                                    Brake type
                                </label>
                                <input
                                    id="brake_type"
                                    name="brake_type"
                                    type="text"
                                    value={formData.brake_type}
                                    onChange={handleChange}
                                    className="mt-2 block w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-[#37323E] shadow-sm focus:border-[#DE9E36] focus:outline-none focus:ring-[#DE9E36] sm:text-sm"
                                    placeholder="e.g. Disc"
                                />
                            </div>
                            <div>
                                <label htmlFor="suspension" className="block text-sm font-medium text-[#37323E]">
                                    Suspension
                                </label>
                                <input
                                    id="suspension"
                                    name="suspension"
                                    type="text"
                                    value={formData.suspension}
                                    onChange={handleChange}
                                    className="mt-2 block w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-[#37323E] shadow-sm focus:border-[#DE9E36] focus:outline-none focus:ring-[#DE9E36] sm:text-sm"
                                    placeholder="e.g. Hardtail"
                                />
                            </div>
                            <div>
                                <label htmlFor="gender" className="block text-sm font-medium text-[#37323E]">
                                    Gender
                                </label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="mt-2 block w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-[#37323E] shadow-sm focus:border-[#DE9E36] focus:outline-none focus:ring-[#DE9E36] sm:text-sm"
                                >
                                    <option value="">Select</option>
                                    <option value="unisex">Unisex</option>
                                    <option value="mens">Men's</option>
                                    <option value="womens">Women's</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <label htmlFor="age_group" className="block text-sm font-medium text-[#37323E]">
                                    Age group
                                </label>
                                <select
                                    id="age_group"
                                    name="age_group"
                                    value={formData.age_group}
                                    onChange={handleChange}
                                    className="mt-2 block w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-[#37323E] shadow-sm focus:border-[#DE9E36] focus:outline-none focus:ring-[#DE9E36] sm:text-sm"
                                >
                                    <option value="">Select</option>
                                    <option value="adult">Adult</option>
                                    <option value="youth">Youth</option>
                                    <option value="child">Child</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-[#37323E]">
                                    Status
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="mt-2 block w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-[#37323E] shadow-sm focus:border-[#DE9E36] focus:outline-none focus:ring-[#DE9E36] sm:text-sm"
                                >
                                    <option value="active">Active</option>
                                    <option value="stolen">Stolen</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-[#37323E]">
                                    Location last seen
                                </label>
                                <input
                                    id="location"
                                    name="location"
                                    type="text"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="mt-2 block w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-[#37323E] shadow-sm focus:border-[#DE9E36] focus:outline-none focus:ring-[#DE9E36] sm:text-sm"
                                    placeholder="e.g. London"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-[#37323E]">
                                Additional notes
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                rows="4"
                                value={formData.description}
                                onChange={handleChange}
                                className="mt-2 block w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-[#37323E] shadow-sm focus:border-[#DE9E36] focus:outline-none focus:ring-[#DE9E36] sm:text-sm"
                                placeholder="Any additional identifying details"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#37323E]">
                                Bike images
                            </label>
                            <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                                {images.map((image, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={URL.createObjectURL(image)}
                                            alt={`Bike image ${index + 1}`}
                                            className={`w-full h-32 object-cover rounded-2xl border-2 border-[#DEE5E5] ${
                                                index === 0 ? 'col-span-2 row-span-2 h-64 sm:col-span-2 sm:row-span-2' : ''
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-2 -right-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold hover:bg-red-600"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                {images.length < 5 && (
                                    <button
                                        type="button"
                                        onClick={() => handleImageClick(images.length)}
                                        className={`w-full h-32 border-2 border-dashed border-[#DEE5E5] rounded-2xl flex items-center justify-center text-[#6D6A75] hover:border-[#DE9E36] hover:text-[#DE9E36] transition-colors ${
                                            images.length === 0 ? 'col-span-2 row-span-2 h-64 sm:col-span-2 sm:row-span-2' : ''
                                        }`}
                                    >
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>

                        {response && (
                            <div className={`rounded-2xl p-4 text-sm ${response.toLowerCase().includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {response}
                            </div>
                        )}

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex w-full items-center justify-center rounded-full bg-[#FF7F11] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#37323e]/15 transition hover:bg-[#DE9E36] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                            >
                                {submitting ? 'Saving…' : 'Save bike'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="inline-flex w-full items-center justify-center rounded-full border border-[#37323E] bg-white px-6 py-3 text-sm font-semibold text-[#37323E] shadow-sm transition hover:bg-[#F7F6F3] sm:w-auto"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddBike;
