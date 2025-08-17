import React, { useState } from 'react';
import { Mail, Search, Download, Trash2, Calendar, UserX } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
// Assuming useAxiosSecure is correctly imported and configured
import useAxiosSecure from '../../../Provider/UseAxiosSecure';

const Subscribers = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const subscribersPerPage = 10;
    const [showActiveOnly, setShowActiveOnly] = useState(false); // State to toggle between active and all subscribers

    // TanStack Query to fetch subscribers
    const { data: subscribers = [], isLoading, isError, error } = useQuery({
        queryKey: ['newsletterSubscribers'],
        queryFn: async () => {
            const res = await axiosSecure.get('/newsletter');
            return res.data;
        },
        staleTime: 5 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    // TanStack Query mutation for deleting a subscriber
    const deleteSubscriberMutation = useMutation({
        mutationFn: async (id) => {
            await axiosSecure.delete(`/newsletter/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['newsletterSubscribers']); // Invalidate cache to refetch data
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Subscriber has been permanently deleted.',
                showConfirmButton: false,
                timer: 1500
            });
        },
        onError: (err) => {
            console.error('Error deleting subscriber:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed to delete subscriber. Please try again.',
            });
        },
    });

    // Calculate stats based on ALL fetched subscribers, not just filtered ones for display
    const totalActiveSubscribers = subscribers.filter(sub => !sub.isUnsubscribed).length;

    const newSubscribedThisMonth = subscribers.filter(
        (sub) =>
            !sub.isUnsubscribed && // Only count active subscribers
            new Date(sub.createdAt).getMonth() === new Date().getMonth() &&
            new Date(sub.createdAt).getFullYear() === new Date().getFullYear()
    ).length;

    const unsubscribedThisMonth = subscribers.filter(
        (sub) =>
            sub.isUnsubscribed && // Only count unsubscribed subscribers
            sub.unsubscribedAt && // Ensure unsubscribedAt exists for accurate timestamp
            new Date(sub.unsubscribedAt).getMonth() === new Date().getMonth() &&
            new Date(sub.unsubscribedAt).getFullYear() === new Date().getFullYear()
    ).length;

    // Filter subscribers for display based on search term and active/all status toggle
    const filteredAndStatusSubscribers = subscribers.filter(
        (subscriber) => {
            const matchesSearch =
                subscriber.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                subscriber.email?.toLowerCase().includes(searchTerm.toLowerCase());

            const isActive = !subscriber.isUnsubscribed; // Determine if subscriber is active

            return matchesSearch && (showActiveOnly ? isActive : true); // Apply filter based on toggle
        }
    );

    const indexOfLastSubscriber = currentPage * subscribersPerPage;
    const indexOfFirstSubscriber = indexOfLastSubscriber - subscribersPerPage;
    const currentSubscribers = filteredAndStatusSubscribers.slice(indexOfFirstSubscriber, indexOfLastSubscriber);
    const totalPages = Math.ceil(filteredAndStatusSubscribers.length / subscribersPerPage);

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This will permanently delete the subscriber record!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteSubscriberMutation.mutate(id);
            }
        });
    };

    const handleExport = () => {
        const csvContent = [
            // CSV header: 'Role' now defaults to 'Member'
            ['Name', 'Email', 'Status', 'Subscribed Date', 'Unsubscribed Date', 'Role'],
            ...filteredAndStatusSubscribers.map((sub) => [
                sub.name,
                sub.email,
                sub.isUnsubscribed ? 'Unsubscribed' : 'Active', // Include status in CSV
                format(new Date(sub.createdAt), 'yyyy-MM-dd'),
                sub.unsubscribedAt ? format(new Date(sub.unsubscribedAt), 'yyyy-MM-dd') : 'N/A', // Include unsub date
                // Default role is 'Member'
                sub.userRole || 'Member',
            ]),
        ]
            .map((e) => e.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'subscribers.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        Swal.fire({
            icon: 'success',
            title: 'Exported!',
            text: 'Subscribers data exported successfully!',
            showConfirmButton: false,
            timer: 1500
        });
    };

    // Framer Motion Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 10,
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
        hover: { scale: 1.02, boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)" },
    };

    return (
        <motion.div
            className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div className="mb-12 text-center md:text-left" variants={itemVariants}>
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">Newsletter Subscribers</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Effortlessly manage your newsletter subscribers and track key engagement metrics.
                </p>
            </motion.div>

            {/* Stats */}
            <motion.div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12" variants={containerVariants}>
                <motion.div
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-7 border border-gray-100 dark:border-gray-700 flex flex-col justify-between"
                    variants={cardVariants}
                    whileHover="hover"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{totalActiveSubscribers}</h3>
                            <p className="text-lg text-gray-600 dark:text-gray-400">Total Active Subscribers</p>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-full">
                            <Mail className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Currently active subscribers receiving emails.</p>
                </motion.div>

                <motion.div
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-7 border border-gray-100 dark:border-gray-700 flex flex-col justify-between"
                    variants={cardVariants}
                    whileHover="hover"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                                {newSubscribedThisMonth}
                            </h3>
                            <p className="text-lg text-gray-600 dark:text-gray-400">New Active This Month</p>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900 rounded-full">
                            <Calendar className="h-10 w-10 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">New active subscribers joined in the current month.</p>
                </motion.div>

                <motion.div
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-7 border border-gray-100 dark:border-gray-700 flex flex-col justify-between"
                    variants={cardVariants}
                    whileHover="hover"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{unsubscribedThisMonth}</h3>
                            <p className="text-lg text-gray-600 dark:text-gray-400">Unsubscribed This Month</p>
                        </div>
                        <div className="p-4 bg-red-50 dark:bg-red-900 rounded-full">
                            <UserX className="h-10 w-10 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Subscribers who opted out in the current month.</p>
                </motion.div>
            </motion.div>

            {/* Controls */}
            <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-12 border border-gray-100 dark:border-gray-700"
                variants={itemVariants}
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-6 md:space-y-0">
                    <div className="relative w-full md:w-1/2 lg:w-1/3">
                        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Reset to first page on search
                            }}
                            className="pl-14 pr-6 py-3.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl w-full text-lg text-gray-700
                                       focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 ease-in-out"
                        />
                    </div>
                    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                        <motion.button
                            onClick={handleExport}
                            className="flex items-center justify-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3.5 rounded-xl
                                   shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                   transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading || subscribers.length === 0}
                            title={isLoading || subscribers.length === 0 ? "No data to export" : "Export CSV"}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Download className="h-5 w-5" />
                            <span className="font-semibold text-lg">Export to CSV</span>
                        </motion.button>
                        <motion.button
                            onClick={() => {
                                setShowActiveOnly(!showActiveOnly);
                                setCurrentPage(1); // Reset page when toggling filter
                            }}
                            className={`flex items-center justify-center space-x-3 px-7 py-3.5 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out
                                ${showActiveOnly
                                    ? 'bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-500'
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-100 dark:focus:ring-gray-400'
                                }`}
                            title={showActiveOnly ? "Show All Subscribers" : "Show Active Subscribers Only"}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {showActiveOnly ? <UserX className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                            <span className="font-semibold text-lg">{showActiveOnly ? "Show All" : "Show Active"}</span>
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Table / Loading / No Data */}
            <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden min-h-[400px] border border-gray-100 dark:border-gray-700"
                variants={itemVariants}
            >
                {isLoading ? (
                    <div className="flex justify-center items-center p-20">
                        <motion.div
                            className="w-16 h-16 border-4 border-t-4 border-gray-200 dark:border-gray-600 rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            style={{ borderTopColor: '#3B82F6' }}
                        ></motion.div>
                    </div>
                ) : isError ? (
                    <div className="text-center p-20 text-red-500 dark:text-red-400 text-xl flex flex-col items-center justify-center">
                        <p className="mb-4">Error loading subscribers: {error.message}</p>
                        <button
                            onClick={() => queryClient.invalidateQueries(['newsletterSubscribers'])}
                            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : filteredAndStatusSubscribers.length === 0 ? (
                    <div className="text-center p-20 text-gray-500 dark:text-gray-500 text-xl flex flex-col items-center justify-center">
                        <Mail className="h-16 w-16 mb-6 text-gray-400 dark:text-gray-600" />
                        <p>No subscribers found matching your criteria.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-8 py-5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Subscriber</th>
                                        <th className="px-8 py-5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                        <th className="px-8 py-5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-8 py-5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Subscribed Date</th>
                                        <th className="px-8 py-5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                        <th className="px-8 py-5 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {currentSubscribers.map((subscriber) => (
                                        <motion.tr
                                            key={subscriber._id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 border-b border-gray-100 dark:border-gray-700"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3 }}
                                            whileHover={{ backgroundColor: '#F8F8F8' }}
                                        >
                                            <td className="px-8 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-orange-400 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 font-bold text-lg shadow-md flex-shrink-0">
                                                        {subscriber.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-5">
                                                        <div className="text-base font-medium text-gray-900 dark:text-gray-100">{subscriber.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 whitespace-nowrap text-base text-gray-800 dark:text-gray-200">{subscriber.email}</td>
                                            <td className="px-8 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center px-3.5 py-1.5 text-xs font-semibold rounded-full
                                                        ${subscriber.isUnsubscribed
                                                            ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300' // Red for unsubscribed
                                                            : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' // Green for active
                                                        }`}
                                                >
                                                    {subscriber.isUnsubscribed ? 'Unsubscribed' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 whitespace-nowrap text-base text-gray-800 dark:text-gray-200">
                                                {format(new Date(subscriber.createdAt), 'MMM dd, yyyy')}
                                            </td>
                                            <td className="px-8 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center px-3.5 py-1.5 text-xs font-semibold rounded-full
                                                        ${subscriber.userRole && ['member', 'trainer', 'admin'].includes(subscriber.userRole.toLowerCase())
                                                            ? (subscriber.userRole.toLowerCase() === 'admin' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300' :
                                                                subscriber.userRole.toLowerCase() === 'trainer' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300' :
                                                                    'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300')
                                                            : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300' // Default to Member styling
                                                        }`}
                                                >
                                                    {subscriber.userRole || 'Member'} {/* Changed default to 'Member' */}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 whitespace-nowrap text-sm font-medium">
                                                <motion.button
                                                    onClick={() => handleDelete(subscriber._id)}
                                                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 p-2.5 rounded-full
                                                               hover:bg-red-50 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-500 focus:ring-offset-2
                                                               transition-all duration-200 ease-in-out"
                                                    title="Permanently Delete Subscriber"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    disabled={deleteSubscriberMutation.isLoading}
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </motion.button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="bg-white dark:bg-gray-800 px-8 py-5 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center text-sm">
                                <div className="text-gray-700 dark:text-gray-300 mb-4 sm:mb-0">
                                    Showing <span className="font-semibold">{indexOfFirstSubscriber + 1}</span> to{' '}
                                    <span className="font-semibold">{Math.min(indexOfLastSubscriber, filteredAndStatusSubscribers.length)}</span> of{' '}
                                    <span className="font-semibold">{filteredAndStatusSubscribers.length}</span> results
                                </div>
                                <div className="flex space-x-3">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <motion.button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-4.5 py-2 rounded-lg font-medium transition-all duration-200 ease-in-out
                                                ${currentPage === page
                                                    ? 'bg-blue-600 text-white shadow-md'
                                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                }`}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {page}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </motion.div>
        </motion.div>
    );
};

export default Subscribers;