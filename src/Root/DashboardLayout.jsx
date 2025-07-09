import React, { useContext, useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router'; // Changed to react-router-dom for Link and Outlet
import { motion, AnimatePresence } from 'framer-motion'; // Import motion and AnimatePresence
import {
    Activity, Users, Calendar, BarChart3, MessageSquare, Plus, User, BookOpen,
    Mail, UserCheck, DollarSign, Clock, Home, Crown, Trophy, Menu, X
} from 'lucide-react';
import { AuthContext } from '../Provider/AuthProvider';

const DashboardLayout = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        // Close drawer when location changes (for mobile)
        if (isDrawerOpen) {
            setIsDrawerOpen(false);
        }
        const timer = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 300);
        return () => clearTimeout(timer);
    }, [location.pathname]); // Depend on location.pathname to close drawer and scroll

    const getMenuItems = () => {
        const baseItems = [{ icon: BarChart3, label: 'Overview', path: '/dashboard' }];

        if (user?.role === 'admin') {
            return [
                ...baseItems,
                { icon: Mail, label: 'Newsletter Subscribers', path: '/dashboard/subscribers' },
                { icon: Users, label: 'All Trainers', path: '/dashboard/trainers' },
                { icon: UserCheck, label: 'Applied Trainers', path: '/dashboard/applied-trainers' },
                { icon: DollarSign, label: 'Balance', path: '/dashboard/balance' },
                { icon: Plus, label: 'Add New Class', path: '/dashboard/add-class' },
                { icon: MessageSquare, label: 'Add New Community', path: '/dashboard/add-Community' },
            ];
        }

        if (user?.role === 'trainer') {
            return [
                ...baseItems,
                { icon: Clock, label: 'Manage Slots', path: '/dashboard/manage-slots' },
                { icon: Plus, label: 'Add New Slot', path: '/dashboard/add-slot' },
                { icon: MessageSquare, label: 'Add New Community', path: '/dashboard/add-Community' },
            ];
        }

        return [
            ...baseItems,
            { icon: BookOpen, label: 'Activity Log', path: '/dashboard/activity-log' },
            { icon: Calendar, label: 'Booked Trainers', path: '/dashboard/booked-trainers' },
            { icon: MessageSquare, label: 'Add New Community', path: '/dashboard/add-Community' },
        ];
    };

    const menuItems = getMenuItems();

    // Framer Motion Variants for sidebar
    const sidebarVariants = {
        hidden: { x: '-100%' },
        visible: { x: '0%', transition: { type: 'spring', stiffness: 200, damping: 25 } },
        exit: { x: '-100%', transition: { type: 'spring', stiffness: 200, damping: 25 } }
    };

    // Framer Motion Variants for menu items (staggering effect)
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Mobile Top Navbar */}
            <div className="lg:hidden p-4 bg-white shadow-sm flex justify-between items-center sticky top-0 z-40">
                <Link to="/" className="flex items-center space-x-3 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-orange-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative bg-gradient-to-r from-blue-700 to-orange-600 p-2 rounded-xl">
                            <Activity className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-orange-600 bg-clip-text text-transparent">FitFlow</span>
                        <span className="text-xs text-gray-500 -mt-1">Dashboard</span>
                    </div>
                </Link>
                <button onClick={() => setIsDrawerOpen(true)} className="p-2 text-gray-700 hover:bg-gray-100 rounded-md">
                    <Menu className="h-6 w-6" />
                </button>
            </div>

            <AnimatePresence>
                {(isDrawerOpen || window.innerWidth >= 1024) && (
                    <motion.div
                        className={`
                            fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 border-r border-gray-200 scrollbarHidden
                            overflow-y-auto lg:overflow-y-visible
                            lg:static lg:block lg:h-screen lg:sticky lg:top-0
                        `}
                        variants={sidebarVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <Link to="/" className="hidden lg:flex items-center space-x-3 group">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-orange-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="relative bg-gradient-to-r from-blue-700 to-orange-600 p-2 rounded-xl">
                                        <Activity className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-orange-600 bg-clip-text text-transparent">FitFlow</span>
                                    <span className="text-xs text-gray-500 -mt-1">Dashboard</span>
                                </div>
                            </Link>
                            <button onClick={() => setIsDrawerOpen(false)} className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* User Info */}
                        <div className="p-6 border-b border-gray-200">
                            <motion.div
                                className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 24 }}
                            >
                                {user?.photoURL ? (
                                    <motion.img
                                        src={user.photoURL}
                                        alt={user.displayName}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                    />
                                ) : (
                                    <motion.div
                                        className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-orange-400 text-white text-lg font-bold border-2 border-white shadow-sm uppercase"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                    >
                                        {user?.displayName?.charAt(0) || '?'}
                                    </motion.div>
                                )}
                                <div>
                                    <motion.div
                                        className="font-semibold text-gray-800"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        {user?.displayName}
                                    </motion.div>
                                    <motion.div
                                        className="text-sm text-gray-500 capitalize flex items-center space-x-1"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <span>{user?.role}</span>
                                        {user?.role === 'admin' && <Crown size={15} />}
                                        {user?.role === 'trainer' && <Trophy size={15} />}
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Navigation */}
                        <nav className="p-4 overflow-y-auto scrollbarHidden">
                            <motion.div
                                className="mb-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 24 }}
                            >
                                <Link
                                    to="/"
                                    className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                                    onClick={() => setIsDrawerOpen(false)}
                                >
                                    <Home className="h-5 w-5" />
                                    <span>Back to Home</span>
                                </Link>
                            </motion.div>

                            <motion.div
                                className="border-t border-gray-200 pt-4"
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    visible: {
                                        transition: { staggerChildren: 0.07, delayChildren: 0.5 }
                                    }
                                }}
                            >
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Dashboard Menu</h3>
                                <ul className="space-y-3">
                                    {menuItems.map((item) => {
                                        const isActive = location.pathname === item.path;
                                        return (
                                            <motion.li
                                                key={item.path}
                                                variants={itemVariants}
                                                whileHover={{ scale: 1.02, x: 5 }} // Slight hover effect
                                                whileTap={{ scale: 0.98 }} // Slight tap effect
                                            >
                                                <Link
                                                    to={item.path}
                                                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                                        ? 'bg-gradient-to-r from-blue-100 to-orange-100 text-blue-700 shadow-sm'
                                                        : 'text-gray-700 hover:bg-gray-100 hover:text-blue-700'
                                                        }`}
                                                    onClick={() => setIsDrawerOpen(false)}
                                                >
                                                    <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-500'} group-hover:scale-110 transition-transform`} />
                                                    <span className="font-medium">{item.label}</span>
                                                </Link>
                                            </motion.li>
                                        );
                                    })}
                                </ul>
                            </motion.div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overlay for mobile */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setIsDrawerOpen(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                )}
            </AnimatePresence>

            {/* Main content area */}
            <main className="flex-1 overflow-auto p-4 lg:p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;