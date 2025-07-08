import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router';
import { Menu, X, Activity, LogOut, User } from 'lucide-react';
import { AuthContext } from '../Provider/AuthProvider';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { user, loading, logOut } = useContext(AuthContext);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = async () => {
        try {
            await logOut();
            toast.success('Successfully logged out.');
        } catch (error) {
            console.error("Logout failed:", error);
            toast.error('Logout failed');
        }
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Animation variants for dropdown
    const dropdownVariants = {
        hidden: { opacity: 0, y: -10, pointerEvents: 'none' },
        visible: { opacity: 1, y: 0, pointerEvents: 'auto', transition: { duration: 0.25 } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
    };

    // Animation variants for mobile menu
    const mobileMenuVariants = {
        hidden: { opacity: 0, height: 0, transition: { when: "afterChildren" } },
        visible: { opacity: 1, height: "auto", transition: { duration: 0.3, when: "beforeChildren" } },
        exit: { opacity: 0, height: 0, transition: { duration: 0.25, when: "afterChildren" } },
    };

    // Animation variants for individual nav items
    const navItemVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0 },
    };

    // Skeleton loader for nav links
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
        <nav className="bg-white/95 backdrop-blur-md shadow-xl sticky top-0 z-50 border-b border-gray-100">
            <div className="lg:container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <NavLink to="/" className="flex items-center space-x-3 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-orange-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300-opacity duration-300"></div>
                            <div className="relative bg-gradient-to-r from-blue-700 to-orange-600 p-2 rounded-xl">
                                <Activity className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-orange-600 bg-clip-text text-transparent">
                                FitFlow
                            </span>
                            <span className="text-xs text-gray-500 -mt-1">Fitness Platform</span>
                        </div>
                    </NavLink>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        {loading ? (
                            <>
                                <NavLinkSkeleton widthClass="w-16" />
                                <NavLinkSkeleton widthClass="w-20" />
                                <NavLinkSkeleton widthClass="w-16" />
                                <NavLinkSkeleton widthClass="w-24" />
                                <NavLinkSkeleton widthClass="w-24" />
                                <NavLinkSkeleton widthClass="w-24" />
                            </>
                        ) : (
                            <>
                                <motion.div variants={navItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                                    <NavLink
                                        to="/"
                                        className={({ isActive }) =>
                                            `px-4 py-2 rounded-lg font-medium ${isActive ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition duration-300'
                                            }`
                                        }
                                    >
                                        Home
                                    </NavLink>
                                </motion.div>
                                <motion.div variants={navItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                                    <NavLink
                                        to="/trainers"
                                        className={({ isActive }) =>
                                            `px-4 py-2 rounded-lg font-medium ${isActive ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition duration-300'
                                            }`
                                        }
                                    >
                                        Trainers
                                    </NavLink>
                                </motion.div>
                                <motion.div variants={navItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
                                    <NavLink
                                        to="/classes"
                                        className={({ isActive }) =>
                                            `px-4 py-2 rounded-lg font-medium ${isActive ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition duration-300'
                                            }`
                                        }
                                    >
                                        Classes
                                    </NavLink>
                                </motion.div>
                                <motion.div variants={navItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
                                    <NavLink
                                        to="/community"
                                        className={({ isActive }) =>
                                            `px-4 py-2 rounded-lg font-medium ${isActive ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition duration-300'
                                            }`
                                        }
                                    >
                                        Community
                                    </NavLink>
                                </motion.div>
                                <motion.div variants={navItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
                                    <NavLink
                                        to="/beATrainer"
                                        className={({ isActive }) =>
                                            `px-4 py-2 rounded-lg font-medium ${isActive ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition duration-300'
                                            }`
                                        }
                                    >
                                        Be A Trainer
                                    </NavLink>
                                </motion.div>
                                {user && (
                                    <motion.div variants={navItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }}>
                                        <NavLink
                                            to="/dashboard"
                                            className={({ isActive }) =>
                                                `px-4 py-2 rounded-lg font-medium ${isActive ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition duration-300'
                                                }`
                                            }
                                        >
                                            Dashboard
                                        </NavLink>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Auth Section */}
                    <div className="hidden md:flex items-center space-x-4">
                        {loading ? (
                            // Existing user profile skeleton
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
                                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                                    className="flex items-center space-x-3 bg-gray-50 rounded-full pl-1 pr-4 py-1 cursor-pointer hover:shadow"
                                >
                                    {user.photoURL ? (
                                        <img
                                            src={user.photoURL}
                                            alt={user.displayName || user.name}
                                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                                        />
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

                                {/* Dropdown with Profile and Logout */}
                                <AnimatePresence>
                                    {isDropdownOpen && (
                                        <motion.div
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            variants={dropdownVariants}
                                            className="absolute right-0 w-44 bg-white border border-gray-100 rounded-lg shadow-lg z-50 mt-2"
                                        >
                                            <NavLink
                                                to="/profile"
                                                onClick={() => setIsDropdownOpen(false)}
                                                className={({ isActive }) =>
                                                    `w-full flex items-center space-x-2 px-4 py-2 font-medium ${isActive ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition duration-300'
                                                    }`
                                                }
                                            >
                                                <User className="h-4 w-4" />
                                                <span>Profile</span>
                                            </NavLink>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 font-medium transition duration-300"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                <span>Logout</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <motion.div variants={navItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.6 }}>
                                    <NavLink
                                        to="/login"
                                        className={({ isActive }) =>
                                            `px-6 py-2 font-medium rounded-full ${isActive ? 'text-blue-700 bg-gray-50' : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50 transition duration-300'
                                            }`
                                        }
                                    >
                                        Login
                                    </NavLink>
                                </motion.div>
                                <motion.div variants={navItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.7 }}>
                                    <NavLink
                                        to="/register"
                                        className="px-6 py-2 bg-gradient-to-r from-blue-700 to-orange-600 text-white rounded-full hover:from-blue-800 hover:to-orange-700 transition duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        Get Started
                                    </NavLink>
                                </motion.div>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMenu}
                        className="md:hidden p-2 text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition duration-300"
                        aria-label="Toggle menu"
                    >
                        <AnimatePresence exitBeforeEnter initial={false}>
                            {isMenuOpen ? (
                                <div
                                    key="close"
                                >
                                    <X className="h-6 w-6" />
                                </div>
                            ) : (
                                <div
                                    key="open"
                                >
                                    <Menu className="h-6 w-6" />
                                </div>
                            )}
                        </AnimatePresence>
                    </button>
                </div>

                {/* Mobile Navigation */}
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
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    visible: {
                                        transition: { staggerChildren: 0.07, delayChildren: 0.2 }
                                    },
                                    hidden: {
                                        transition: { staggerChildren: 0.05, staggerDirection: -1 }
                                    }
                                }}
                                className="px-4 pt-4 pb-6 space-y-2"
                            >
                                {loading ? (
                                    <>
                                        <motion.div variants={navItemVariants}><NavLinkSkeleton widthClass="w-full h-10" /></motion.div>
                                        <motion.div variants={navItemVariants}><NavLinkSkeleton widthClass="w-full h-10" /></motion.div>
                                        <motion.div variants={navItemVariants}><NavLinkSkeleton widthClass="w-full h-10" /></motion.div>
                                        <motion.div variants={navItemVariants}><NavLinkSkeleton widthClass="w-full h-10" /></motion.div>
                                        <motion.div variants={navItemVariants}><NavLinkSkeleton widthClass="w-full h-10" /></motion.div>
                                        <motion.div variants={navItemVariants}><NavLinkSkeleton widthClass="w-full h-10" /></motion.div>
                                        <div className="border-t border-gray-200 pt-4 mt-4">
                                            <div className="space-y-2 animate-pulse">
                                                <div className="flex items-center space-x-3 px-4 py-2">
                                                    <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                                                    <div>
                                                        <div className="w-24 h-4 bg-gray-300 rounded mb-1"></div>
                                                        <div className="w-16 h-3 bg-gray-200 rounded"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <motion.div variants={navItemVariants}>
                                            <NavLink
                                                to="/"
                                                onClick={() => setIsMenuOpen(false)}
                                                className={({ isActive }) =>
                                                    `block px-4 py-3 rounded-lg font-medium transition duration-300 ${isActive ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                                                    }`
                                                }
                                            >Home</NavLink>
                                        </motion.div>
                                        <motion.div variants={navItemVariants}>
                                            <NavLink
                                                to="/trainers"
                                                onClick={() => setIsMenuOpen(false)}
                                                className={({ isActive }) =>
                                                    `block px-4 py-3 rounded-lg font-medium transition duration-300 ${isActive ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                                                    }`
                                                }
                                            >Trainers</NavLink>
                                        </motion.div>
                                        <motion.div variants={navItemVariants}>
                                            <NavLink
                                                to="/classes"
                                                onClick={() => setIsMenuOpen(false)}
                                                className={({ isActive }) =>
                                                    `block px-4 py-3 rounded-lg font-medium transition duration-300 ${isActive ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                                                    }`
                                                }
                                            >Classes</NavLink>
                                        </motion.div>
                                        <motion.div variants={navItemVariants}>
                                            <NavLink
                                                to="/beATrainer"
                                                onClick={() => setIsMenuOpen(false)}
                                                className={({ isActive }) =>
                                                    `block px-4 py-3 rounded-lg font-medium transition duration-300 ${isActive ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                                                    }`
                                                }
                                            >Be A Trainer</NavLink>
                                        </motion.div>
                                        <motion.div variants={navItemVariants}>
                                            <NavLink
                                                to="/community"
                                                onClick={() => setIsMenuOpen(false)}
                                                className={({ isActive }) =>
                                                    `block px-4 py-3 rounded-lg font-medium transition duration-300 ${isActive ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                                                    }`
                                                }
                                            >Community</NavLink>
                                        </motion.div>
                                        {user && (
                                            <motion.div variants={navItemVariants}>
                                                <NavLink
                                                    to="/dashboard"
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className={({ isActive }) =>
                                                        `block px-4 py-3 rounded-lg font-medium transition duration-300 ${isActive ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                                                        }`
                                                    }
                                                >Dashboard</NavLink>
                                            </motion.div>
                                        )}
                                        <div className="border-t border-gray-200 pt-4 mt-4">
                                            {user ? (
                                                <div className="space-y-2">
                                                    <Link to={'/profile'}>
                                                        <div className="flex items-center space-x-3 px-4 py-2">
                                                            {user.photoURL ? (
                                                                <img
                                                                    src={user.photoURL}
                                                                    alt={user.displayName || user.name}
                                                                    className="w-10 h-10 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                                                    {getUserInitial(user)}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="text-sm font-semibold text-gray-800">{user.displayName || user.name}</div>
                                                                <div className="text-xs text-gray-500 capitalize">{user.role || 'User'}</div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                    <motion.div variants={navItemVariants}>
                                                        <button
                                                            onClick={handleLogout}
                                                            className="flex items-center justify-center space-x-2 px-4 py-3 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg w-full font-medium transition duration-300"
                                                        >
                                                            <LogOut className="h-4 w-4" />
                                                            <span>Logout</span>
                                                        </button>
                                                    </motion.div>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <motion.div variants={navItemVariants}>
                                                        <NavLink
                                                            to="/login"
                                                            onClick={() => setIsMenuOpen(false)}
                                                            className={({ isActive }) =>
                                                                `block px-4 py-3 rounded-lg font-medium transition duration-300 ${isActive ? 'text-blue-700 bg-blue-50' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-50'
                                                                }`
                                                            }
                                                        >Login</NavLink>
                                                    </motion.div>
                                                    <motion.div variants={navItemVariants}>
                                                        <NavLink
                                                            to="/register"
                                                            onClick={() => setIsMenuOpen(false)}
                                                            className="block px-4 py-3 bg-gradient-to-r transition duration-300 from-blue-700 to-orange-600 text-white rounded-lg hover:from-blue-800 hover:to-orange-700 font-medium text-center mx-4"
                                                        >Get Started</NavLink>
                                                    </motion.div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
};

export default Navbar;