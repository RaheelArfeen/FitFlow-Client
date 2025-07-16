import React, { useContext, useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, Users, Calendar, BarChart3, MessageSquare, Plus, User, BookOpen,
    Mail, UserCheck, DollarSign, Clock, Home, Crown, Trophy, Menu, X, CalendarPlus
} from 'lucide-react';
import { AuthContext } from '../Provider/AuthProvider';
import { Title } from 'react-head';

const DashboardLayout = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        if (isDrawerOpen) setIsDrawerOpen(false);
        const timer = setTimeout(() => window.scrollTo(0, 0), 300);
        return () => clearTimeout(timer);
    }, [location.pathname]);

    const getMenuItems = () => {
        const baseItems = [{ icon: BarChart3, label: 'Overview', path: '/dashboard' }];

        if (user?.role === 'admin') {
            return [
                ...baseItems,
                { icon: Mail, label: 'Newsletter Subscribers', path: '/dashboard/subscribers' },
                { icon: Users, label: 'All Trainers', path: '/dashboard/trainers' },
                { icon: UserCheck, label: 'Applied Trainers', path: '/dashboard/applied-trainers' },
                { icon: DollarSign, label: 'Balance', path: '/dashboard/balance' },
                { icon: BookOpen, label: 'Add New Class', path: '/dashboard/add-class' },
                { icon: MessageSquare, label: 'Add New Community', path: '/dashboard/add-community' },
            ];
        }

        if (user?.role === 'trainer') {
            return [
                ...baseItems,
                { icon: Clock, label: 'Manage Slots', path: '/dashboard/manage-slots' },
                { icon: CalendarPlus, label: 'Add New Slot', path: '/dashboard/add-slot' },
                { icon: Users, label: 'Add New Community', path: '/dashboard/add-community' },
            ];
        }

        return [
            ...baseItems,
            { icon: BookOpen, label: 'Activity Log', path: '/dashboard/activity-log' },
            { icon: MessageSquare, label: 'Profile', path: '/dashboard/profile' },
            { icon: Calendar, label: 'Booked Trainers', path: '/dashboard/booked-trainers' },
        ];
    };

    const menuItems = getMenuItems();

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

            <MobileSidebar user={user} menuItems={menuItems} isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen} />

            <DesktopSidebar user={user} menuItems={menuItems} />

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-4 lg:p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;

// Shared Sidebar Content Component
const SidebarContent = ({ user, menuItems, setIsDrawerOpen }) => {
    const location = useLocation();

    return (
        <>
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <Title>Dashboard | FitFlow</Title>
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
                {setIsDrawerOpen && (
                    <button onClick={() => setIsDrawerOpen(false)} className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100">
                        <X className="h-6 w-6" />
                    </button>
                )}
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
                        <div className="font-semibold text-gray-800">{user?.displayName}</div>
                        <div className="text-sm text-gray-500 capitalize flex items-center space-x-1">
                            <span>{user?.role}</span>
                            {user?.role === 'admin' && <Crown size={15} />}
                            {user?.role === 'trainer' && <Trophy size={15} />}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Navigation Links */}
            <nav className="p-4">
                <Link
                    to="/"
                    className="flex items-center space-x-3 px-4 py-3 mb-3 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                    onClick={() => setIsDrawerOpen && setIsDrawerOpen(false)}
                >
                    <Home className="h-5 w-5" />
                    <span>Back to Home</span>
                </Link>
                <div className="border-t border-gray-200 pt-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Dashboard Menu</h3>
                    <ul className="space-y-3">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        onClick={() => setIsDrawerOpen && setIsDrawerOpen(false)}
                                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                            ? 'bg-gradient-to-r from-blue-100 to-orange-100 text-blue-700 shadow-sm'
                                            : 'text-gray-700 hover:bg-gray-100 hover:text-blue-700'
                                            }`}
                                    >
                                        <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-500'} group-hover:scale-110 transition-transform`} />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </nav>
        </>
    );
};

// Desktop Sidebar Component
const DesktopSidebar = ({ user, menuItems }) => (
    <motion.div
        className="hidden lg:block lg:w-64 bg-white shadow-xl border-r overflow-y-auto border-gray-200 h-screen sticky top-0"
        initial={{ x: -64 }}
        animate={{ x: 0 }}
        exit={{ x: -64 }}
    >
        <SidebarContent user={user} menuItems={menuItems} />
    </motion.div>
);

// Mobile Sidebar Component
const MobileSidebar = ({ user, menuItems, isDrawerOpen, setIsDrawerOpen }) => (
    <AnimatePresence>
        {isDrawerOpen && (
            <>
                <motion.div
                    className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 border-r border-gray-200 overflow-y-auto lg:hidden"
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                >
                    <SidebarContent user={user} menuItems={menuItems} setIsDrawerOpen={setIsDrawerOpen} />
                </motion.div>
                <motion.div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsDrawerOpen(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                />
            </>
        )}
    </AnimatePresence>
);
