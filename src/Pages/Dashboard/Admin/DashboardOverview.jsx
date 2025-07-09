import React, { useContext, useEffect, useState } from 'react';
import { Users, Calendar, DollarSign, TrendingUp, Star, MessageSquare } from 'lucide-react';
import { AuthContext } from '../../../Provider/AuthProvider';
import { Link } from 'react-router';

const DashboardOverview = () => {
    const { user } = useContext(AuthContext);
    const [trainerCount, setTrainerCount] = useState(0);
    const [memberCount, setMemberCount] = useState(0);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('http://localhost:3000/users');
                const users = await res.json();

                // Assuming each user has a `role` field: 'trainer' or 'member'
                const trainers = users.filter(user => user.role === 'trainer');
                const members = users.filter(user => user.role === 'member');

                setTrainerCount(trainers.length);
                setMemberCount(members.length);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };

        fetchUsers();
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
                { icon: Calendar, label: 'Total Sessions', value: '89', },
                { icon: Users, label: 'Active Clients', value: '23', },
                { icon: Star, label: 'Average Rating', value: '4.8', },
                { icon: DollarSign, label: 'Earnings', value: '$2,340', },
            ];
        }

        // Member
        return [
            { icon: Calendar, label: 'Sessions Booked', value: '12', },
            { icon: TrendingUp, label: 'Workout Streak', value: '7 days', },
            { icon: Star, label: 'Favorite Trainer', value: 'Sarah J.', },
            { icon: Users, label: 'Community Posts', value: '5' },
        ];
    };

    const stats = getStatsForRole();

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Welcome back, {user?.displayName}!
                </h1>
                <p className="text-gray-600">
                    Here's what's happening with your {user?.role === 'admin' ? 'platform' : user?.role === 'trainer' ? 'training business' : 'fitness journey'} today.
                </p>
            </div>

            {/* Stats Grid */}
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
                            <p className="text-gray-600 text-sm">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                    {user?.role === 'admin' && (
                        <>
                            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                                <div className="bg-blue-600 p-2 rounded-full">
                                    <Users className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">New trainer application received</p>
                                    <p className="text-sm text-gray-600">Emma Davis applied to become a trainer</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                                <div className="bg-green-600 p-2 rounded-full">
                                    <DollarSign className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">Payment received</p>
                                    <p className="text-sm text-gray-600">$100 from John Doe for Premium membership</p>
                                </div>
                            </div>
                        </>
                    )}

                    {user?.role === 'trainer' && (
                        <>
                            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                                <div className="bg-blue-600 p-2 rounded-full">
                                    <Calendar className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">New session booked</p>
                                    <p className="text-sm text-gray-600">Jane Smith booked a yoga session for tomorrow</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg">
                                <div className="bg-yellow-600 p-2 rounded-full">
                                    <Star className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">New review received</p>
                                    <p className="text-sm text-gray-600">5-star review from Mike Rodriguez</p>
                                </div>
                            </div>
                        </>
                    )}

                    {user?.role === 'member' && (
                        <>
                            <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                                <div className="bg-green-600 p-2 rounded-full">
                                    <TrendingUp className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">Workout completed</p>
                                    <p className="text-sm text-gray-600">HIIT session with Sarah Johnson</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                                <div className="bg-blue-600 p-2 rounded-full">
                                    <Calendar className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">Upcoming session</p>
                                    <p className="text-sm text-gray-600">Yoga with Sarah Johnson tomorrow at 7 AM</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Be a Trainer CTA for Members */}
            {user?.role === 'member' && (
                <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl p-6 text-white mt-8">
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