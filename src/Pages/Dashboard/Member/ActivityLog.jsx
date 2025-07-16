import React, { useContext, useState } from 'react';
import { Eye, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../Provider/UseAxiosSecure';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../../Provider/AuthProvider';
import Loader from '../../Loader';
import { Link } from 'react-router';

const ActivityLog = () => {
    const [showModal, setShowModal] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState('');

    const axiosSecure = useAxiosSecure();
    const { user, loading: authLoading } = useContext(AuthContext);

    const queryKey = ['trainerApplications', user?.email];

    const {
        data: allApplications,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: queryKey,
        queryFn: async () => {
            if (!user?.email) {
                return [];
            }
            const res = await axiosSecure.get('/trainers');
            return res.data;
        },
        enabled: !!user?.email && !authLoading,
    });

    const applications = allApplications
        ? allApplications.filter(app =>
            (app.status === 'pending' || app.status === 'rejected') &&
            app.email === user?.email
        )
        : [];

    const handleViewFeedback = (feedback) => {
        setSelectedFeedback(feedback);
        setShowModal(true);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'approved':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'rejected':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <AlertCircle className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const pageVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const sectionVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut",
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
        exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2, ease: "easeIn" } }
    };

    if (authLoading) {
        return (
            <Loader />
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col justify-center items-center h-screen text-gray-700 p-4">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg mb-4 text-center">Please log in to view your activity log.</p>
                <Link to="/login">
                    <button className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg transition-colors duration-200">
                        Go to Login
                    </button>
                </Link>
            </div>
        );
    }

    if (isLoading) {
        return (
            <Loader />
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col justify-center items-center h-screen text-red-600 p-4">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-lg text-center">Error loading applications: {error.message}</p>
                <p className="text-md text-gray-600 mt-2">Please try refreshing the page.</p>
            </div>
        );
    }

    return (
        <motion.div
            className="p-8 mx-auto bg-gray-50 min-h-screen"
            initial="hidden"
            animate="visible"
            variants={pageVariants}
        >
            <motion.div variants={itemVariants} className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Activity Log</h1>
                <p className="text-gray-600">Track your trainer application status and feedback.</p>
            </motion.div>

            <motion.div variants={sectionVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800">{applications.length}</h3>
                            <p className="text-gray-600">Total Relevant Applications</p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-blue-600" />
                    </div>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800">{applications.filter(a => a.status === 'pending').length}</h3>
                            <p className="text-gray-600">Pending Review</p>
                        </div>
                        <Clock className="h-8 w-8 text-yellow-500" />
                    </div>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800">{applications.filter(a => a.status === 'rejected').length}</h3>
                            <p className="text-gray-600">Rejected</p>
                        </div>
                        <XCircle className="h-8 w-8 text-red-500" />
                    </div>
                </motion.div>
            </motion.div>

            <motion.div variants={sectionVariants} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Trainer Applications</h2>
                </div>

                {applications.length > 0 ? (
                    <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="divide-y divide-gray-200">
                        {applications.map((application) => (
                            <motion.div
                                key={application._id} // Using _id as the unique key
                                variants={itemVariants}
                                className="p-6 hover:bg-gray-50 transition-colors duration-200"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        {getStatusIcon(application.status)}
                                        <div>
                                            <h3 className="font-semibold text-gray-800">Trainer Application {application.name ? `for ${application.name}` : `ID: ${application._id}`}</h3>
                                            <p className="text-sm text-gray-600">
                                                Applied on {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(application.status)}`}>
                                            {application.status}
                                        </span>

                                        {application.status === 'rejected' && application.adminFeedback && (
                                            <motion.button
                                                onClick={() => handleViewFeedback(application.adminFeedback)}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                                            >
                                                <Eye className="h-4 w-4" />
                                                <span className="text-sm">View Feedback</span>
                                            </motion.button>
                                        )}
                                    </div>
                                </div>

                                {application.status === 'pending' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <Clock className="h-4 w-4 text-yellow-600" />
                                            <span className="text-sm text-yellow-800">
                                                Your application is currently under review. We'll notify you once a decision has been made.
                                            </span>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div variants={itemVariants} className="p-12 text-center">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Relevant Applications Found</h3>
                        <p className="text-gray-600 mb-6">You haven't submitted any pending or rejected trainer applications yet.</p>
                        <Link to={'/be-trainer'}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                            >
                                Apply to Become a Trainer
                            </motion.button>
                        </Link>
                    </motion.div>
                )}
            </motion.div>

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-800">Application Feedback</h2>
                                    <motion.button
                                        onClick={() => setShowModal(false)}
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="text-gray-500 hover:text-gray-700 text-2xl"
                                    >
                                        &times;
                                    </motion.button>
                                </div>

                                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                    <div className="flex items-start space-x-3">
                                        <XCircle className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-semibold text-red-800 mb-2">Application Rejected</h3>
                                            <p className="text-red-700 leading-relaxed">{selectedFeedback}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end space-x-4">
                                    <motion.button
                                        onClick={() => setShowModal(false)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        Close
                                    </motion.button>
                                    <Link to={'/be-trainer'}>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors duration-200"
                                        >
                                            Apply Again
                                        </motion.button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ActivityLog;