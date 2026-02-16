import React, { useState } from 'react';
import { Eye, EyeOff, Github } from 'lucide-react';
import Header from '../../components/Header';
import useAuth from '../../hooks/useAuth';

const SignUp = () => {
    const { signUp } = useAuth()
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form Submitted:', formData);
        const response = await signUp(formData, navigate);
    };

    return (
        <div className="font-display bg-[#f6f6f8] dark:bg-[#101322] text-[#0d101b] antialiased min-h-screen w-full relative flex flex-col items-center justify-center p-4">
            <Header />
            <main className="w-full max-w-[480px] bg-white dark:bg-[#1a1f36] rounded-xl shadow-xl border border-[#e7e9f3] dark:border-white/10 overflow-hidden">
                <div className="h-32 w-full bg-gradient-to-br from-[#1337ec] to-[#4c599a] relative flex items-center justify-center overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                            backgroundSize: '20px 20px',
                        }}
                    ></div>
                    <div className="relative z-10 text-white text-center">
                        <h1 className="text-2xl font-bold">Join the Community</h1>
                        <p className="text-white/80 text-sm">Create and share polls in seconds.</p>
                    </div>
                </div>

                <div className="p-8 md:p-10">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-[#0d101b] dark:text-white/90" htmlFor="fullName">
                                Full Name
                            </label>
                            <input
                                className="flex w-full rounded-lg border border-[#cfd3e7] dark:border-white/20 bg-transparent px-4 py-3 text-[#0d101b] dark:text-white placeholder:text-[#4c599a]/60 focus:border-[#1337ec] focus:ring-1 focus:ring-[#1337ec] outline-none transition-all"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="John Doe"
                                type="text"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-[#0d101b] dark:text-white/90" htmlFor="email">
                                Email Address
                            </label>
                            <input
                                className="flex w-full rounded-lg border border-[#cfd3e7] dark:border-white/20 bg-transparent px-4 py-3 text-[#0d101b] dark:text-white placeholder:text-[#4c599a]/60 focus:border-[#1337ec] focus:ring-1 focus:ring-[#1337ec] outline-none transition-all"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@company.com"
                                type="email"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-[#0d101b] dark:text-white/90" htmlFor="password">
                                Password
                            </label>
                            <div className="relative group">
                                <input
                                    className="flex w-full rounded-lg border border-[#cfd3e7] dark:border-white/20 bg-transparent px-4 py-3 pr-12 text-[#0d101b] dark:text-white placeholder:text-[#4c599a]/60 focus:border-[#1337ec] focus:ring-1 focus:ring-[#1337ec] outline-none transition-all"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                />
                                <button
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4c599a] hover:text-[#1337ec] transition-colors"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            className="w-full bg-[#1337ec] hover:bg-[#1337ec]/90 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-[#1337ec]/20 transition-all transform active:scale-[0.98] mt-2"
                            type="submit"
                        >
                            Create Account
                        </button>
                    </form>

                </div>
            </main>
           
        </div>
    );
};

export default SignUp;