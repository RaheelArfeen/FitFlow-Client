import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion'; // Import motion
import {
    Users,
    Calendar,
    DollarSign,
    TrendingUp,
    Star,
    MessageSquare,
    Plus,
} from 'lucide-react';
import { AuthContext } from '../../Provider/AuthProvider';
import { Link } from 'react-router';
import { formatDistanceToNowStrict } from 'date-fns';

const DashboardOverview = () => {
    const { user } = useContext(AuthContext);
    const [trainerCount, setTrainerCount] = useState(0);
    const [memberCount, setMemberCount] = useState(0);
    const [updates, setUpdates] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // This URL needs to point to your actual backend endpoint for users
                const res = await fetch('http://localhost:3000/users');
                const users = await res.json();
                const trainers = users.filter((user) => user.role === 'trainer');
                const members = users.filter((user) => user.role === 'member');
                setTrainerCount(trainers.length);
                setMemberCount(members.length);
            } catch (error) {
                console.error('Failed to fetch users:', error);
                // Optionally set default values or show an error message
            }
        };

        const fetchUpdates = async () => {
            try {
                // This URL needs to point to your actual backend endpoint for community updates
                const res = await fetch('http://localhost:3000/community');
                const data = await res.json();
                const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setUpdates(sorted.slice(0, 4));
            } catch (error) {
                console.error('Failed to fetch updates:', error);
                // Optionally set default values or show an error message
            }
        };

        fetchUsers();
        fetchUpdates();
    }, []);

    const getStatsForRole = () => {
        if (user?.role === 'admin') {
            return [
                { icon: Users, label: 'Total Trainers', value: trainerCount },
                { icon: Users, label: 'Total Members', value: memberCount },
                { icon: DollarSign, label: 'Total Revenue', value: '$0' }, // Placeholder
                { icon: MessageSquare, label: 'Community Posts', value: '0' }, // Placeholder
            ];
        }
        if (user?.role === 'trainer') {
            return [
                { icon: Calendar, label: 'Total Sessions', value: '89' }, // Placeholder
                { icon: Users, label: 'Active Clients', value: '23' }, // Placeholder
                { icon: Star, label: 'Average Rating', value: '4.8' }, // Placeholder
                { icon: DollarSign, label: 'Earnings', value: '$2,340' }, // Placeholder
            ];
        }
        return [
            { icon: Calendar, label: 'Sessions Booked', value: '12' }, // Placeholder
            { icon: TrendingUp, label: 'Workout Streak', value: '7 days' }, // Placeholder
            { icon: Star, label: 'Favorite Trainer', value: 'Sarah J.' }, // Placeholder
            { icon: Users, label: 'Community Posts', value: '5' }, // Placeholder
        ];
    };

    const categoryColors = {
        'Wellness': 'purple',
        'Success Stories': 'green',
        'Nutrition': 'yellow',
        'Training Tips': 'blue',
        'Mental Health': 'rose',
        'Equipment': 'gray',
        'Motivation': 'orange',
        'General Discussion': 'indigo',
    };

    // Helper function to dynamically get Tailwind class names.
    // NOTE: For dynamic classes like this, ensure you have these classes
    // explicitly defined in your Tailwind CSS configuration's `safelist`
    // or use full class names (e.g., `text-purple-500` instead of `purple-500`).
    // Example safelist entry: `safelist: [{ pattern: /(bg|text|border)-(purple|green|yellow|blue|rose|gray|orange|indigo)-(100|500|700)/ }]`
    const getCategoryClass = (base, category, shade) => {
        const color = categoryColors[category] || 'gray';
        return `${base}-${color}-${shade}`;
    };

    const shouldDisplay = (item) => {
        // This logic seems specific to your backend data structure and user roles
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
                staggerChildren: 0.1, // Stagger children animations
                delayChildren: 0.2 // Delay before children start animating
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 10 } }
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 10 } }
    };

    const ctaVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 100, damping: 10, delay: 0.6 } }
    };

    return (
        <motion.div
            className="p-4 lg:p-8" // Added responsive padding
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div
                className="mb-8"
                variants={itemVariants}
            >
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Welcome back, {user?.name}!
                </h1>
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
                variants={containerVariants} // Use container variants for stagger effect here
            >
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        className="bg-white rounded-xl shadow-lg p-6"
                        variants={cardVariants} // Apply card specific variants
                        whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }} // Lift on hover
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Actions */}
                <motion.div
                    className="bg-white rounded-xl shadow-lg p-6"
                    variants={containerVariants} // For staggering children links
                >
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {user?.role === 'admin' && (
                            <>
                                <motion.div variants={itemVariants}>
                                    <Link
                                        to="/dashboard/add-class"
                                        className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 group"
                                    >
                                        <div className="bg-white/20 p-4 rounded-lg group-hover:scale-110 transition-transform duration-200">
                                            <Plus className="h-10 w-10" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg">Add Class</div>
                                            <div className="text-sm text-blue-100">Create new fitness class</div>
                                        </div>
                                    </Link>
                                </motion.div>
                                <motion.div variants={itemVariants}>
                                    <Link
                                        to="/dashboard/applied-trainers"
                                        className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 group"
                                    >
                                        <div className="bg-white/20 p-4 rounded-lg group-hover:scale-110 transition-transform duration-200">
                                            <Users className="h-10 w-10" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg">Review Applications</div>
                                            <div className="text-sm text-green-100">Approve new trainers</div>
                                        </div>
                                    </Link>
                                </motion.div>
                                <motion.div variants={itemVariants}>
                                    <Link
                                        to="/dashboard/balance"
                                        className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 group"
                                    >
                                        <div className="bg-white/20 p-4 rounded-lg group-hover:scale-110 transition-transform duration-200">
                                            <DollarSign className="h-10 w-10" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg">View Finances</div>
                                            <div className="text-sm text-purple-100">Check revenue & stats</div>
                                        </div>
                                    </Link>
                                </motion.div>
                                <motion.div variants={itemVariants}>
                                    <Link
                                        to="/dashboard/subscribers"
                                        className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 group"
                                    >
                                        <div className="bg-white/20 p-4 rounded-lg group-hover:scale-110 transition-transform duration-200">
                                            <MessageSquare className="h-10 w-10" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-lg">Newsletter</div>
                                            <div className="text-sm text-orange-100">Manage subscribers</div>
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
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-semibold">Add Slot</div>
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
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-semibold">Manage Slots</div>
                                            <div className="text-xs text-green-100">View bookings</div>
                                        </div>
                                    </Link>
                                </motion.div>
                                <motion.div variants={itemVariants}>
                                    <Link
                                        to="/dashboard/add-forum"
                                        className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 group"
                                    >
                                        <div className="bg-white/20 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
                                            <MessageSquare className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-semibold">Create Post</div>
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
                                            <Star className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-semibold">View Classes</div>
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
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-semibold">Browse Classes</div>
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
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-semibold">Find Trainers</div>
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
                                            <MessageSquare className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-semibold">Community</div>
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
                                            <Star className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-semibold">My Profile</div>
                                            <div className="text-xs text-orange-100">Update settings</div>
                                        </div>
                                    </Link>
                                </motion.div>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Recent Updates */}
                <motion.div
                    className="bg-white rounded-xl shadow-lg p-6 relative"
                    variants={containerVariants} // For staggering children updates
                >
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Updates & News</h2>
                    <div className="space-y-4">
                        {updates.map((item) =>
                            shouldDisplay(item) ? (
                                <motion.div
                                    key={item._id}
                                    // Make sure your Tailwind CSS is configured to include these dynamic classes.
                                    // Add to `tailwind.config.js` safelist:
                                    // e.g., safelist: [
                                    //   { pattern: /border-(purple|green|yellow|blue|rose|gray|orange|indigo)-500/ },
                                    //   { pattern: /(bg|text)-(purple|green|yellow|blue|rose|gray|orange|indigo)-(100|700)/ },
                                    // ]
                                    className={`border-l-4 ${getCategoryClass('border', item.category, 500)} pl-4 py-2`}
                                    variants={itemVariants} // Apply item specific variants
                                    whileHover={{ x: 5 }} // Slight move right on hover
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
                            ) : null
                        )}
                    </div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
                        <Link
                            to="/community"
                            className="text-blue-700 hover:text-blue-800 font-medium text-sm transition-colors duration-200"
                        >
                            View All Updates →
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Be a Trainer CTA */}
            {user?.role === 'member' && (
                <motion.div
                    className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl p-6 text-white mb-8 mt-8"
                    variants={ctaVariants} // Apply CTA specific variants
                >
                    <div className="flex items-center justify-between">
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
            )}
        </motion.div>
    );
};

export default DashboardOverview;