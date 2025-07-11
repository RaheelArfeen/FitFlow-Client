import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Calendar,
    DollarSign,
    TrendingUp,
    Star,
    MessageSquare,
    Plus,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from '../../Provider/AuthProvider';
import { Link } from 'react-router';
import { formatDistanceToNowStrict } from 'date-fns';
import useAxiosSecure from '../../Provider/UseAxiosSecure';
import Loader from '../Loader';

const DashboardOverview = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();

    // Fetch users
    const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await axiosSecure.get('/users');
            return res.data;
        },
    });

    // Fetch community posts
    const { data: community = [], isLoading: communityLoading, error: communityError } = useQuery({
        queryKey: ['community'],
        queryFn: async () => {
            const res = await axiosSecure.get('/community');
            return res.data;
        },
    });

    const trainers = users.filter((u) => u.role === 'trainer');
    const members = users.filter((u) => u.role === 'member');
    const recentUpdates = [...community]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4);

    // Combine loading and error states from useQuery hooks
    const isLoading = usersLoading || communityLoading;
    const error = usersError || communityError; // Error will be an object if present

    const getStatsForRole = () => {
        if (user?.role === 'admin') {
            return [
                { icon: Users, label: 'Total Trainers', value: trainers.length },
                { icon: Users, label: 'Total Members', value: members.length },
                { icon: DollarSign, label: 'Total Revenue', value: '$0' },
                { icon: MessageSquare, label: 'Community Posts', value: community.length },
            ];
        }
        if (user?.role === 'trainer') {
            return [
                { icon: Calendar, label: 'Total Sessions', value: '89' },
                { icon: Users, label: 'Active Clients', value: '23' },
                { icon: Star, label: 'Average Rating', value: '4.8' },
                { icon: DollarSign, label: 'Earnings', value: '$2,340' },
            ];
        }
        return [
            { icon: Calendar, label: 'Sessions Booked', value: '12' },
            { icon: TrendingUp, label: 'Workout Streak', value: '7 days' },
            { icon: Star, label: 'Favorite Trainer', value: 'Sarah J.' },
            { icon: Users, label: 'Community Posts', value: community.length },
        ];
    };

    const categoryColors = {
        Wellness: 'purple',
        'Success Stories': 'green',
        Nutrition: 'yellow',
        'Training Tips': 'blue',
        'Mental Health': 'rose',
        Equipment: 'gray',
        Motivation: 'orange',
        'General Discussion': 'indigo',
    };

    const getCategoryClass = (base, category, shade) => {
        const color = categoryColors[category] || 'gray';
        return `${base}-${color}-${shade}`;
    };

    const shouldDisplay = (item) => {
        // You might want to refine this logic.
        // Currently, it checks if the author role matches the user's role OR
        // if the category is one of the specified ones.
        return (
            item.authorRole === user?.role ||
            ['New Feature', 'Challenge', 'Spotlight', 'Success Stories'].includes(item.category)
        );
    };

    const stats = getStatsForRole();

    // Framer Motion Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 10 } },
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 10 } },
    };

    const ctaVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100, damping: 10, delay: 0.6 } },
    };

    if (isLoading) { // Use the combined isLoading
        return (
            <Loader />
        );
    }

    if (error) { // Handle error gracefully
        return (
            <div className="p-8 text-center text-red-500">
                Error: {error.message || 'An unexpected error occurred.'}
            </div>
        );
    }

    return (
        <motion.div
            className="p-4 lg:p-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div className="mb-8" variants={itemVariants}>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {user?.name}!</h1>
                <p className="text-gray-600">
                    Here's what's happening with your{' '}
                    {user?.role === 'admin'
                        ? 'platform'
                        : user?.role === 'trainer'
                            ? 'training business'
                            : 'fitness journey'}{' '}
                    today.
                </p>
            </motion.div>

            {/* Stats */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                variants={containerVariants}
            >
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        className="bg-white rounded-xl shadow-lg p-6"
                        variants={cardVariants}
                        whileHover={{
                            scale: 1.03,
                            boxShadow:
                                '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <stat.icon className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
                            <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Quick Actions & Updates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div className="bg-white rounded-xl shadow-lg p-6" variants={containerVariants}>
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                        {user?.role === 'admin' && (
                            <>
                                <motion.div variants={itemVariants}>
                                    <Link
                                        to="/dashboard/add-class"
                                        className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 group"
                                    >
                                        <div className="bg-white/20 p-4 rounded-lg group-hover:scale-110 transition-transform duration-200">
                                            <Plus className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="font-medium">Add Class</div>
                                            <div className="text-xs text-blue-100">Create new fitness class</div>
                                        </div>
                                    </Link>
                                </motion.div>
                                <motion.div variants={itemVariants}>
                                    <Link
                                        to="/dashboard/applied-trainers"
                                        className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 group"
                                    >
                                        <div className="bg-white/20 p-4 rounded-lg group-hover:scale-110 transition-transform duration-200">
                                            <Users className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="font-medium">Review Applications</div>
                                            <div className="text-xs text-green-100">Approve new trainers</div>
                                        </div>
                                    </Link>
                                </motion.div>
                                <motion.div variants={itemVariants}>
                                    <Link
                                        to="/dashboard/balance"
                                        className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 group"
                                    >
                                        <div className="bg-white/20 p-4 rounded-lg group-hover:scale-110 transition-transform duration-200">
                                            <DollarSign className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="font-medium">View Finances</div>
                                            <div className="text-xs text-purple-100">Check revenue & stats</div>
                                        </div>
                                    </Link>
                                </motion.div>
                                <motion.div variants={itemVariants}>
                                    <Link
                                        to="/dashboard/subscribers"
                                        className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 group"
                                    >
                                        <div className="bg-white/20 p-4 rounded-lg group-hover:scale-110 transition-transform duration-200">
                                            <MessageSquare className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="font-medium">Newsletter</div>
                                            <div className="text-xs text-orange-100">Manage subscribers</div>
                                        </div>
                                    </Link>
                                </motion.div>
                            </>
                        )}

                        {user?.role === 'trainer' && (
                            <>
                                <motion.div variants={itemVariants}>
                                    <Link
                                        to="/dashboard/add-slot"
                                        className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 group"
                                    >
                                        <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                                            <Calendar className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="font-medium">Add Slot</div>
                                            <div className="text-xs text-blue-100">Create training slot</div>
                                        </div>
                                    </Link>
                                </motion.div>
                                <motion.div variants={itemVariants}>
                                    <Link
                                        to="/dashboard/manage-slots"
                                        className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 group"
                                    >
                                        <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                                            <Users className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="font-medium">Manage Slots</div>
                                            <div className="text-xs text-green-100">View bookings</div>
                                        </div>
                                    </Link>
                                </motion.div>
                                <motion.div variants={itemVariants}>
                                    <Link
                                        to="/dashboard/add-community"
                                        className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 group"
                                    >
                                        <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                                            <MessageSquare className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="font-medium">Create Post</div>
                                            <div className="text-xs text-purple-100">Share knowledge</div>
                                        </div>
                                    </Link>
                                </motion.div>
                                <motion.div variants={itemVariants}>
                                    <Link
                                        to="/classes"
                                        className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 group"
                                    >
                                        <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                                            <Star className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="font-medium">View Classes</div>
                                            <div className="text-xs text-orange-100">Browse all classes</div>
                                        </div>
                                    </Link>
                                </motion.div>
                            </>
                        )}

                        {user?.role === 'member' && (
                            <>
                                <motion.div variants={itemVariants}>
                                    <Link
                                        to="/classes"
                                        className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 group"
                                    >
                                        <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                                            <Calendar className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="font-medium">Browse Classes</div>
                                            <div className="text-xs text-blue-100">Find new workouts</div>
                                        </div>
                                    </Link>
                                </motion.div>
                                <motion.div variants={itemVariants}>
                                    <Link
                                        to="/trainers"
                                        className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 group"
                                    >
                                        <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                                            <Users className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="font-medium">Find Trainers</div>
                                            <div className="text-xs text-green-100">Book personal sessions</div>
                                        </div>
                                    </Link>
                                </motion.div>
                                <motion.div variants={itemVariants}>
                                    <Link
                                        to="/community"
                                        className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 group"
                                    >
                                        <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                                            <MessageSquare className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="font-medium">Community</div>
                                            <div className="text-xs text-purple-100">Connect & share</div>
                                        </div>
                                    </Link>
                                </motion.div>
                                <motion.div variants={itemVariants}>
                                    <Link
                                        to="/dashboard/profile"
                                        className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 group"
                                    >
                                        <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                                            <Star className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="font-medium">My Profile</div>
                                            <div className="text-xs text-orange-100">Update settings</div>
                                        </div>
                                    </Link>
                                </motion.div>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Recent Updates */}
                <motion.div className="bg-white rounded-xl shadow-lg p-6 relative" variants={containerVariants}>
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Updates & News</h2>
                    <div className="space-y-4">
                        {recentUpdates.map( // Changed `updates` to `recentUpdates`
                            (item) =>
                                shouldDisplay(item) && (
                                    <motion.div
                                        key={item._id}
                                        className={`border-l-4 ${getCategoryClass('border', item.category, 500)} pl-4 py-2`}
                                        variants={itemVariants}
                                        whileHover={{ x: 5 }}
                                        transition={{ duration: 0.1 }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-gray-800">{item.title}</h3>
                                            <span className="text-xs text-gray-500">
                                                {formatDistanceToNowStrict(new Date(item.createdAt))} ago
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-3">{item.content}</p>
                                        <div className="mt-2 flex items-center space-x-2">
                                            <span
                                                className={`${getCategoryClass('bg', item.category, 100)} ${getCategoryClass('text', item.category, 700)} px-2 py-1 rounded-full text-xs`}
                                            >
                                                {item.category}
                                            </span>
                                        </div>
                                    </motion.div>
                                )
                        )}
                    </div>
                </motion.div>
            </div >
            {
                user?.role === 'member' && (
                    <motion.div
                        className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl p-6 text-white mb-8 mt-8"
                        variants={ctaVariants}
                    >
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold mb-2">Ready to Share Your Expertise?</h3>
                                <p className="text-orange-100">
                                    Join our team of expert trainers and help others achieve their fitness goals while earning extra income.
                                </p>
                            </div>
                            <Link
                                to="/be-trainer"
                                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors duration-200 whitespace-nowrap"
                            >
                                Become a Trainer
                            </Link>
                        </div>
                    </motion.div>
                )
            }
        </motion.div >
    );
};

export default DashboardOverview;