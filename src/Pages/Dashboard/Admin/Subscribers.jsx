import React, { useState } from 'react';
import { Mail, Search, Download, Trash2, Calendar, UserX } from 'lucide-react'; // Changed MousePointerClick to UserX
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../../Provider/UseAxiosSecure';

const Subscribers = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const subscribersPerPage = 10;

    // TanStack Query to fetch subscribers
    const { data: subscribers = [], isLoading, isError, error } = useQuery({
        queryKey: ['newsletterSubscribers'],
        queryFn: async () => {
            const res = await axiosSecure.get('/newsletter');
            return res.data;
        },
        staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
        cacheTime: 30 * 60 * 1000, // Data kept in cache for 30 minutes
    });

    // TanStack Query mutation for deleting a subscriber
    const deleteSubscriberMutation = useMutation({
        mutationFn: async (id) => {
            await axiosSecure.delete(`/newsletter/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['newsletterSubscribers']); // Invalidate cache to refetch data
            Swal.fire({ // SweetAlert2 success message
                icon: 'success',
                title: 'Deleted!',
                text: 'Subscriber has been deleted successfully.',
                showConfirmButton: false,
                timer: 1500
            });
        },
        onError: (err) => {
            console.error('Error deleting subscriber:', err);
            Swal.fire({ // SweetAlert2 error message
                icon: 'error',
                title: 'Error!',
                text: 'Failed to delete subscriber. Please try again.',
            });
        },
    });

    // Calculate unsubscribed this month (example: assuming 'unsubscribedAt' field exists on subscriber)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const unsubscribedThisMonth = subscribers.filter(
        (sub) => sub.unsubscribedAt && // Check if unsubscribedAt exists
            new Date(sub.unsubscribedAt).getMonth() === currentMonth &&
            new Date(sub.unsubscribedAt).getFullYear() === currentYear
    ).length;

    const filteredSubscribers = subscribers.filter(
        (subscriber) =>
            subscriber.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            subscriber.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastSubscriber = currentPage * subscribersPerPage;
    const indexOfFirstSubscriber = indexOfLastSubscriber - subscribersPerPage;
    const currentSubscribers = filteredSubscribers.slice(indexOfFirstSubscriber, indexOfLastSubscriber);
    const totalPages = Math.ceil(filteredSubscribers.length / subscribersPerPage);

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
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
            ['Name', 'Email', 'Subscribed Date', 'Role'],
            ...filteredSubscribers.map((sub) => [
                sub.name,
                sub.email,
                format(new Date(sub.createdAt), 'yyyy-MM-dd'),
                sub.userRole || 'Subscriber',
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

        Swal.fire({ // SweetAlert2 success message for export
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
            className="p-8 min-h-screen"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div className="mb-12 text-center md:text-left" variants={itemVariants}>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Newsletter Subscribers</h1>
                <p className="text-lg text-gray-600">
                    Effortlessly manage your newsletter subscribers and track key engagement metrics.
                </p>
            </motion.div>

            {/* Stats */}
            <motion.div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12" variants={containerVariants}>
                <motion.div
                    className="bg-white rounded-2xl shadow-lg p-7 border border-gray-100 flex flex-col justify-between"
                    variants={cardVariants}
                    whileHover="hover"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-4xl font-bold text-gray-900 leading-tight">{subscribers.length}</h3>
                            <p className="text-lg text-gray-600">Total Subscribers</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-full">
                            <Mail className="h-10 w-10 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">All time active subscribers.</p>
                </motion.div>

                <motion.div
                    className="bg-white rounded-2xl shadow-lg p-7 border border-gray-100 flex flex-col justify-between"
                    variants={cardVariants}
                    whileHover="hover"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-4xl font-bold text-gray-900 leading-tight">
                                {
                                    subscribers.filter(
                                        (sub) =>
                                            new Date(sub.createdAt).getMonth() === new Date().getMonth() &&
                                            new Date(sub.createdAt).getFullYear() === new Date().getFullYear()
                                    ).length
                                }
                            </h3>
                            <p className="text-lg text-gray-600">New This Month</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-full">
                            <Calendar className="h-10 w-10 text-green-600" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Subscribers joined in the current month.</p>
                </motion.div>

                {/* New stat: Unsubscribed This Month */}
                <motion.div
                    className="bg-white rounded-2xl shadow-lg p-7 border border-gray-100 flex flex-col justify-between"
                    variants={cardVariants}
                    whileHover="hover"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            {/* Display calculated unsubscribed count */}
                            <h3 className="text-4xl font-bold text-gray-900 leading-tight">{unsubscribedThisMonth}</h3>
                            <p className="text-lg text-gray-600">Unsubscribed This Month</p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-full"> 
                            <UserX className="h-10 w-10 text-red-600" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Subscribers who opted out in the current month.</p>
                </motion.div>
            </motion.div>

            {/* Controls */}
            <motion.div
                className="bg-white rounded-2xl shadow-lg p-8 mb-12 border border-gray-100"
                variants={itemVariants}
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-6 md:space-y-0">
                    <div className="relative w-full md:w-1/2 lg:w-1/3">
                        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-14 pr-6 py-3.5 border border-gray-300 rounded-xl w-full text-lg text-gray-700
                                       focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 ease-in-out"
                        />
                    </div>
                    <motion.button
                        onClick={handleExport}
                        className="flex items-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3.5 rounded-xl
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
                </div>
            </motion.div>

            {/* Table / Loading / No Data */}
            <motion.div
                className="bg-white rounded-2xl shadow-lg overflow-hidden min-h-[400px] border border-gray-100"
                variants={itemVariants}
            >
                {isLoading ? (
                    <div className="flex justify-center items-center p-20">
                        <motion.div
                            className="w-16 h-16 border-4 border-t-4 border-gray-200 rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            style={{ borderTopColor: '#3B82F6' }}
                        ></motion.div>
                    </div>
                ) : isError ? (
                    <div className="text-center p-20 text-red-500 text-xl flex flex-col items-center justify-center">
                        <p className="mb-4">Error loading subscribers: {error.message}</p>
                        <button
                            onClick={() => queryClient.invalidateQueries(['newsletterSubscribers'])}
                            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : filteredSubscribers.length === 0 ? (
                    <div className="text-center p-20 text-gray-500 text-xl flex flex-col items-center justify-center">
                        <Mail className="h-16 w-16 mb-6 text-gray-400" />
                        <p>No subscribers found matching your search.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-8 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Subscriber</th>
                                        <th className="px-8 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                        <th className="px-8 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Subscribed Date</th>
                                        <th className="px-8 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                                        <th className="px-8 py-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentSubscribers.map((subscriber) => (
                                        <motion.tr
                                            key={subscriber._id}
                                            className="hover:bg-gray-50 transition-colors duration-150"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3 }}
                                            whileHover={{ backgroundColor: '#F8F8F8' }}
                                        >
                                            <td className="px-8 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                                                        {subscriber.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-5">
                                                        <div className="text-base font-medium text-gray-900">{subscriber.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 whitespace-nowrap text-base text-gray-800">{subscriber.email}</td>
                                            <td className="px-8 py-4 whitespace-nowrap text-base text-gray-800">
                                                {format(new Date(subscriber.createdAt), 'MMM dd, yyyy')}
                                            </td>
                                            <td className="px-8 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center px-3.5 py-1.5 text-xs font-semibold rounded-full
                                                        ${subscriber.userRole && subscriber.userRole.toLowerCase() !== 'subscriber'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-indigo-100 text-indigo-800'
                                                        }`}
                                                >
                                                    {subscriber.userRole || 'Subscriber'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4 whitespace-nowrap text-sm font-medium">
                                                <motion.button
                                                    onClick={() => handleDelete(subscriber._id)}
                                                    className="text-red-600 hover:text-red-800 p-2.5 rounded-full
                                                               hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2
                                                               transition-all duration-200 ease-in-out"
                                                    title="Delete Subscriber"
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
                            <div className="bg-white px-8 py-5 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center text-sm">
                                <div className="text-gray-700 mb-4 sm:mb-0">
                                    Showing <span className="font-semibold">{indexOfFirstSubscriber + 1}</span> to{' '}
                                    <span className="font-semibold">{Math.min(indexOfLastSubscriber, filteredSubscribers.length)}</span> of{' '}
                                    <span className="font-semibold">{filteredSubscribers.length}</span> results
                                </div>
                                <div className="flex space-x-3">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <motion.button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-4.5 py-2 rounded-lg font-medium transition-all duration-200 ease-in-out
                                                ${currentPage === page
                                                    ? 'bg-blue-600 text-white shadow-md'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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