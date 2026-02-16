import React, { useState } from 'react';
import {
    Send,
    BadgeCheck
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import usePoll from '../../hooks/usePoll';
import { useParams } from 'react-router-dom';
import axios from "axios";
import { activateSSE } from '../../redux/slices/pollSlice';
import Header from '../../components/Header';
const PollPage = () => {
    const dispatch = useDispatch()
    const { pollId } = useParams();
    const [ip, setIP] = useState("");
    const { getPoll, votePoll } = usePoll()
    const [selectedOption, setSelectedOption] = useState('');
    const [hasVoted, setHasVoted] = useState(false);
    const { submitted, voting, pollData, activeSSE } = useSelector((state) => state.poll);
    const handleVote = async () => {
        await votePoll(pollId, selectedOption, ip);
    };

    useEffect(() => {
        const existingVote = submitted.find(item => item.pollId === pollId);

        if (existingVote) {
            if (!hasVoted) setHasVoted(true);

            if (!selectedOption) setSelectedOption(existingVote.optionId);

            if (!activeSSE) dispatch(activateSSE(true));
        }
    }, [submitted, pollId, activeSSE, hasVoted, selectedOption, dispatch]);
    const getData = async () => {
        const res = await axios.get("https://api.ipify.org/?format=json");
        setIP(res.data.ip);
    };

    useEffect(() => {
        if (!hasVoted) {
            getData();
        }
    }, [selectedOption]);

    useEffect(() => {
        const getData = setTimeout(() => {
            getPoll(pollId);
        }, 200)
        return () => clearTimeout(getData)
    }, [dispatch]);

    if (!pollData) return;

    return (
        <div className="bg-[#f6f6f8] dark:bg-[#101322] font-sans text-slate-900 min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 flex flex-col items-center justify-center mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">

                <div className="mb-10 text-center w-full">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white sm:text-4xl">
                        {pollData.question.questionText}
                    </h2>
                </div>

                <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
                    <h3 className="mb-6 text-sm font-bold uppercase tracking-widest text-slate-400 text-center">
                        Select an option
                    </h3>

                    <div className="space-y-4">
                        {pollData.question.options.map((option) => (
                            <label
                                key={option._id}
                                className={`group flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all relative overflow-hidden
                  ${selectedOption === option._id ? 'border-[#1337ec]' : 'border-slate-100 dark:border-slate-800'} 
                  hover:border-[#1337ec]/30 hover:bg-[#1337ec]/5`}
                            >
                                <div className="relative z-10 flex w-full items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="radio"
                                            name="poll-option"
                                            className="h-5 w-5 border-2 border-slate-300 text-[#1337ec] focus:ring-[#1337ec] dark:border-slate-600 bg-white"
                                            checked={selectedOption === option._id}
                                            onChange={() => setSelectedOption(option._id)}
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 dark:text-white">{option.option}</span>
                                        </div>
                                    </div>
                                    {option.voteCount && (
                                        <div className="text-right">
                                            <div className="text-[10px] uppercase tracking-wide text-slate-400">{option.voteCount} votes</div>
                                        </div>
                                    )}
                                </div>
                            </label>
                        ))}
                    </div>

                    {!hasVoted && (
                        <div className="pt-6">
                            <button
                                onClick={handleVote}
                                disabled={hasVoted}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1337ec] px-6 py-4 text-base font-bold text-white shadow-lg shadow-[#1337ec]/20 transition-all hover:bg-[#1337ec]/90 active:scale-95 disabled:opacity-50 disabled:scale-100"
                            >
                                {voting ? 'Vote Submitting' : 'Submit My Vote'}
                                <Send size={18} />
                            </button>
                        </div>
                    )}

                    {hasVoted && (
                        <div className="mt-6 flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                            <div className="flex w-full items-center justify-center">
                                <div className="flex items-center gap-2">
                                    <BadgeCheck size={20} />
                                    <p className="text-sm font-medium">Thank you! Your vote has been recorded.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>


            </main>
        </div>
    );
};

export default PollPage;