import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    pollData: null,
    submitted: localStorage.getItem("submissions") ? JSON.parse(localStorage.getItem("submissions")) : [],
    voting: false,
    loading: false,
    activeSSE: false,
    admin: {
        polls: null,
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        selectedPoll: null,
        createPoll: false,
        creatingPoll: false,
    }
};

const pollSlice = createSlice({
    name: "poll",
    initialState,
    reducers: {
        setPoll(state, value) {
            state.pollData = value.payload;
        },
        setSelectedPoll(state, value) {
            state.admin.selectedPoll = value.payload;
        },
        setCreatePoll(state, value) {
            state.admin.createPoll = value.payload;
        },
        setCurrentPage: (state, value) => {
            state.admin.currentPage = value.payload;
        },
        setAdminPolls(state, value) {
            state.admin.polls = value.payload.payload;
            state.admin.currentPage = value.payload.currentPage;
            state.admin.totalPages = value.payload.totalPages;
            state.admin.totalItems = value.payload.totalItems;
        },
        setLoading(state, value) {
            state.loading = value.payload;
        },
        activateSSE(state, value) {
            state.activeSSE = value.payload;
        },
        setVoting(state, value) {
            state.voting = value.payload;
        },
        setSubmitted(state, value) {
            const existing = state.submitted.find(
                submission => submission === value.payload
            );
            if (!existing) {
                state.submitted.push(value.payload);
            }
        },
        setVoteCount(state, action) {
            const newCounts = action.payload;
            if (state.pollData && state.pollData.question && state.pollData.question.options) {
                state.pollData.question.options.forEach(option => {
                    if (newCounts[option._id] !== undefined) {
                        option.voteCount = newCounts[option._id];
                    }
                });
            }
        }
    }
});

export const { setPoll, setLoading, setCurrentPage, setAdminPolls, setCreatePoll, setSelectedPoll, activateSSE, setVoting, setSubmitted, setVoteCount } = pollSlice.actions;

export default pollSlice.reducer;