import axios from 'axios';
import toast from 'react-hot-toast';
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isCancel(error)) {
            return Promise.reject(error);
        }
        if (error.response?.data.message) {
            toast.error(error.response.data.message, {
                duration: 3000,
                position: 'bottom-right',
                icon: '⚠️',
            })
        }
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export const authApi = {
    login: (data, signal) => api.post('/auth/login', data, { signal }),
    signup: (data) => api.post('/auth/signup', data),
}
export const pollApi = {
    getPoll: (pollId, signal) => api.get(`/poll/getPoll/${pollId}`, { signal }),
    createPoll: (data, signal) => api.post(`/poll/createPoll`, data, { signal }),
    votePoll: (pollId, optionId, userIp, signal) => api.post(`/poll/votePoll/${pollId}`, { optionId, userIp }, { signal }),
    fetchPolls: (page, limit, search, signal) => api.get(`/poll/getAllPolls?page=${page}&limit=${limit}&search=${search}`, { signal }),
}
export default api; 