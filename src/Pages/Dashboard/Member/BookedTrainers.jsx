import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router'; // Using react-router-dom for Link
import { Star, Calendar, Clock, MessageSquare, User, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAxiosSecure from '../../../Provider/UseAxiosSecure';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { AuthContext } from '../../../Provider/AuthProvider';
import Loader from '../../Loader';

const BookedTrainers = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [reviewData, setReviewData] = useState({
        rating: 5,
        comment: ''
    });

    // Fetch user's bookings from the backend
    const { data: bookings = [], isLoading, isError, error, refetch } = useQuery({
        queryKey: ['userBookings', user?.email],
        queryFn: async () => {
            if (!user?.email) {
                throw new Error("User email not available for fetching bookings.");
            }
            const response = await axiosSecure.get(`/bookings/user/${user.email}`);
            return response.data;
        },
        enabled: !!user?.email,
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
    });

    // Mutation for submitting a review
    const submitReviewMutation = useMutation({
        mutationFn: async (reviewPayload) => {
            const { trainerId, rating, comment, userName, userEmail, trainerName, trainerEmail, bookingId } = reviewPayload;

            const reviewResponse = await axiosSecure.post('/reviews', {
                trainerId: trainerId,
                reviewerEmail: userEmail,
                reviewerName: userName,
                trainerEmail: trainerEmail,
                trainerName: trainerName,
                rating: rating,
                comment: comment,
                bookingId: bookingId,
                createdAt: new Date().toISOString()
            });

            // Additionally, you could update the booking status on the backend to "reviewed" if needed
            // await axiosSecure.patch(`/bookings/${bookingId}/review-status`, { isReviewed: true });

            return reviewResponse.data;
        },
        onSuccess: () => {
            Swal.fire(
                'Review Submitted!',
                'Your review has been successfully recorded.',
                'success'
            );
            setShowReviewModal(false);
            setReviewData({ rating: 5, comment: '' });
            queryClient.invalidateQueries(['trainerData', selectedBooking?.trainerEmail]);
            refetch();
            queryClient.invalidateQueries(['trainerReviews', selectedBooking?.trainerEmail]);
        },
        onError: (err) => {
            console.error('Error submitting review:', err);
            if (err.response && err.response.status === 409) {
                Swal.fire(
                    'Already Reviewed!',
                    'You have already submitted a review for this trainer.',
                    'info'
                );
            } else {
                Swal.fire(
                    'Error!',
                    `Failed to submit review. ${err.response?.data?.message || 'Please try again later.'}`,
                    'error'
                );
            }
        },
    });

    const handleReview = (booking) => {
        setSelectedBooking(booking);
        setReviewData({ rating: 5, comment: '' });
        setShowReviewModal(true);
    };

    const handleSubmitReview = (e) => {
        e.preventDefault();
        if (!selectedBooking || !user) {
            Swal.fire('Error', 'Booking or user information missing.', 'error');
            return;
        }

        const reviewPayload = {
            trainerId: selectedBooking.trainerId,
            rating: reviewData.rating,
            comment: reviewData.comment,
            userName: user.displayName,
            userEmail: user.email,
            trainerName: selectedBooking.trainerName,
            trainerEmail: selectedBooking.trainerEmail,
            bookingId: selectedBooking._id
        };

        submitReviewMutation.mutate(reviewPayload);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
            case 'upcoming':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
        }
    };

    const getBookingStatus = (bookingCreatedAt) => {
        const bookingDate = new Date(bookingCreatedAt);
        const now = new Date();
        if (bookingDate < now) {
            return 'completed';
        } else {
            return 'upcoming';
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                delayChildren: 0.2,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 10 } },
        exit: { opacity: 0, x: -100, transition: { duration: 0.3 } }
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } },
        exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
    };

    if (isLoading) {
        return <Loader />;
    }

    if (isError) {
        return (
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="text-center py-8 text-red-600 dark:text-red-400"
            >
                <motion.p variants={itemVariants}>Error loading bookings: {error?.message || "Unknown error."}</motion.p>
            </motion.div>
        );
    }

    const completedBookings = bookings.filter(b => getBookingStatus(b.createdAt) === 'completed');
    const upcomingBookings = bookings.filter(b => getBookingStatus(b.createdAt) === 'upcoming');
    const totalSpent = bookings.reduce((sum, b) => sum + (b.packagePrice || 0), 0);

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="p-6 md:p-8 font-inter bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-100"
        >
            <motion.div variants={itemVariants} className="mb-8">
                <motion.h1
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-3xl font-bold text-gray-800 dark:text-white mb-2"
                >
                    Booked Trainers
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-gray-600 dark:text-gray-400"
                >
                    View your training sessions and leave reviews.
                </motion.p>
            </motion.div>

            {/* Stats */}
            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{bookings.length}</h3>
                        <p className="text-gray-600 dark:text-gray-400">Total Bookings</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </motion.div>
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{completedBookings.length}</h3>
                        <p className="text-gray-600 dark:text-gray-400">Completed</p>
                    </div>
                    <Star className="h-8 w-8 text-green-600 dark:text-green-400" />
                </motion.div>
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{upcomingBookings.length}</h3>
                        <p className="text-gray-600 dark:text-gray-400">Upcoming</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </motion.div>
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">${totalSpent}</h3>
                        <p className="text-gray-600 dark:text-gray-400">Total Spent</p>
                    </div>
                    <User className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </motion.div>
            </motion.div>

            {/* Bookings List */}
            <motion.div variants={containerVariants} className="space-y-6">
                <AnimatePresence>
                    {bookings.length > 0 ? (
                        bookings.map((booking) => (
                            <motion.div
                                key={booking._id}
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                layout
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                                    {/* Trainer Info */}
                                    <div className="flex items-center space-x-4">
                                        <img
                                            src={booking.trainerPhotoURL || `https://placehold.co/64x64/E0E7FF/4338CA?text=${booking.trainerName?.charAt(0).toUpperCase() || '?'}`}
                                            alt={booking.trainerName}
                                            className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-gray-700"
                                            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/64x64/E0E7FF/4338CA?text=${booking.trainerName?.charAt(0).toUpperCase() || '?'}` }}
                                        />
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{booking.trainerName}</h3>
                                            <p className="text-orange-600 dark:text-orange-400 font-medium">{booking.trainerSpecialization}</p>
                                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                                <span className="bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100 px-2 py-1 rounded text-xs">
                                                    {booking.sessionType}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Session Details */}
                                    <div className="flex-1 lg:mx-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Session Details</h4>
                                                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                                    <div className="flex items-center space-x-2">
                                                        <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                        <span>{booking.slotDay.join(', ')}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                        <span>{booking.slotTime}</span>
                                                    </div>
                                                    <div>Slot: {booking.slotName}</div>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Package Info</h4>
                                                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                                    <div>{booking.packageName}</div>
                                                    <div className="font-semibold text-green-600 dark:text-green-400">${booking.packagePrice}</div>
                                                    <div>Booked: {new Date(booking.createdAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status & Actions */}
                                    <div className="flex flex-col items-end space-y-3">
                                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(getBookingStatus(booking.createdAt))}`}>
                                            {getBookingStatus(booking.createdAt)}
                                        </span>

                                        {getBookingStatus(booking.createdAt) === 'completed' && (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleReview(booking)}
                                                className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white dark:bg-blue-600 dark:hover:bg-blue-700 px-4 py-2 rounded-lg text-sm transition-colors duration-200"
                                                disabled={submitReviewMutation.isPending}
                                            >
                                                <MessageSquare className="h-4 w-4" />
                                                <span>Review</span>
                                            </motion.button>
                                        )}

                                        {getBookingStatus(booking.createdAt) === 'upcoming' && (
                                            <div className="space-y-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="w-full bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600 px-4 py-2 rounded-lg text-sm transition-colors duration-200"
                                                >
                                                    Join Session
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg text-sm transition-colors duration-200"
                                                >
                                                    Reschedule
                                                </motion.button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div variants={itemVariants} className="p-12 text-center text-gray-600 dark:text-gray-400">
                            <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No Bookings Found</h3>
                            <p className="mb-6">You haven't booked any training sessions yet.</p>
                            <Link to="/trainers">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-blue-700 hover:bg-blue-800 text-white dark:bg-blue-600 dark:hover:bg-blue-700 px-6 py-3 rounded-lg transition-colors duration-200"
                                >
                                    Explore Trainers
                                </motion.button>
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Review Modal */}
            <AnimatePresence>
                {showReviewModal && selectedBooking && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full shadow-lg"
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Leave a Review</h2>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setShowReviewModal(false)}
                                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <XCircle className="h-6 w-6" />
                                    </motion.button>
                                </div>

                                <div className="flex items-center space-x-3 mb-6">
                                    <img
                                        src={selectedBooking.trainerPhotoURL || `https://placehold.co/48x48/E0E7FF/4338CA?text=${selectedBooking.trainerName?.charAt(0).toUpperCase() || '?'}`}
                                        alt={selectedBooking.trainerName}
                                        className="w-12 h-12 rounded-full object-cover"
                                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/48x48/E0E7FF/4338CA?text=${selectedBooking.trainerName?.charAt(0).toUpperCase() || '?'}` }}
                                    />
                                    <div>
                                        <h3 className="font-semibold text-gray-800 dark:text-white">{selectedBooking.trainerName}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedBooking.slotName}</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmitReview} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Rating
                                        </label>
                                        <div className="flex space-x-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <motion.button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                                                    whileHover={{ scale: 1.2 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className={`text-3xl ${star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                                                        } hover:text-yellow-400 transition-colors duration-200`}
                                                >
                                                    ★
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Your Review
                                        </label>
                                        <textarea
                                            value={reviewData.comment}
                                            onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                            rows={4}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
                                            placeholder="Share your experience with this trainer..."
                                            required
                                        />
                                    </div>

                                    <div className="flex space-x-4">
                                        <motion.button
                                            type="button"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setShowReviewModal(false)}
                                            className="flex-1 bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-4 py-3 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors duration-200"
                                        >
                                            Cancel
                                        </motion.button>
                                        <motion.button
                                            type="submit"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex-1 bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-700 px-4 py-3 rounded-lg hover:bg-blue-800 transition-colors duration-200"
                                            disabled={submitReviewMutation.isPending}
                                        >
                                            {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                                        </motion.button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default BookedTrainers;