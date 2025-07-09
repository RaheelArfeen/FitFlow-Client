import React, { useContext, useEffect, useState } from 'react';
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
                const res = await fetch('http://localhost:3000/users');
                const users = await res.json();
                const trainers = users.filter((user) => user.role === 'trainer');
                const members = users.filter((user) => user.role === 'member');
                setTrainerCount(trainers.length);
                setMemberCount(members.length);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };

        const fetchUpdates = async () => {
            try {
                const res = await fetch('http://localhost:3000/community');
                const data = await res.json();
                const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setUpdates(sorted.slice(0, 4));
            } catch (error) {
                console.error('Failed to fetch updates:', error);
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
                { icon: DollarSign, label: 'Total Revenue', value: '$0' },
                { icon: MessageSquare, label: 'Community Posts', value: '0' },
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
            { icon: Users, label: 'Community Posts', value: '5' },
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

    const shouldDisplay = (item) => {
        return (
            item.authorRole === user?.role ||
            ['New Feature', 'Challenge', 'Spotlight', 'Success Stories'].includes(item.category)
        );
    };

    const stats = getStatsForRole();

    return (
        <div>
            <div className="mb-8">
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
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <stat.icon className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
                            <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions & Updates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {user?.role === 'admin' && (
                            <>
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
                            </>
                        )}

                        {user?.role === 'trainer' && (
                            <>
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
                            </>
                        )}

                        {user?.role === 'member' && (
                            <>
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
                            </>
                        )}
                    </div>
                </div>

                {/* Recent Updates */}
                <div className="bg-white rounded-xl shadow-lg p-6 relative">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Updates & News</h2>
                    <div className="space-y-4">
                        {updates.map((item) =>
                            shouldDisplay(item) ? (
                                <div
                                    key={item._id}
                                    className={`border-l-4 border-${categoryColors[item.category] || 'gray'}-500 pl-4 py-2`}
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
                                            className={`bg-${categoryColors[item.category] || 'gray'}-100 text-${categoryColors[item.category] || 'gray'}-700 px-2 py-1 rounded-full text-xs`}
                                        >
                                            {item.category}
                                        </span>
                                    </div>
                                </div>
                            ) : null
                        )}
                    </div>
                    <div className="absolute bottom-4 left-1/2 -translate-1/2 text-center">
                        <Link
                            to="/community"
                            className="text-blue-700 hover:text-blue-800 font-medium text-sm transition-colors duration-200"
                        >
                            View All Updates →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Be a Trainer CTA */}
            {user?.role === 'member' && (
                <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl p-6 text-white mb-8 mt-8">
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
                </div>
            )}
        </div>
    );
};

export default DashboardOverview;
