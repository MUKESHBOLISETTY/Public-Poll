import React from 'react';
import {
    ArrowRight
} from 'lucide-react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import poll_example from '../assets/poll_example.png';

const LandingPage = () => {
    const navigate = useNavigate()
    return (
        <div className="bg-[#f6f6f8] dark:bg-[#101322] text-slate-900 dark:text-slate-100 antialiased min-h-screen">
            <Header />

            <main>
                <section className="relative pt-20 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="max-w-2xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1337ec]/10 text-[#1337ec] text-xs font-bold uppercase tracking-wider mb-6">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1337ec] opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1337ec]"></span>
                                    </span>
                                    Live Results Enabled
                                </div>

                                <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-6">
                                    Create, Share, and Analyze <span className="text-[#1337ec]">Polls</span> in Real-Time
                                </h1>

                                <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 leading-relaxed mb-10">
                                    Simple creation, effortless sharing across platforms, and powerful instant analytics.
                                </p>

                                <div className="flex flex-wrap gap-4">
                                    <button onClick={() => { navigate('/signup') }} className="h-14 px-8 bg-[#1337ec] text-white font-bold rounded-xl text-lg hover:shadow-xl hover:shadow-[#1337ec]/30 transition-all flex items-center gap-2">
                                        Start Your First Poll
                                        <ArrowRight size={20} />
                                    </button>
                                </div>

                            </div>

                            <div className="relative">
                                <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 overflow-hidden group">
                                    <img
                                        alt="Dashboard Preview"
                                        className="w-full h-auto rounded-xl"
                                        src={poll_example}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-[#1337ec]/5 rounded-full blur-3xl -z-10"></div>
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-[#1337ec]/5 rounded-full blur-3xl -z-10"></div>
                </section>
            </main>
        </div>
    );
};

export default LandingPage;