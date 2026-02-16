import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Users, Calendar, BarChart3, Clock, CheckCircle2 } from 'lucide-react';
import { setSelectedPoll } from '../redux/slices/pollSlice';

const ViewPollModal = ({ onClose }) => {
    const dispatch = useDispatch();
    const { admin } = useSelector((state) => state.poll);
    const handleOnclose = () => {
        dispatch(setSelectedPoll(null));
    }
    if (!admin.selectedPoll) return null;

    const selectedPoll = admin.selectedPoll;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={handleOnclose}
            />

            <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#1337ec]/10 p-2 rounded-lg text-[#1337ec]">
                            <BarChart3 size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black leading-none">Poll Results</h2>
                            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Real-time Analytics</span>
                        </div>
                    </div>
                    <button onClick={handleOnclose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                            {selectedPoll.question.questionText}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                            <div className="flex items-center gap-1">
                                <Users size={14} />
                                {selectedPoll.totalVotes} total votes
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                Created {new Date(selectedPoll.createdAt).toLocaleDateString('en-IN')}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {selectedPoll.question.options.map((option, index) => {
                            const percentage = selectedPoll.totalVotes > 0 ? Math.round((option.voteCount / selectedPoll.totalVotes) * 100) : 0;
                            const isWinner = percentage === Math.max(...selectedPoll.question.options.map(o => (o.voteCount / selectedPoll.totalVotes) * 100)) && selectedPoll.totalVotes > 0;

                            return (
                                <div key={index} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-black text-slate-900 dark:text-white">{option.option} ({percentage}%)</span>
                                    </div>
                                    <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full ${isWinner ? 'bg-[#1337ec]' : 'bg-slate-300 dark:bg-slate-500'}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                        {option.voteCount} votes
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <button
                        onClick={handleOnclose}
                        className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-6 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-all"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewPollModal;