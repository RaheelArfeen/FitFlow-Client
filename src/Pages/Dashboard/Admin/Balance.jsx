import React from 'react';
import { DollarSign, Check, Users, Package, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../Provider/UseAxiosSecure';
import Loader from '../../../Pages/Loader';

const Balance = () => {
    const axiosSecure = useAxiosSecure();

    const { data: bookingData, isLoading, isError, error } = useQuery({
        queryKey: ['bookingsData'],
        queryFn: async () => {
            const response = await axiosSecure.get('/bookings');
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
    });

    const bookings = bookingData?.bookings || [];
    const totalRevenue = bookingData?.totalRevenue || 0;
    const recentTransactions = bookings.slice(0, 6);

    const uniquePaidMembers = new Set(
        bookings.filter(b => b.paymentStatus === 'Completed').map(b => b.userEmail)
    ).size;

    const averageBookingPrice = bookings.length > 0 ? (totalRevenue / bookings.length).toFixed(2) : 0;

    const packageTypeCounts = bookings.reduce((acc, booking) => {
        const packageName = booking.packageName || 'Unknown Package';
        acc[packageName] = (acc[packageName] || 0) + 1;
        return acc;
    }, {});

    const totalPackagesBooked = Object.values(packageTypeCounts).reduce((sum, count) => sum + count, 0);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const cardVariants = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 },
    };

    if (isLoading) {
        return <Loader />;
    }

    if (isError) {
        return <div className="text-center py-12 text-red-600 dark:text-red-400 text-lg">Error: {error.message}</div>;
    }

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Financial Overview</h1>
                <p className="text-gray-600 dark:text-gray-400">Track your platform's financial performance and transactions.</p>
            </div>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6 mb-10"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {[
                    { label: 'Total Revenue', count: `$${totalRevenue}`, icon: <DollarSign />, color: 'green' },
                    { label: 'Avg Booking Price', count: `$${averageBookingPrice}`, icon: <Package />, color: 'orange' },
                    { label: 'Total Transactions', count: bookings.length, icon: <Check />, color: 'blue' },
                    { label: 'Paid Members', count: uniquePaidMembers, icon: <Users />, color: 'purple' },
                ].map(({ label, count, icon, color }, i) => (
                    <motion.div
                        key={i}
                        className="bg-white dark:bg-gray-800 shadow rounded-xl px-6 py-8 flex items-center justify-between"
                        variants={cardVariants}
                        whileHover={{
                            scale: 1.03,
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        }}
                        transition={{ duration: 0.2 }}
                    >
                        <div>
                            <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{count}</h3>
                            <p className="text-lg text-gray-600 dark:text-gray-400">{label}</p>
                        </div>
                        {React.cloneElement(icon, { className: `h-10 w-10 text-${color}-600 dark:text-${color}-400` })}
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Recent Transactions</h2>
                    <div className="space-y-4">
                        {recentTransactions.length > 0 ? (
                            recentTransactions.map((transaction) => (
                                <div key={transaction._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border dark:border-gray-600 border-gray-200">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 overflow-hidden">
                                            {transaction.userPhotoURL ? (
                                                <img
                                                    src={transaction.userPhotoURL}
                                                    alt={transaction.userName || "User"}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span>
                                                    {transaction.userName ? transaction.userName.charAt(0).toUpperCase() : 'N/A'}
                                                </span>
                                            )}
                                        </div>
                                        <div className='space-y-1'>
                                            <div className="flex items-center gap-2">
                                                <div className="font-semibold text-gray-900 dark:text-gray-100">{transaction.userName || 'Unknown'}</div>
                                                <div
                                                    className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium select-none ${transaction.userRole === 'admin'
                                                        ? 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                                                        : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                                                        }`}
                                                >
                                                    {transaction.userRole === 'admin' && (
                                                        <Shield className="w-3.5 h-3.5 text-red-700 dark:text-red-400" />
                                                    )}
                                                    <span>
                                                        {transaction.userRole
                                                            ? transaction.userRole.charAt(0).toUpperCase() + transaction.userRole.slice(1)
                                                            : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">{transaction.packageName}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-500">with {transaction.trainerName}</div>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <div className="font-bold text-green-600 dark:text-green-400">${transaction.price.toFixed(2)}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-500">
                                            {new Date(transaction.createdAt).toLocaleDateString()}
                                        </div>
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs mt-1
                                            ${transaction.paymentStatus === 'Completed' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'}`}>
                                            {transaction.paymentStatus}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-gray-500">No recent transactions found.</p>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Bookings by Package Type</h2>
                    <div className="space-y-4">
                        {totalPackagesBooked > 0 ? (
                            Object.entries(packageTypeCounts).map(([packageName, count]) => (
                                <div key={packageName}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{packageName}</span>
                                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{count} bookings</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                                        <div
                                            className="bg-indigo-600 dark:bg-indigo-400 h-4 rounded-full transition-all duration-500"
                                            style={{ width: `${(count / totalPackagesBooked) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-gray-500">No package booking data available.</p>
                        )}
                    </div>
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg text-center">
                        <div className="text-xl font-bold text-blue-800 dark:text-blue-300">{totalPackagesBooked}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Packages Booked</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Balance;