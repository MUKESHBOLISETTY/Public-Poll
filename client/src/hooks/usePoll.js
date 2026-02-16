import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authApi, pollApi } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';
import { useRef } from 'react';
import axios from 'axios';
import { activateSSE, setAdminPolls, setLoading, setPoll, setSubmitted, setVoteCount, setVoting } from '../redux/slices/pollSlice';

export const usePoll = () => {
    const dispatch = useDispatch();
    const abortControllerRef = useRef(null);

    const createSignal = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        return abortControllerRef.current.signal;
    };
    const { activeSSE, submitted, voting, pollData } = useSelector((state) => state.poll);
    const navigate = useNavigate();
    const location = useLocation();
    const setupVotesSSE = useCallback(() => {
        let eventSource;
        let reconnectTimeout;
        if (!pollData?._id || !activeSSE) {
            return () => { };
        }

        const connect = () => {
            eventSource = new EventSource(`${import.meta.env.VITE_API_URL}/poll/getVotes/${pollData._id}`);

            eventSource.onopen = () => console.log('SSE connection opened.');

            eventSource.addEventListener('initial_vote_data', (event) => {
                try {
                    dispatch(setVoteCount(JSON.parse(event.data)));
                } catch (e) {
                    console.error('Initial data parse error:', e);
                }
            });

            eventSource.addEventListener('poll_votes_update', (event) => {
                try {
                    dispatch(setVoteCount(JSON.parse(event.data)));
                } catch (e) {
                    console.error('Update parse error:', e);
                }
            });

            eventSource.addEventListener('restricted', () => {
                console.warn('Restricted event — closing SSE.');
                eventSource.close();
            });

            eventSource.addEventListener('keep-alive', () => {
                // console.log('Ping event — SSE.');
            });

            eventSource.onerror = () => {
                console.warn('SSE error — reconnecting in 5s...');
                eventSource.close();
                reconnectTimeout = setTimeout(connect, 5000);
            };
        };

        connect();

        return () => {
            if (eventSource) eventSource.close();
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
        };
    }, [dispatch, pollData?._id, activeSSE]);


    const fetchAllPolls = useCallback(async (page, limit, search) => {
        const signal = createSignal();
        try {
            dispatch(setLoading(true))
            const response = await pollApi.fetchPolls(page, limit, search, signal);
            if (response.data.message == "polls_received") {
                dispatch(setAdminPolls(response.data));
            }
            dispatch(setLoading(false))
            return response;
        } catch (error) {
            if (axios.isCancel(error)) return;
            dispatch(setLoading(false))
            throw error;
        }
    }, [dispatch]);

    const createPoll = useCallback(async (data) => {
        const signal = createSignal();
        try {
            dispatch(setLoading(true))
            const response = await pollApi.createPoll(data, signal);
            if (response.data.message == "poll_created") {
                toast.success("Poll created successfully", { duration: 3000, position: 'bottom-right' });
            }
            dispatch(setLoading(false))
            return response;
        } catch (error) {
            if (axios.isCancel(error)) return;
            dispatch(setLoading(false))
            throw error;
        }
    }, [dispatch]);

    const getPoll = useCallback(async (pollId, navigate) => {
        const signal = createSignal()
        try {
            dispatch(setLoading(true));
            const response = await pollApi.getPoll(pollId, signal);
            const { message, payload } = response.data;
            dispatch(setPoll(payload))
            dispatch(setLoading(false));
            return response;
        } catch (error) {
            if (axios.isCancel(error)) return;
            dispatch(setLoading(false));
            throw error;
        }
    }, [dispatch]);

    const votePoll = useCallback(async (pollId, optionId, userIp) => {
        const signal = createSignal()
        try {
            dispatch(setVoting(true));
            const response = await pollApi.votePoll(pollId, optionId, userIp, signal);
            const { message, payload } = response.data;
            if (message === "Response Saved") {
                dispatch(activateSSE(true));
                dispatch(setSubmitted({ pollId, optionId }));
                localStorage.setItem("submissions", JSON.stringify([...submitted, { pollId, optionId }]));
                toast.success("Response Saved", { duration: 3000, position: 'bottom-right' });
            }
            dispatch(setVoting(false));
            return response;
        } catch (error) {
            if (axios.isCancel(error)) return;
            dispatch(setVoting(false));
            throw error;
        }
    }, [dispatch]);

    return {
        getPoll,
        votePoll,
        setupVotesSSE,
        fetchAllPolls,
        createPoll
    };
};

export default usePoll; 