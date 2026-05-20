import React, { useState } from 'react';
import api from './Api';

const Register = () => {

    const [formData, setformData] = useState({
            email: '',
            name: '',
            password: '',
        });

    const [errors, seterrors] = useState({});
    const [response, setresponse] = useState("");


    const handleChange = (e) => {
        const { name, value } = e.target;
        setformData({
            ...formData,
            [name]: value,
        });
    };

    const handleRegister = (e) => {

        e.preventDefault();

        api.post("/register", formData)
        .then(response => {
            setresponse(response.data.message)
            setTimeout(() => {
                window.location.href = "/login";
            }, 3000);
        })

        .catch(error => {
            if (error.response) {
                if (error.response.data.message) {
                    setresponse(error.response.data.message);
                    seterrors({});
                } else if (error.response.data.validation_errors) {
                    setresponse("");
                    seterrors(error.response.data.validation_errors);
                } 

            } else {
                console.log('Error', error.message);
            }
        });
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-[#DEE5E5] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-[#37323E]">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-[#6D6A75]">
                        Or{' '}
                        <a href="/login" className="font-medium text-[#DE9E36] hover:text-[#FF7F11] transition-colors duration-200">
                            sign in to your existing account
                        </a>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-[#37323E] rounded-t-md focus:outline-none focus:ring-[#DE9E36] focus:border-[#DE9E36] focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                        </div>
                        <div>
                            <label htmlFor="name" className="sr-only">
                                Full name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-[#37323E] focus:outline-none focus:ring-[#DE9E36] focus:border-[#DE9E36] focus:z-10 sm:text-sm"
                                placeholder="Full name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-[#37323E] rounded-b-md focus:outline-none focus:ring-[#DE9E36] focus:border-[#DE9E36] focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                        </div>
                    </div>

                    {response && (
                        <div className={`rounded-md p-4 ${response.includes('success') || response.includes('Success') ? 'bg-green-50' : 'bg-red-50'}`}>
                            <div className={`text-sm ${response.includes('success') || response.includes('Success') ? 'text-green-700' : 'text-red-700'}`}>
                                {response}
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#FF7F11] hover:bg-[#DE9E36] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DE9E36] transition-colors duration-200"
                        >
                            Create account
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;