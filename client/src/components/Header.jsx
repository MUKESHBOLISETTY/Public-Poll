import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Header = () => {
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const { user } = useSelector((state) => state.auth);
    const { handleLogout } = useAuth();
    const dispatch = useDispatch();

    const handleLogoutButton = () => {
        handleLogout(navigate);
        setIsDropdownOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-6 md:px-12 z-50">
            <div className="flex items-center gap-2 text-[#1337ec]">
                <div className="w-6 h-6">
                    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M24 4C25.7818 14.2173 33.7827 22.2182 44 24C33.7827 25.7818 25.7818 33.7827 24 44C22.2182 33.7827 14.2173 25.7818 4 24C14.2173 22.2182 22.2182 14.2173 24 4Z"
                            fill="currentColor"
                        />
                    </svg>
                </div>
                <h2 className="text-[#0d101b] dark:text-white text-xl font-bold leading-tight tracking-tight">
                    Public Poll
                </h2>
            </div>

            <div className="flex items-center gap-4">
                {!user ? (
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="text-sm font-semibold text-[#0d101b] dark:text-white px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all">
                            Login
                        </Link>
                        <Link to="/signup" className="text-sm font-semibold bg-[#1337ec] text-white px-4 py-2 rounded-lg hover:bg-[#102dc4] transition-all">
                            Sign Up
                        </Link>
                    </div>
                ) : (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 focus:outline-none"
                        >
                            <div className="w-10 h-10 rounded-full bg-[#1337ec] text-white flex items-center justify-center font-bold border-2 border-white shadow-sm">
                                {user?.name?.charAt(0) || "U"}
                            </div>
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1d29] rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 z-[60]">
                                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                                    <p className="text-sm font-bold text-[#0d101b] dark:text-white truncate">
                                        {user?.fullName || "User"}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                </div>

                                <Link
                                    to="/dashboard"
                                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    Dashboard
                                </Link>

                                <button
                                    onClick={handleLogoutButton}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;