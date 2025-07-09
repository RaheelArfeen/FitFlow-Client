import React, { useContext, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import {
    Activity, Users, Calendar, BarChart3, MessageSquare, Plus, User, BookOpen, Mail,
    UserCheck, DollarSign, Clock, Home, Crown, Trophy, Menu, X
} from 'lucide-react';
import { AuthContext } from '../Provider/AuthProvider';

const DashboardLayout = () => {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const getMenuItems = () => {
        const baseItems = [
            { icon: BarChart3, label: 'Overview', path: '/dashboard' },
        ];

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

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row overflow-y-auto">
            {/* Header (Mobile) */}
            <div className="lg:hidden p-4 bg-white shadow-sm flex justify-between items-center">
                <Link to="/" className="flex items-center space-x-3 group" aria-label="FitFlow Home">
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
                </Link>
                <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <Menu className="h-6 w-6" />
                </button>
            </div>

            {/* Sidebar */}
            <div
                className={`
                    ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}
                    fixed lg:static top-0 left-0 h-screen w-64 bg-white shadow-xl border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out
                    lg:translate-x-0 lg:flex-shrink-0
                `}
            >
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <Link to="/" className="hidden lg:flex items-center space-x-3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-orange-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative bg-gradient-to-r from-blue-700 to-orange-600 p-2 rounded-xl">
                                    <Activity className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-orange-600 bg-clip-text text-transparent">
                                    FitFlow
                                </span>
                                <span className="text-xs text-gray-500 -mt-1">Dashboard</span>
                            </div>
                        </Link>
                        <button
                            onClick={() => setIsDrawerOpen(false)}
                            className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="p-6 border-b border-gray-200">
                        <div className="mt-2">
                            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg">
                                {user?.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt={user.displayName}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-400 to-orange-400 text-white text-lg font-bold border-2 border-white shadow-sm uppercase">
                                        {user?.displayName?.charAt(0) || '?'}
                                    </div>
                                )}
                                <div>
                                    <div className="font-semibold text-gray-800">{user?.displayName}</div>
                                    <div className="text-sm text-gray-500 capitalize flex items-center space-x-1">
                                        <span>{user?.role}</span>
                                        {user?.role === 'admin' && <span><Crown size={15} /></span>}
                                        {user?.role === 'trainer' && <span><Trophy size={15} /></span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 p-4 overflow-y-auto">
                        <div className="mb-4">
                            <Link
                                to="/"
                                className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                                onClick={() => setIsDrawerOpen(false)}
                            >
                                <Home className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                                <span>Back to Home</span>
                            </Link>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                Dashboard Menu
                            </h3>
                            <ul className="space-y-1">
                                {menuItems.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <li key={item.path}>
                                            <Link
                                                to={item.path}
                                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                                        ? 'bg-gradient-to-r from-blue-100 to-orange-100 text-blue-700 shadow-sm'
                                                        : 'text-gray-700 hover:bg-gray-100 hover:text-blue-700'
                                                    }`}
                                                onClick={() => setIsDrawerOpen(false)}
                                            >
                                                <item.icon
                                                    className={`h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-500'
                                                        } group-hover:scale-110 transition-transform duration-200`}
                                                />
                                                <span className="font-medium text-sm">{item.label}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </nav>
                </div>
            </div>

            {/* Overlay */}
            {isDrawerOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsDrawerOpen(false)}
                ></div>
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-4 lg:p-8">
                <Outlet />
            </div>
        </div>
    );
};

export default DashboardLayout;
