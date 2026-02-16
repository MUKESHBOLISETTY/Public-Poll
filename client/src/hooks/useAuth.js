import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    setLoading,
    setToken,
    setUser,
    setError,
    setEmail,
    resetAuth
} from '../redux/slices/authSlice';
import { useCallback } from 'react';
import { useRef } from 'react';
import axios from 'axios';

export const useAuth = () => {
    const dispatch = useDispatch();
    const abortControllerRef = useRef(null);

    const createSignal = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        return abortControllerRef.current.signal;
    };
    const { loading, token, user, error, email, navigation } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const location = useLocation();
    const locationRef = useRef(location.pathname);
    useEffect(() => {
        locationRef.current = location.pathname;
    }, [location.pathname]);
    const nullUserTimeoutRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const eventSourceRef = useRef(null);

    const setupUserSSE = useCallback(() => {
        if (!token) {
            dispatch(setError("Authentication required for real-time updates."));
            return;
        }

        const clearNullUserTimer = () => {
            if (nullUserTimeoutRef.current) {
                clearTimeout(nullUserTimeoutRef.current);
                nullUserTimeoutRef.current = null;
            }
        };

        const clearReconnectTimer = () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
        };

        const connect = () => {
            clearReconnectTimer();

            if (eventSourceRef.current) eventSourceRef.current.close();

            const es = new EventSource(
                `${import.meta.env.VITE_API_URL}/auth/getUser/${token}/${email}`
            );
            eventSourceRef.current = es;

            es.onopen = () => {
                console.log("SSE connection opened.");
                clearNullUserTimer();
            };

            es.addEventListener("initial_user_data", (event) => {
                try {
                    clearNullUserTimer();
                    dispatch(setLoading(true));
                    const parseddata = JSON.parse(event.data);
                    dispatch(setUser(parseddata));
                    dispatch(setLoading(false));

                    const currentPath = locationRef.current;
                    if (parseddata?.type === "Admin") {
                        if (!currentPath.startsWith("/admin")) navigate("/admin");
                    } else if (currentPath.startsWith("/login") || currentPath.startsWith("/signup")) {
                        navigate(navigation || "/");
                    }
                } catch (e) {
                    console.error("Initial data parse error:", e);
                }
            });

            es.addEventListener("user_update", (event) => {
                try {
                    clearNullUserTimer();
                    dispatch(setUser(JSON.parse(event.data)));
                    dispatch(setLoading(false));
                } catch (e) {
                    console.error("Update parse error:", e);
                }
            });

            es.addEventListener("restricted", () => {
                console.warn("Restricted event — closing SSE.");
                clearNullUserTimer();
                clearReconnectTimer();
                es.close();
            });

            es.onerror = () => {
                console.warn("SSE error — reconnecting in 5s...");
                es.close();

                if (!nullUserTimeoutRef.current) {
                    nullUserTimeoutRef.current = setTimeout(() => {
                        dispatch(setUser(null));
                    }, 10000);
                }

                clearReconnectTimer();
                reconnectTimeoutRef.current = setTimeout(connect, 5000);
            };
        };

        connect();

        return () => {
            if (eventSourceRef.current) eventSourceRef.current.close();
            clearNullUserTimer();
            clearReconnectTimer();
        };
    }, [token, email, dispatch, navigate, navigation]);


    const signUp = async (data, navigate) => {
        try {
            dispatch(setLoading(true));
            const response = await authApi.signup(data);
            dispatch(setLoading(false));
            if (response.data.message == "User registered successfully") {
                toast.success('Check your mail box for otp', {
                    duration: 2000,
                    position: 'bottom-right',
                });
            }
            return response;
        } catch (error) {
            dispatch(setLoading(false));
            dispatch(setError(error.message));
            throw error;
        }
    };

    const handleLogout = async (navigate) => {
        try {
            localStorage.removeItem("token");
            localStorage.removeItem("email");
            dispatch(resetAuth());
            navigate('/')
            toast.success('Logged Out Successfully', {
                duration: 2000,
                position: 'bottom-right',
            });

        } catch (error) {
            dispatch(setError(error.message));
            throw error;
        }
    }

    const login = useCallback(async (data, navigate) => {
        const signal = createSignal()
        try {
            dispatch(setLoading(true));
            const response = await authApi.login(data, signal);
            const { payload, message } = response.data;
            if (message === "userlogin") {
                localStorage.setItem("token", payload.token);
                localStorage.setItem("email", payload.email);
                dispatch(setToken(payload.token));
                dispatch(setEmail(payload.email));
                if (navigation) {
                    navigate(navigation)
                }
                else {
                    navigate('/')
                }
                toast.success('Login Successful', {
                    duration: 2000,
                    position: 'bottom-right',
                });
            }
            dispatch(setLoading(false));
            return response;
        } catch (error) {
            if (axios.isCancel(error)) return;
            dispatch(setLoading(false));
            dispatch(setError(error.message));
            throw error;
        }
    }, [dispatch]);

    return {
        signUp,
        handleLogout,
        login,
        setupUserSSE,
    };
};

export default useAuth; 