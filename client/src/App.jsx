import { useEffect, useState, lazy, Suspense } from 'react'
import './App.css'
import { Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import SignUp from './pages/auth/SignUp';
import PollPage from './pages/public/PollPage';
import { useSelector } from 'react-redux';
import usePoll from './hooks/usePoll';
import Login from './pages/auth/Login';
import LandingPage from './pages/LandingPage';
import useAuth from './hooks/useAuth';
import Dashboard from './pages/admin/Dashboard';

function App() {
  const navigate = useNavigate();
  const { activeSSE, pollData } = useSelector((state) => state.poll);
  const { token, user } = useSelector((state) => state.auth);
  const { setupVotesSSE } = usePoll();
  const { setupUserSSE } = useAuth();
  useEffect(() => {
    let cleanUpUserSSE;
    let cleanUpVoteSSE;

    if (token) {
      cleanUpUserSSE = setupUserSSE();
    }

    if (activeSSE && pollData?._id) {
      cleanUpVoteSSE = setupVotesSSE();
    }

    return () => {
      cleanUpUserSSE?.();
      cleanUpVoteSSE?.();
    };
  }, [token, activeSSE, pollData?._id]);

  useEffect(() => {
    if (!user) return;

    const path = location.pathname;

    if (user.role === "ADMIN") {
      if (!path.startsWith("/dashboard")) {
        navigate("/dashboard", { replace: true });
      }
      return;
    }

    if (path === "/login" || path === "/signup") {
      navigate("/", { replace: true });
    }

  }, [user, location.pathname, navigate]);
  return (
    <AppContent />
  );

}

function AppContent() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/login' element={<Login />} />
        <Route path='/poll/:pollId' element={<PollPage />} />
      </Routes>
    </>
  )
}
export default App
