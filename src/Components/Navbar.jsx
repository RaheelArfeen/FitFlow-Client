import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router';
import { Menu, X, Activity, LogOut, User } from 'lucide-react';
import { AuthContext } from '../Provider/AuthProvider';
import { toast } from 'sonner';
import { motion, AnimatePresence, scale } from 'framer-motion';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { user, loading, logOut } = useContext(AuthContext);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleLogout = async () => {
        try {
            await logOut();
            toast.success('Successfully logged out.');
        } catch (error) {
            console.error("Logout failed:", error);
            toast.error('Logout failed');
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const dropdownVariants = {
        hidden: { opacity: 0, y: -10, pointerEvents: 'none' },
        visible: { opacity: 1, y: 0, pointerEvents: 'auto', transition: { duration: 0.25 } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
    };

    const mobileMenuVariants = {
        hidden: { opacity: 0, height: 0, transition: { when: "afterChildren" } },
        visible: { opacity: 1, height: "auto", transition: { duration: 0.3, when: "beforeChildren" } },
        exit: { opacity: 0, height: 0, transition: { duration: 0.25, when: "afterChildren" } },
    };

    const navItemVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0 },
    };

    const NavLinkSkeleton = ({ widthClass = 'w-20' }) => (
        <motion.div
            className={`h-8 bg-gray-200 rounded-lg animate-pulse ${widthClass}`}
            variants={navItemVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3 }}
        />
    );

    const getUserInitial = (user) => {
        if (user && (user.displayName || user.name)) {
            return (user.displayName || user.name).charAt(0).toUpperCase();
        }
        return '';
    };

    return (
        <nav className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-40 border-b border-gray-100">
            <div className="lg:container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <motion.div whileHover={{ scale: 1.05 }}>
                        <NavLink to="/" className="flex items-center space-x-3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-orange-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                                <div className="relative bg-gradient-to-r from-blue-700 to-orange-600 p-2 rounded-xl">
                                    <Activity className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-orange-600 bg-clip-text text-transparent">FitFlow</span>
                                <span className="text-xs text-gray-500 -mt-1">Fitness Platform</span>
                            </div>
                        </NavLink>
                    </motion.div>

                    <div className="hidden md:flex items-center space-x-4">
                        {loading ? (
                            Array(6).fill(0).map((_, i) => <NavLinkSkeleton key={i} widthClass="w-20" />)
                        ) : (
                            <>
                                {['/', '/trainers', '/classes', '/community'].map((path, i) => {
                                    const label = path === '/' ? 'Home' :
                                        path.replace('/', '').charAt(0).toUpperCase() + path.slice(2);
                                    return (
                                        <motion.div key={path} whileHover={{ scale: 1.1 }} className="inline-block origin-center">
                                            <NavLink
                                                to={path}
                                                className={({ isActive }) => `px-4 py-2 rounded-lg font-medium ${isActive ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition duration-300'}`}
                                            >
                                                {label}
                                            </NavLink>
                                        </motion.div>
                                    );
                                })}
                                {user?.role === 'member' && (
                                    <motion.div whileHover={{ scale: 1.1 }} className="inline-block origin-center">
                                        <NavLink
                                            to="/be-trainer"
                                            className={({ isActive }) => `px-4 py-2 rounded-lg font-medium ${isActive ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition duration-300'}`}
                                        >
                                            Be A Trainer
                                        </NavLink>
                                    </motion.div>
                                )}
                                {user && (
                                    <motion.div whileHover={{ scale: 1.1 }} className="inline-block origin-center">
                                        <NavLink
                                            to="/dashboard"
                                            className={({ isActive }) => `px-4 py-2 rounded-lg font-medium ${isActive ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition duration-300'}`}
                                        >
                                            Dashboard
                                        </NavLink>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        {loading ? (
                            <div className="flex items-center space-x-3 animate-pulse">
                                <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                                <div className="flex flex-col space-y-1">
                                    <div className="w-24 h-4 bg-gray-300 rounded"></div>
                                    <div className="w-16 h-3 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        ) : user ? (
                            <div className="relative" ref={dropdownRef}>
                                <div
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center space-x-3 bg-gray-50 rounded-full pl-1 pr-4 py-1 cursor-pointer hover:shadow"
                                >
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt={user.displayName || user.name} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg border-2 border-white shadow-sm">
                                            {getUserInitial(user)}
                                        </div>
                                    )}
                                    <div className="text-left">
                                        <div className="text-sm font-semibold text-gray-800">{user.displayName || user.name}</div>
                                        <div className="text-xs text-gray-500 capitalize">{user.role || 'User'}</div>
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {isDropdownOpen && (
                                        <motion.div
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            variants={dropdownVariants}
                                            className="absolute right-0 w-44 bg-white border border-gray-100 rounded-lg shadow-lg z-50 mt-2"
                                        >
                                            <div className="cursor-pointer">
                                                <NavLink
                                                    to="/profile"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                    className={({ isActive }) => `w-full flex items-center space-x-2 px-4 py-2 font-medium ${isActive ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition duration-300'}`}
                                                >
                                                    <User className="h-4 w-4" /> <span>Profile</span>
                                                </NavLink>
                                            </div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 font-medium transition duration-300"
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
                                    <NavLink
                                        to="/login"
                                        className={({ isActive }) => `px-6 py-3 font-medium rounded-full ${isActive ? 'text-blue-700 bg-gray-50' : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50 transition duration-300'}`}
                                    >
                                        Login
                                    </NavLink>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.1 }} className="inline-block origin-center">
                                    <NavLink
                                        to="/register"
                                        className="px-6 py-3 bg-gradient-to-r from-blue-700 to-orange-600 text-white rounded-full hover:from-blue-800 hover:to-orange-700 transition duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        Get Started
                                    </NavLink>
                                </motion.div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={toggleMenu}
                        className="md:hidden p-2 text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition duration-300"
                        aria-label="Toggle menu"
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            {isMenuOpen ? (
                                <motion.div key="close" initial={{ rotate: 0 }} animate={{ rotate: 180 }}>
                                    <X className="h-6 w-6" />
                                </motion.div>
                            ) : (
                                <motion.div key="open">
                                    <Menu className="h-6 w-6" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            key="mobile-menu"
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={mobileMenuVariants}
                            className="md:hidden bg-white border-t border-gray-100 shadow-lg overflow-hidden"
                        >
                            <div className="px-4 pt-4 pb-6 space-y-2">
                                {['/', '/trainers', '/classes', '/community'].map((path) => {
                                    const label = path === '/' ? 'Home' :
                                        path.replace('/', '').charAt(0).toUpperCase() + path.slice(2);
                                    return (
                                        <motion.div
                                            key={path}
                                            whileHover={{ scale: 1.05 }}
                                            className="block"
                                        >
                                            <NavLink
                                                to={path}
                                                className="block px-4 py-3 rounded-lg font-medium hover:bg-blue-50"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                {label}
                                            </NavLink>
                                        </motion.div>
                                    );
                                })}
                                {user?.role === 'member' && (
                                    <motion.div whileHover={{ scale: 1.05 }} className="block">
                                        <NavLink
                                            to="/be-trainer"
                                            className="block px-4 py-3 rounded-lg font-medium hover:bg-blue-50"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Be A Trainer
                                        </NavLink>
                                    </motion.div>
                                )}
                                {user && (
                                    <motion.div whileHover={{ scale: 1.05 }} className="block">
                                        <NavLink
                                            to="/dashboard"
                                            className="block px-4 py-3 rounded-lg font-medium hover:bg-blue-50"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Dashboard
                                        </NavLink>
                                    </motion.div>
                                )}

                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    {user ? (
                                        <div className="space-y-2">
                                            <Link to="/profile" className="flex items-center space-x-3 px-4 py-2" onClick={() => setIsMenuOpen(false)}>
                                                {user.photoURL ? (
                                                    <img src={user.photoURL} alt={user.displayName || user.name} className="w-10 h-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">{getUserInitial(user)}</div>
                                                )}
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-800">{user.displayName || user.name}</div>
                                                    <div className="text-xs text-gray-500 capitalize">{user.role || 'User'}</div>
                                                </div>
                                            </Link>
                                            <motion.button
                                                onClick={() => {
                                                    handleLogout();
                                                    setIsMenuOpen(false);
                                                }}
                                                whileHover={{ scale: 1.05 }}
                                                className="flex items-center justify-center space-x-2 px-4 py-3 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg w-full font-medium transition duration-300"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                <span>Logout</span>
                                            </motion.button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <motion.div whileHover={{ scale: 1.05 }}>
                                                <NavLink
                                                    to="/login"
                                                    className="block px-4 py-4 rounded-lg mx-4 text-center font-medium hover:bg-blue-50"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    Login
                                                </NavLink>
                                            </motion.div>
                                            <motion.div whileHover={{ scale: 1.05 }}>
                                                <NavLink
                                                    to="/register"
                                                    className="block px-4 py-4 bg-gradient-to-r from-blue-700 to-orange-600 text-white rounded-lg hover:from-blue-800 hover:to-orange-700 font-medium text-center mx-4"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    Get Started
                                                </NavLink>
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