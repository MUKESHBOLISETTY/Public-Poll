import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Trash2, Send, X, Loader2, Info } from 'lucide-react';
import { setCreatePoll } from '../redux/slices/pollSlice';
import toast from 'react-hot-toast';
import usePoll from '../hooks/usePoll';

const CreatePollModal = () => {
    const dispatch = useDispatch();
    const { createPoll } = usePoll()
    const { admin } = useSelector((state) => state.poll);

    const [pollData, setPollData] = useState({
        question: '',
        options: ['', '']
    });

    const handleOnclose = () => {
        setPollData({ question: '', options: ['', ''] });
        dispatch(setCreatePoll(false));
    }

    const handleOptionChange = (index, value) => {
        const newOptions = [...pollData.options];
        newOptions[index] = value;
        setPollData({ ...pollData, options: newOptions });
    };

    const addOption = () => {
        if (pollData.options.length < 6) {
            setPollData({ ...pollData, options: [...pollData.options, ''] });
        }
    };

    const removeOption = (index) => {
        if (pollData.options.length > 2) {
            setPollData({
                ...pollData,
                options: pollData.options.filter((_, i) => i !== index)
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const finalData = {
            ...pollData,
            options: pollData.options
                .filter(opt => opt.trim() !== '')
                .map(opt => ({ option: opt }))
        };
        const { question, options } = finalData;
        if (!question.trim()) {
            return toast.error("Question cannot be empty", { duration: 3000, position: 'bottom-right' });
        }
        if (options.length < 2) {
            return toast.error("At least two options are required", { duration: 3000, position: 'bottom-right' });
        }
        const response = await createPoll(finalData);
        if (response && response.data && response.data.message === "poll_created") {
            handleOnclose();
        }
    };

    if (!admin.createPoll) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={handleOnclose}
            />

            <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
                    <h2 className="text-xl font-black flex items-center gap-2">
                        <Plus className="text-[#1337ec]" size={20} />
                        New Poll
                    </h2>
                    <button onClick={handleOnclose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Question</label>
                        <input
                            required
                            type="text"
                            value={pollData.question}
                            onChange={(e) => setPollData({ ...pollData, question: e.target.value })}
                            placeholder="Enter your question"
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-[#1337ec] outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Options</label>
                        <div className="max-h-[240px] overflow-y-auto pr-1 space-y-3 scrollbar-thin">
                            {pollData.options.map((option, index) => (
                                <div key={index} className="flex gap-2 group">
                                    <input
                                        required
                                        type="text"
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        placeholder={`Option ${index + 1}`}
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-[#1337ec] outline-none transition-all"
                                    />
                                    {pollData.options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => removeOption(index)}
                                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {pollData.options.length < 6 && (
                        <button
                            type="button"
                            onClick={addOption}
                            className="flex items-center gap-2 text-xs font-bold text-[#1337ec] hover:opacity-70 transition-opacity"
                        >
                            <Plus size={16} />
                            Add Option
                        </button>
                    )}

                    <div className="pt-4 flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                        </label>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleOnclose}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={admin.creatingPoll}
                                className="bg-[#1337ec] text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#1337ec]/90 transition-all shadow-lg shadow-[#1337ec]/20 disabled:opacity-70"
                            >
                                {admin.creatingPoll ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                Create Poll
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePollModal;