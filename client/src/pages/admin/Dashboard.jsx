import React, { useEffect, useState } from 'react';
import {
    Users,
    ClipboardCheck,
    Copy,
    Eye
} from 'lucide-react';
import Header from '../../components/Header';
import { useDispatch, useSelector } from 'react-redux';
import Footer from '../../components/Footer';
import usePoll from '../../hooks/usePoll';
import toast from 'react-hot-toast';
import { setCreatePoll, setCurrentPage, setSelectedPoll } from '../../redux/slices/pollSlice';
import CreatePollModal from '../../components/CreatePollModal';
import ViewPollModal from '../../components/ViewPollModal';
const ITEMS_PER_PAGE = 10;
const Dashboard = () => {
    const dispatch = useDispatch();
    const { fetchAllPolls } = usePoll();
    const [searchTerm, setSearchTerm] = useState('');

    const { admin } = useSelector((state) => state.poll);
    const { loading, token, user, error, email, navigation } = useSelector((state) => state.auth);
    const handleCopyPollLink = (poll) => {
        navigator.clipboard
            .writeText(`https://public-poll-ecru.vercel.app/poll/${poll._id}`)
            .then(() => toast.success("Poll Link Copied Successfully", { duration: 3000, position: 'bottom-right' }))
    };

    const handleCreatePoll = () => {
        dispatch(setCreatePoll(true));
    };
    const handleViewPoll = async (poll) => {
        dispatch(setSelectedPoll(poll));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= admin.totalPages) {
            dispatch(setCurrentPage(newPage));
        }
    };

    useEffect(() => {
        const getData = setTimeout(() => {
            fetchAllPolls(admin.currentPage, ITEMS_PER_PAGE, searchTerm);
        }, 500)
        return () => clearTimeout(getData)
    }, [admin.currentPage, searchTerm]);

    return (
        <div className="bg-[#f6f6f8] dark:bg-[#101322] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-sans">
            <Header />

            <main className="flex-grow flex justify-center pt-24 pb-16">
                <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8">
                    <div className="mb-10 text-center md:text-left">
                        <h1 className="text-3xl font-black mb-2">
                            Welcome back, {user?.fullName}!
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto md:mx-0">
                            Manage and monitor your active and drafted polls. Gain insights from your audience in real-time.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                        <th className="px-6 py-4 text-sm font-semibold">Poll Question</th>
                                        <th className="px-6 py-4 text-sm font-semibold">Engagement</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {admin.polls?.map((poll) => (
                                        <tr key={poll._id} className="group hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold mb-1">{poll.question.questionText}</span>
                                                    <span className="text-xs text-slate-400">{new Date(poll.createdAt).toLocaleDateString('en-IN')}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                        {poll.totalVotes !== null ? (
                                                            <>
                                                                <Users size={14} />
                                                                {poll.totalVotes} votes
                                                            </>
                                                        ) : (
                                                            <span className="italic text-slate-400">Not started</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => { handleCopyPollLink(poll) }} className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
                                                        <Copy size={16} />
                                                    </button>
                                                    <button onClick={() => { handleViewPoll(poll) }} className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
                                                        <Eye size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Showing Page {admin.currentPage} of {admin.totalPages} ({admin.totalItems} total polls)
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePageChange(admin.currentPage - 1)}
                                    className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                                    disabled={admin.currentPage === 1}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(admin.currentPage + 1)}
                                    className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
                                    disabled={admin.currentPage === admin.totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 flex flex-col items-center justify-center p-12 bg-[#1337ec]/5 border-2 border-dashed border-[#1337ec]/20 rounded-2xl text-center">
                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md mb-4 text-[#1337ec]">
                            <ClipboardCheck size={32} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Want to ask more?</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-xs">Start a new conversation with your community or team in seconds.</p>
                        <button onClick={handleCreatePoll} className="bg-[#1337ec] hover:bg-[#1337ec]/90 text-white px-8 py-3 rounded-lg font-bold transition-transform active:scale-95 shadow-lg shadow-[#1337ec]/20">
                            Create New Poll
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
            <CreatePollModal />
            <ViewPollModal />
        </div>
    );
};

export default Dashboard;