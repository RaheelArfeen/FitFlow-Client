import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Calendar,
    DollarSign,
    Star,
    MessageSquare,
    Plus,
    Briefcase,
    CheckSquare,
    UserCheck,
    FileText,
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

    const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await axiosSecure.get('/users');
            return res.data;
        },
        staleTime: 5 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
        enabled: !!user,
    });

    const { data: community = [], isLoading: communityLoading, error: communityError } = useQuery({
        queryKey: ['community'],
        queryFn: async () => {
            const res = await axiosSecure.get('/community');
            return res.data;
        },
        staleTime: 5 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
        enabled: !!user,
    });

    const { data: bookingsData = { bookings: [], totalRevenue: 0 }, isLoading: bookingsLoading, error: bookingsError } = useQuery({
        queryKey: ['bookings'],
        queryFn: async () => {
            const res = await axiosSecure.get('/bookings');
            return res.data;
        },
        staleTime: 5 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
        enabled: !!user,
    });

    const { data: allApplicationsData = [], isLoading: applicationsLoading, error: applicationsError } = useQuery({
        queryKey: ['allTrainerApplications'],
        queryFn: async () => {
            const res = await axiosSecure.get('/trainers');
            return res.data;
        },
        staleTime: 5 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
        enabled: !!user,
    });

    const { data: trainerData, isLoading: trainerProfileLoading, error: trainerProfileError } = useQuery({
        queryKey: ['trainerProfile', user?.email],
        queryFn: async () => {
            if (user?.role === 'trainer' && user?.email) {
                const res = await axiosSecure.get(`/trainers?email=${user.email}`);
                return res.data[0] || null;
            }
            return null;
        },
        staleTime: 5 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
        enabled: user?.role === 'trainer' && !!user?.email,
    });


    const trainers = users.filter((u) => u.role === 'trainer');
    const members = users.filter((u) => u.role === 'member');
    const recentUpdates = [...community]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);

    const trainerEarnings = user?.role === 'trainer'
        ? bookingsData.bookings
            .filter(booking => booking.trainerEmail === user.email)
            .reduce((sum, booking) => sum + (booking.price || 0), 0)
        : 0;

    const memberTotalSpent = user?.role === 'member'
        ? bookingsData.bookings
            .filter(booking => booking.userEmail === user.email)
            .reduce((sum, booking) => sum + (booking.price || 0), 0)
        : 0;

    const memberApplicationsSubmitted = allApplicationsData.filter(app =>
        (app.status === 'pending' || app.status === 'rejected') &&
        app.email === user?.email
    ).length;


    const trainerRating = trainerData?.rating ? trainerData.rating.toFixed(1) : '0';

    const totalSlots = trainerData?.slots ? trainerData.slots.length : 0;

    const totalSessions = trainerData?.sessions || 0;

    const isLoading = usersLoading || communityLoading || bookingsLoading || applicationsLoading || trainerProfileLoading;
    const error = usersError || communityError || bookingsError || applicationsError || trainerProfileError;


    const getStatsForRole = () => {
        if (user?.role === 'admin') {
            return [
                { icon: Users, label: 'Total Trainers', value: trainers.length, color: 'blue' },
                { icon: Users, label: 'Total Members', value: members.length, color: 'green' },
                { icon: DollarSign, label: 'Total Revenue', value: `$${(bookingsData.totalRevenue || 0).toFixed(2)}`, color: 'red' }, // Changed color to 'red'
                { icon: MessageSquare, label: 'Community Posts', value: community.length, color: 'orange' },
            ];
        }
        if (user?.role === 'trainer') {
            return [
                { icon: Calendar, label: 'Total Sessions', value: totalSessions, color: 'blue' },
                { icon: CheckSquare, label: 'Total Slots', value: totalSlots, color: 'green' },
                { icon: Star, label: 'Average Rating', value: trainerRating, color: 'yellow' },
                { icon: DollarSign, label: 'Total Earnings', value: `$${trainerEarnings.toFixed(2)}`, color: 'indigo' },
            ];
        }
        // Member role
        return [
            { icon: Calendar, label: 'Sessions Booked', value: bookingsData.bookings.filter(booking => booking.userEmail === user.email).length, color: 'blue' },
            { icon: DollarSign, label: 'Total Spent', value: `$${memberTotalSpent.toFixed(2)}`, color: 'green' },
            { icon: FileText, label: 'Applications Submitted', value: memberApplicationsSubmitted, color: 'indigo' },
            { icon: MessageSquare, label: 'Community Posts', value: community.length, color: 'orange' },
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
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 10 } },
        hover: { scale: 1.03, boxShadow: "0 15px 25px rgba(0, 0, 0, 0.15)" },
    };

    const actionItemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100, damping: 10 } },
    };

    const updateItemVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } },
    };

    const ctaVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 10, delay: 0.5 } },
    };

    if (isLoading) {
        return <Loader />;
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500 text-lg font-medium dark:text-red-400">
                Error loading dashboard data: {error.message || 'An unexpected error occurred.'}
            </div>
        );
    }

    return (
        <motion.div
            className="md:px-8 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Welcome Header */}
            <motion.div className="mb-12 text-center md:text-left" variants={itemVariants}>
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">Welcome back, {user?.displayName || user?.name || 'User'}!</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Here's what's happening with your{' '}
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {user?.role === 'admin'
                            ? 'platform'
                            : user?.role === 'trainer'
                                ? 'training business'
                                : 'fitness journey'}
                    </span>{' '}
                    today.
                </p>
            </motion.div>

            {/* Stats */}
            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-8 mb-12"
                variants={containerVariants}
            >
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-7 border border-gray-100 dark:border-gray-700 flex flex-col justify-between"
                        variants={cardVariants}
                        whileHover="hover"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{stat.value}</h3>
                                <p className="text-lg text-gray-600 dark:text-gray-400">{stat.label}</p>
                            </div>
                            <div className={`p-4 bg-${stat.color}-50 dark:bg-${stat.color}-900 rounded-full`}>
                                <stat.icon className={`h-10 w-10 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Insights for {stat.label.toLowerCase()}.</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Quick Actions & Recent Updates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* Quick Actions */}
                <motion.div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700" variants={cardVariants}>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
                        {user?.role === 'admin' && (
                            <>
                                <motion.div variants={actionItemVariants}>
                                    <Link
                                        to="/dashboard/add-class"
                                        className="flex items-center space-x-4 p-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-md hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 group"
                                    >
                                        <div className="bg-white/20 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                            <Plus className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg">Add Class</div>
                                            <div className="text-sm text-blue-100">Create new fitness class schedule</div>
                                        </div>
                                    </Link>
                                </motion.div>
                                <motion.div variants={actionItemVariants}>
                                    <Link
                                        to="/dashboard/applied-trainers"
                                        className="flex items-center space-x-4 p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-md hover:from-green-700 hover:to-emerald-700 transition-all duration-300 group"
                                    >
                                        <div className="bg-white/20 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                            <Users className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg">Review Applications</div>
                                            <div className="text-sm text-green-100">Approve or reject new trainers</div>
                                        </div>
                                    </Link>
                                </motion.div>
                                <motion.div variants={actionItemVariants}>
                                    <Link
                                        to="/dashboard/balance"
                                        className="flex items-center space-x-4 p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 group"
                                    >
                                        <div className="bg-white/20 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                            <DollarSign className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg">View Finances</div>
                                            <div className="text-sm text-purple-100">Check platform revenue & stats</div>
                                        </div>
                                    </Link>
                                </motion.div>
                                <motion.div variants={actionItemVariants}>
                                    <Link
                                        to="/dashboard/subscribers"
                                        className="flex items-center space-x-4 p-6 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl shadow-md hover:from-orange-700 hover:to-red-700 transition-all duration-300 group"
                                    >
                                        <div className="bg-white/20 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                            <MessageSquare className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg">Newsletter</div>
                                            <div className="text-sm text-orange-100">Manage newsletter subscribers</div>
                                        </div>
                                    </Link>
                                </motion.div>
                            </>
                        )}

                        {user?.role === 'trainer' && (
                            <>
                                <motion.div variants={actionItemVariants}>
                                    <Link
                                        to="/dashboard/add-slot"
                                        className="flex items-center space-x-4 p-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-md hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 group"
                                    >
                                        <div className="bg-white/20 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                            <Calendar className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg">Add Slot</div>
                                            <div className="text-sm text-blue-100">Create new training availability</div>
                                        </div>
                                    </Link>
                                </motion.div>
                                <motion.div variants={actionItemVariants}>
                                    <Link
                                        to="/dashboard/manage-slots"
                                        className="flex items-center space-x-4 p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-md hover:from-green-700 hover:to-emerald-700 transition-all duration-300 group"
                                    >
                                        <div className="bg-white/20 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                            <Users className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg">Manage Slots</div>
                                            <div className="text-sm text-green-100">View and manage your bookings</div>
                                        </div>
                                    </Link>
                                </motion.div>
                                <motion.div variants={actionItemVariants}>
                                    <Link
                                        to="/dashboard/add-community"
                                        className="flex items-center space-x-4 p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 group"
                                    >
                                        <div className="bg-white/20 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                            <MessageSquare className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg">Create Post</div>
                                            <div className="text-sm text-purple-100">Share knowledge with the community</div>
                                        </div>
                                    </Link>
                                </motion.div>
                                <motion.div variants={actionItemVariants}>
                                    <Link
                                        to="/classes"
                                        className="flex items-center space-x-4 p-6 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl shadow-md hover:from-orange-700 hover:to-red-700 transition-all duration-300 group"
                                    >
                                        <div className="bg-white/20 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                            <Star className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg">View Classes</div>
                                            <div className="text-sm text-orange-100">Browse available fitness classes</div>
                                        </div>
                                    </Link>
                                </motion.div>
                            </>
                        )}

                        {user?.role === 'member' && (
                            <>
                                <motion.div variants={actionItemVariants}>
                                    <Link
                                        to="/classes"
                                        className="flex items-center space-x-4 p-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-md hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 group"
                                    >
                                        <div className="bg-white/20 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                            <Calendar className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg">Browse Classes</div>
                                            <div className="text-sm text-blue-100">Find new workouts and schedules</div>
                                        </div>
                                    </Link>
                                </motion.div>
                                <motion.div variants={actionItemVariants}>
                                    <Link
                                        to="/trainers"
                                        className="flex items-center space-x-4 p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-md hover:from-green-700 hover:to-emerald-700 transition-all duration-300 group"
                                    >
                                        <div className="bg-white/20 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                            <Users className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg">Find Trainers</div>
                                            <div className="text-sm text-green-100">Book personal sessions with experts</div>
                                        </div>
                                    </Link>
                                </motion.div>
                                <motion.div variants={actionItemVariants}>
                                    <Link
                                        to="/community"
                                        className="flex items-center space-x-4 p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 group"
                                    >
                                        <div className="bg-white/20 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                            <MessageSquare className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg">Community</div>
                                            <div className="text-sm text-purple-100">Connect & share with other members</div>
                                        </div>
                                    </Link>
                                </motion.div>
                                <motion.div variants={actionItemVariants}>
                                    <Link
                                        to="/dashboard/profile"
                                        className="flex items-center space-x-4 p-6 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl shadow-md hover:from-orange-700 hover:to-red-700 transition-all duration-300 group"
                                    >
                                        <div className="bg-white/20 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                            <Star className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg">My Profile</div>
                                            <div className="text-sm text-orange-100">Update your account settings</div>
                                        </div>
                                    </Link>
                                </motion.div>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Recent Updates */}
                <motion.div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700" variants={cardVariants}>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Recent Updates & News</h2>
                    <div className="space-y-6">
                        {recentUpdates.length > 0 ? (
                            recentUpdates.map((item) => (
                                <motion.div
                                    key={item._id}
                                    className="p-6 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 border border-gray-100 dark:border-gray-700"
                                    variants={updateItemVariants}
                                    whileHover={{ y: -5, boxShadow: '0 8px 12px rgba(0, 0, 0, 0.1)' }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                >
                                    <div className="mb-3">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{item.title}</h3>
                                        <span className="text-sm text-gray-500 dark:text-gray-400 block mt-1">
                                            {formatDistanceToNowStrict(new Date(item.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-base text-gray-700 dark:text-gray-300 line-clamp-3 mb-3">{item.content}</p>
                                    <div className="flex items-center space-x-2">
                                        <span
                                            className={`${getCategoryClass('bg', item.category, 100)} ${getCategoryClass('text', item.category, 700)} dark:bg-${categoryColors[item.category]}-900 dark:text-${categoryColors[item.category]}-400 px-3 py-1.5 rounded-full text-xs font-medium`}
                                        >
                                            {item.category}
                                        </span>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                className="text-center p-12 text-gray-500 dark:text-gray-400 text-lg flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-xl"
                                variants={itemVariants}
                            >
                                <MessageSquare className="h-12 w-12 mb-4 text-gray-400 dark:text-gray-500" />
                                <p>No recent community posts yet.</p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Become a Trainer CTA (Member Role Only) */}
            {user?.role === 'member' && (
                <motion.div
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white mt-12 shadow-xl"
                    variants={ctaVariants}
                >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div>
                            <h3 className="text-3xl font-bold mb-3">Ready to Share Your Expertise?</h3>
                            <p className="text-blue-100 text-lg">
                                Join our team of expert trainers and help others achieve their fitness goals while earning extra income.
                            </p>
                        </div>
                        <Link
                            to="/be-trainer"
                            className="bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors duration-300 whitespace-nowrap flex items-center gap-2 shadow-lg"
                        >
                            <Briefcase className="h-5 w-5" /> Become a Trainer
                        </Link>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default DashboardOverview;