import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router';
import { Menu, X, Activity, LogOut, User, Sun, Moon } from 'lucide-react';
import { AuthContext } from '../Provider/AuthProvider';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

    const userDropdownRef = useRef(null);

    const { user, loading, logOut } = useContext(AuthContext);

    // Dark Mode State and Logic
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('fitTheme') || 'light';
        }
        return 'light';
    });

    // Toggle mobile menu state
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    // Handle user logout
    const handleLogout = async () => {
        try {
            await logOut();
            toast.success('Successfully logged out.');
            setIsMenuOpen(false);
            setIsUserDropdownOpen(false);
        } catch (error) {
            console.error("Logout failed:", error);
            toast.error('Logout failed');
        }
    };

    // Effect to close user dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setIsUserDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Dark Mode logic to apply classes to the HTML element
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('fitTheme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
    };

    // Framer Motion variants for animations
    const dropdownVariants = {
        hidden: { opacity: 0, y: -10, pointerEvents: 'none' },
        visible: { opacity: 1, y: 0, pointerEvents: 'auto', transition: { duration: 0.25 } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
    };

    const mobileMenuVariants = {
        hidden: { opacity: 0, height: 0, transition: { when: "afterChildren", duration: 0.2 } },
        visible: { opacity: 1, height: "auto", transition: { duration: 0.3, when: "beforeChildren", staggerChildren: 0.05 } },
        exit: { opacity: 0, height: 0, transition: { duration: 0.25, when: "afterChildren", staggerChildren: 0.05, staggerDirection: -1 } },
    };

    const navItemVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    };

    // Skeleton loader for navigation links
    const NavLinkSkeleton = ({ widthClass = 'w-20' }) => (
        <motion.div
            className={`h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse ${widthClass}`}
            variants={navItemVariants}
        />
    );

    // Function to get user initial for avatar
    const getUserInitial = (user) => {
        if (user && (user.displayName || user.name)) {
            return (user.displayName || user.name).charAt(0).toUpperCase();
        }
        return '';
    };

    // Common NavLink styling
    const getNavLinkClass = (isActive) => `px-4 py-2 rounded-lg font-medium ${isActive ? 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950' : 'text-gray-700 dark:text-gray-300 hover:text-blue-700 hover:bg-blue-50 dark:hover:text-blue-300 dark:hover:bg-blue-950 transition duration-300'}`;
    const getMobileNavLinkClass = (isActive) => `block w-full text-left px-4 py-3 rounded-lg font-medium ${isActive ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-950'} transition duration-300`;

    return (
        <nav className="bg-white  dark:bg-gray-900 shadow-lg dark:shadow-gray-800 sticky top-0 z-40 border-b border-gray-100 dark:border-gray-800">
            <div className="lg:container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <motion.div whileHover={{ scale: 1.05 }} className="flex-shrink-0">
                        <Link to="/" className="flex items-center space-x-3 group" aria-label="FitFlow Home">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-orange-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                                <div className="relative bg-gradient-to-r from-blue-700 to-orange-600 p-2 rounded-xl">
                                    <Activity className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-orange-600 bg-clip-text text-transparent">FitFlow</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">Fitness Platform</span>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden lg:flex items-center space-x-4">
                        {loading ? (
                            Array(6).fill(0).map((_, i) => <NavLinkSkeleton key={i} widthClass="w-20" />)
                        ) : (
                            <>
                                <motion.div whileHover={{ scale: 1.1 }} className="inline-block origin-center">
                                    <NavLink to="/" className={({ isActive }) => getNavLinkClass(isActive)}>Home</NavLink>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.1 }} className="inline-block origin-center">
                                    <NavLink to="/trainers" className={({ isActive }) => getNavLinkClass(isActive)}>Trainers</NavLink>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.1 }} className="inline-block origin-center">
                                    <NavLink to="/classes" className={({ isActive }) => getNavLinkClass(isActive)}>Classes</NavLink>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.1 }} className="inline-block origin-center">
                                    <NavLink to="/community" className={({ isActive }) => getNavLinkClass(isActive)}>Community</NavLink>
                                </motion.div>
                                {user?.role === 'member' && (
                                    <motion.div whileHover={{ scale: 1.1 }} className="inline-block origin-center">
                                        <NavLink to="/be-trainer" className={({ isActive }) => getNavLinkClass(isActive)}>Be A Trainer</NavLink>
                                    </motion.div>
                                )}
                                {user && (
                                    <motion.div whileHover={{ scale: 1.1 }} className="inline-block origin-center">
                                        <NavLink to="/dashboard" className={({ isActive }) => getNavLinkClass(isActive)}>Dashboard</NavLink>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Desktop User/Auth Section & Dark Mode Toggle */}
                    <div className="hidden lg:flex items-center space-x-4">
                        {/* Dark Mode Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-300 focus:outline-none"
                            aria-label="Toggle dark mode"
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                {theme === 'dark' ? (
                                    <motion.div key="moon" initial={{ scale: 0.6, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.6, rotate: 90 }} transition={{ duration: 0.2 }}>
                                        <Moon className="h-6 w-6" />
                                    </motion.div>
                                ) : (
                                    <motion.div key="sun" initial={{ scale: 0.6, rotate: 90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.6, rotate: -90 }} transition={{ duration: 0.2 }}>
                                        <Sun className="h-6 w-6" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                        {loading ? (
                            <div className="flex items-center space-x-3 animate-pulse">
                                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                                <div className="flex flex-col space-y-1">
                                    <div className="w-24 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                    <div className="w-16 h-3 bg-gray-200 dark:bg-gray-800 rounded"></div>
                                </div>
                            </div>
                        ) : user ? (
                            <div className="relative" ref={userDropdownRef}>
                                <div
                                    className={`p-0.5 rounded-full inline-block transition-all duration-300 ${isUserDropdownOpen ? 'bg-gradient-to-r from-blue-400 to-orange-400' : 'bg-gradient-to-r from-blue-400 to-orange-400'}`}
                                >
                                    <div className="bg-white dark:bg-gray-900 rounded-full overflow-hidden">
                                        <button
                                            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                            className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-800 rounded-full pl-1 pr-4 py-1 cursor-pointer hover:shadow transition-all duration-200 focus:outline-none focus:ring-0"
                                            aria-expanded={isUserDropdownOpen}
                                            aria-haspopup="true"
                                        >
                                            {user.photoURL ? (
                                                <img src={user.photoURL} alt={user.displayName || user.name} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-900 shadow-sm" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-orange-400 flex items-center justify-center text-white font-bold text-lg border-2 border-white dark:border-gray-900 shadow-sm">
                                                    {getUserInitial(user)}
                                                </div>
                                            )}
                                            <div className="text-left">
                                                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[100px]">
                                                    {user.displayName || user.name}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                    {user.role || 'User'}
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {isUserDropdownOpen && (
                                        <motion.div
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            variants={dropdownVariants}
                                            className="absolute right-0 w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg shadow-lg dark:shadow-blue-950 z-50 py-1"
                                        >
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 font-medium transition duration-300 text-sm"
                                            >
                                                <LogOut className="h-4 w-4" /> <span>Logout</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <motion.div whileHover={{ scale: 1.1 }} className="inline-block origin-center">
                                    <NavLink to="/login" className={({ isActive }) => `px-6 py-3 font-medium rounded-full ${isActive ? 'text-blue-700 dark:text-blue-300 bg-gray-50 dark:bg-gray-900' : 'text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition duration-300'}`}>Login</NavLink>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.1 }} className="inline-block origin-center">
                                    <NavLink to="/register" className="px-6 py-3 bg-gradient-to-r from-blue-700 to-orange-600 text-white rounded-full hover:from-blue-800 hover:to-orange-700 transition duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">Get Started</NavLink>
                                </motion.div>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle Button & Dark Mode Toggle */}
                    <div className="flex items-center lg:hidden">
                        <button
                            onClick={toggleTheme}
                            className="p-2 mr-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-300 focus:outline-none"
                            aria-label="Toggle dark mode"
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                {theme === 'dark' ? (
                                    <motion.div key="moon-mobile" initial={{ scale: 0.6, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.6, rotate: 90 }} transition={{ duration: 0.2 }}>
                                        <Moon className="h-6 w-6" />
                                    </motion.div>
                                ) : (
                                    <motion.div key="sun-mobile" initial={{ scale: 0.6, rotate: 90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.6, rotate: -90 }} transition={{ duration: 0.2 }}>
                                        <Sun className="h-6 w-6" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                        <button
                            onClick={toggleMenu}
                            className="p-2 text-gray-700 dark:text-gray-300 hover:text-blue-700 hover:bg-blue-50 dark:hover:text-blue-300 dark:hover:bg-blue-950 rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            aria-label="Toggle menu"
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                {isMenuOpen ? (
                                    <motion.div key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: -90 }} transition={{ duration: 0.2 }}>
                                        <X className="h-6 w-6" />
                                    </motion.div>
                                ) : (
                                    <motion.div key="open" initial={{ rotate: 90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }} transition={{ duration: 0.2 }}>
                                        <Menu className="h-6 w-6" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Content */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={mobileMenuVariants}
                            className="lg:hidden bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 overflow-hidden py-4"
                        >
                            <div className="px-4 space-y-2">
                                <motion.div key="/" variants={navItemVariants} whileTap={{ scale: 0.95 }}>
                                    <NavLink to="/" className={({ isActive }) => getMobileNavLinkClass(isActive)} onClick={() => setIsMenuOpen(false)}>Home</NavLink>
                                </motion.div>
                                <motion.div key="/trainers" variants={navItemVariants} whileTap={{ scale: 0.95 }}>
                                    <NavLink to="/trainers" className={({ isActive }) => getMobileNavLinkClass(isActive)} onClick={() => setIsMenuOpen(false)}>Trainers</NavLink>
                                </motion.div>
                                <motion.div key="/classes" variants={navItemVariants} whileTap={{ scale: 0.95 }}>
                                    <NavLink to="/classes" className={({ isActive }) => getMobileNavLinkClass(isActive)} onClick={() => setIsMenuOpen(false)}>Classes</NavLink>
                                </motion.div>
                                <motion.div key="/community" variants={navItemVariants} whileTap={{ scale: 0.95 }}>
                                    <NavLink to="/community" className={({ isActive }) => getMobileNavLinkClass(isActive)} onClick={() => setIsMenuOpen(false)}>Community</NavLink>
                                </motion.div>
                                {user?.role === 'member' && (
                                    <motion.div variants={navItemVariants} whileTap={{ scale: 0.95 }}>
                                        <NavLink to="/be-trainer" className={({ isActive }) => getMobileNavLinkClass(isActive)} onClick={() => setIsMenuOpen(false)}>Be A Trainer</NavLink>
                                    </motion.div>
                                )}
                                {user && (
                                    <motion.div variants={navItemVariants} whileTap={{ scale: 0.95 }}>
                                        <NavLink to="/dashboard" className={({ isActive }) => getMobileNavLinkClass(isActive)} onClick={() => setIsMenuOpen(false)}>Dashboard</NavLink>
                                    </motion.div>
                                )}

                                {/* User/Auth Section for Mobile */}
                                <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mt-4">
                                    {loading ? (
                                        <div className="flex items-center space-x-3 px-4 animate-pulse">
                                            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                                            <div className="flex flex-col space-y-1 w-full">
                                                <div className="w-3/4 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                                                <div className="w-1/2 h-3 bg-gray-200 dark:bg-gray-800 rounded"></div>
                                            </div>
                                        </div>
                                    ) : user ? (
                                        <div className="space-y-2">
                                            <motion.div variants={navItemVariants} whileTap={{ scale: 0.95 }}>
                                                <div className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950">
                                                    {user.photoURL ? (
                                                        <img src={user.photoURL} alt={user.displayName || user.name} className="w-10 h-10 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-orange-400 flex items-center justify-center text-white font-bold text-lg">{getUserInitial(user)}</div>
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user.displayName || user.name}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role || 'User'}</div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                            <motion.button
                                                onClick={handleLogout}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex items-center justify-center space-x-2 px-4 py-3 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-500 bg-red-50 dark:bg-red-950 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg w-full font-medium transition duration-300"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                <span>Logout</span>
                                            </motion.button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 px-4">
                                            <motion.div variants={navItemVariants} whileTap={{ scale: 0.95 }}>
                                                <NavLink to="/login" className="block w-full text-center px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-950" onClick={() => setIsMenuOpen(false)}>Login</NavLink>
                                            </motion.div>
                                            <motion.div variants={navItemVariants} whileTap={{ scale: 0.95 }}>
                                                <NavLink to="/register" className="block w-full text-center px-4 py-3 bg-gradient-to-r from-blue-700 to-orange-600 text-white rounded-lg hover:from-blue-800 hover:to-orange-700 font-medium transition duration-300 shadow-md" onClick={() => setIsMenuOpen(false)}>Get Started</NavLink>
                                            </motion.div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
};

export default Navbar;