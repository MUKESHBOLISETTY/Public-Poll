import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, Github } from 'lucide-react';
import Header from '../../components/Header';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const { login } = useAuth()
    const navigate = useNavigate()

    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(formData, navigate);
    };

    return (
        <div className="bg-[#f6f6f8] dark:bg-[#101322] min-h-screen flex flex-col font-sans antialiased">
            <Header />

            <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
                <div className="w-full max-w-md">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 md:p-10">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1337ec]/10 text-[#1337ec] mb-4">
                                <Lock size={24} />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h1>
                            <p className="text-gray-500 dark:text-gray-400">Sign in to manage your polls</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email">
                                    Email Address
                                </label>
                                <input
                                    className="w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#1337ec] focus:border-[#1337ec] transition-all outline-none"
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">
                                        Password
                                    </label>
                                </div>
                                <div className="relative flex items-center">
                                    <input
                                        className="w-full h-12 pl-4 pr-12 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#1337ec] focus:border-[#1337ec] transition-all outline-none"
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <button
                                        className="absolute right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                className="w-full h-12 bg-[#1337ec] hover:bg-[#1337ec]/90 text-white font-bold rounded-lg shadow-lg shadow-[#1337ec]/20 transition-all flex items-center justify-center gap-2 group"
                                type="submit"
                            >
                                <span>Sign In</span>
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>

                    </div>

                    <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        Don't have an account?{' '}
                        <a className="font-bold text-[#1337ec] hover:underline" href="/signup">
                            Create an account
                        </a>
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Login;