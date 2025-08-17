import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
    Star as StarIcon,
    Calendar,
    Award,
    Clock,
    Users,
    MapPin,
    Hourglass,
    X as CloseIcon
} from 'lucide-react';
import useAxiosSecure from '../../Provider/UseAxiosSecure';
import Loader from '../../Pages/Loader';
import Swal from 'sweetalert2';
import { AuthContext } from '../../Provider/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Title } from 'react-head';

const TrainerDetail = () => {
    const { id } = useParams();
    const axiosSecure = useAxiosSecure();
    const { user } = useContext(AuthContext);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // State to manage the modal for all reviews
    const [showAllReviews, setShowAllReviews] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Effect to prevent body scrolling when modal is open
    useEffect(() => {
        if (showAllReviews) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [showAllReviews]);

    // --- TanStack Query for fetching trainer details ---
    const { data: trainer, isLoading, isError, error } = useQuery({
        queryKey: ['trainerDetails', id],
        queryFn: async () => {
            const res = await axiosSecure.get(`/trainers/${id}`);
            return res.data;
        },
        enabled: !!id,
        staleTime: 1000 * 60,
        onError: (err) => {
            console.error('Failed to fetch trainer data:', err);
        },
    });

    // --- TanStack Query for fetching user's rating for this trainer ---
    const { data: userRatingData, isLoading: isLoadingUserRating } = useQuery({
        queryKey: ['userRating', id, user?.email],
        queryFn: async () => {
            if (!user?.email) return { userRating: 0 };
            const res = await axiosSecure.get(`/trainers/rating/${id}`, { params: { userEmail: user.email } });
            return res.data;
        },
        enabled: !!user?.email && !!id,
        staleTime: 0,
    });

    // --- TanStack Query for fetching user's bookings ---
    const { data: userBookings = [], isLoading: isLoadingUserBookings, refetch: refetchUserBookings } = useQuery({
        queryKey: ['userBookings', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const res = await axiosSecure.get(`/bookings`, {
                params: { email: user.email }
            });
            return res.data.bookings || [];
        },
        enabled: !!user?.email,
        staleTime: 0,
    });


    const userRating = userRatingData?.userRating || 0;

    // --- TanStack Query for submitting trainer ratings ---
    const rateTrainerMutation = useMutation({
        mutationFn: async ({ trainerId, rating }) => {
            const res = await axiosSecure.post(
                `/trainers/rating/${trainerId}`,
                { rating, userEmail: user?.email, userName: user?.displayName, userPhotoURL: user?.photoURL }
            );
            return res.data;
        },
        onSuccess: (data) => {
            if (data?.success) {
                Swal.fire('Thank you!', 'Your rating has been submitted.', 'success');
                queryClient.invalidateQueries({ queryKey: ['trainerDetails', id] });
                queryClient.invalidateQueries({ queryKey: ['userRating', id, user?.email] });
            } else {
                Swal.fire('Notice', data?.message || 'Failed to submit rating.', 'info');
            }
        },
        onError: (err) => {
            console.error('Failed to submit rating:', err);
            // The 409 error is now handled by the backend, so this is for other errors.
            Swal.fire('Error', 'Failed to submit rating.', 'error');
        },
    });

    const handleRatingSubmit = (ratingValue) => {
        if (!user) {
            return Swal.fire('Login Required', 'Please log in to rate the trainer.', 'warning');
        }
        if (user?.email === trainer?.email) {
            return Swal.fire('Action Not Allowed', 'You cannot rate yourself as a trainer.', 'info');
        }

        // Check if the user has already rated this trainer
        if (userRating > 0) {
            Swal.fire({
                title: 'Already Rated',
                text: 'You have already rated this trainer. Do you want to update your rating?',
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, update it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    rateTrainerMutation.mutate({ trainerId: trainer._id, rating: ratingValue });
                }
            });
        } else {
            // First time rating, just submit it
            rateTrainerMutation.mutate({ trainerId: trainer._id, rating: ratingValue });
        }
    };

    // --- Skeleton loader for rating stars ---
    const RatingSkeleton = () => (
        <div className="flex flex-col items-center space-y-2 animate-pulse">
            <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                ))}
            </div>
            <div className="h-4 w-20 rounded bg-gray-300 dark:bg-gray-700"></div>
        </div>
    );

    // --- Skeleton loader for slots ---
    const SlotSkeleton = () => (
        <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 animate-pulse">
                    <div className="flex-1 space-y-2">
                        <div className="h-6 w-40 rounded bg-gray-300 dark:bg-gray-600"></div>
                        <div className="h-4 w-60 rounded bg-gray-300 dark:bg-gray-600"></div>
                    </div>
                    <div className="mt-4 sm:mt-0 h-10 w-24 rounded-lg bg-gray-300 dark:bg-gray-600"></div>
                </div>
            ))}
        </div>
    );

    // Modal component to display all reviews
    const ReviewsModal = ({ reviews, onClose }) => {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-md bg-opacity-70 dark:bg-opacity-80 p-4">
                <motion.div
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto transform scale-100 opacity-100"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", duration: 0.3 }}
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">All Client Reviews</h3>
                        <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        {reviews.map((review, index) => {
                            const validPhoto = review.photoURL && review.photoURL.startsWith('https');
                            const fallbackLetter = review.name?.charAt(0).toUpperCase() || '?';
                            return (
                                <div key={index} className="flex items-start space-x-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                                    {validPhoto ? (
                                        <img
                                            src={review.photoURL}
                                            alt={review.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                                            {fallbackLetter}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-100">{review.name}</p>
                                        </div>
                                        <div className="flex items-center space-x-1 text-yellow-500 dark:text-yellow-400 mb-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <StarIcon
                                                    key={star}
                                                    className={`h-4 w-4 ${star <= review.rating ? 'fill-current text-yellow-400 dark:text-yellow-300' : 'text-gray-300 dark:text-gray-600'}`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Rated on: {new Date(review.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        );
    };


    // Show a full-page loader only when the primary trainer data is being fetched
    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
                <Loader />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Error Loading Trainer</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{error?.message || 'An unexpected error occurred.'}</p>
                    <Link to="/trainers" className="text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-500">
                        Back to Trainers
                    </Link>
                </div>
            </div>
        );
    }

    if (!trainer) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Trainer Not Found</h2>
                    <Link to="/trainers" className="text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-500">
                        Back to Trainers
                    </Link>
                </div>
            </div>
        );
    }

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
        visible: { y: 0, opacity: 1 },
    };

    const isTrainerSelf = user?.email === trainer?.email;

    // Get the first 3 reviews to display initially
    const limitedReviews = trainer.ratings?.slice(0, 3) || [];
    const hasMoreReviews = (trainer.ratings?.length || 0) > 3;

    return (
        <motion.div
            className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <Title>{trainer?.name ? `${trainer.name} | FitFlow` : 'Trainer | FitFlow'}</Title>

            <div className="md:container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Column: Trainer Profile */}
                    <motion.div
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
                        variants={itemVariants}
                    >
                        <motion.div className="text-center" variants={itemVariants}>
                            <motion.img
                                src={trainer.photoURL}
                                alt={trainer.name}
                                className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            />
                            <motion.h1
                                className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2"
                                variants={itemVariants}
                            >
                                {trainer.name}
                            </motion.h1>
                            <motion.p
                                className="text-xl text-orange-600 dark:text-orange-400 font-medium mb-4"
                                variants={itemVariants}
                            >
                                {trainer.specialization}
                            </motion.p>
                            {/* Conditional Rendering for User Rating */}
                            {isLoadingUserRating ? (
                                <RatingSkeleton />
                            ) : (
                                <motion.div
                                    className="flex flex-col items-center space-y-2"
                                    variants={itemVariants}
                                >
                                    <div className="flex items-center space-x-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <motion.div
                                                key={star}
                                                whileHover={{ scale: isTrainerSelf ? 1 : 1.2 }}
                                                whileTap={{ scale: isTrainerSelf ? 1 : 0.9 }}
                                            >
                                                <StarIcon
                                                    className={`h-6 w-6 transition-colors duration-200 ${star <= userRating
                                                        ? 'text-yellow-400 fill-yellow-400 dark:text-yellow-300 dark:fill-yellow-300'
                                                        : 'text-gray-300 dark:text-gray-600'
                                                        } ${isTrainerSelf ? 'cursor-not-allowed' : 'cursor-pointer'
                                                        }`}
                                                    onClick={() => !rateTrainerMutation.isPending && !isTrainerSelf && handleRatingSubmit(star)}
                                                    title={isTrainerSelf ? "You cannot rate yourself" : `${star} star${star > 1 ? 's' : ''}`}
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Average Rating:{' '}
                                        <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                                            {trainer.rating?.toFixed(1) || 'N/A'}
                                        </span>
                                    </p>
                                </motion.div>
                            )}

                            <motion.div
                                className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-300 mt-4"
                                variants={itemVariants}
                            >
                                <div className="flex items-center space-x-1 bg-gray-700 px-2 py-2 rounded-lg">
                                    <Calendar className="h-4 w-4" />
                                    <span>{trainer.experience || 'N/A'} Years Exp.</span>
                                </div>
                                <div className="flex items-center space-x-1 bg-gray-700 px-2 py-2 rounded-lg">
                                    <Clock className="h-4 w-4" />
                                    <span>Age: {trainer.age || 'N/A'}</span>
                                </div>
                                <div className="flex items-center space-x-1 bg-gray-700 px-2 py-2 rounded-lg">
                                    <Award className="h-4 w-4" />
                                    <span>{trainer.sessions || 0}+ Sessions</span>
                                </div>
                            </motion.div>

                        </motion.div>

                        <div className="space-y-6 mt-8">
                            <motion.div variants={itemVariants}>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">About</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{trainer.description || 'No bio available.'}</p>
                            </motion.div>

                            {trainer.certifications && trainer.certifications.length > 0 && (
                                <motion.div variants={itemVariants}>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Certifications</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {trainer.certifications.map((cert, index) => (
                                            <motion.span
                                                key={index}
                                                className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 px-3 py-1 rounded-full text-sm"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {cert}
                                            </motion.span>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {trainer.availableDays && trainer.availableDays.length > 0 && (
                                <motion.div variants={itemVariants}>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Available Days</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {trainer.availableDays.map((day, index) => (
                                            <motion.span
                                                key={index}
                                                className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {day}
                                            </motion.span>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Client Reviews Section */}
                            {trainer.ratings && trainer.ratings.length > 0 && (
                                <motion.div variants={itemVariants}>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Client Reviews</h3>
                                    <div className="space-y-4">
                                        {limitedReviews.map((review, index) => {
                                            const validPhoto = review.photoURL && review.photoURL.startsWith('https');
                                            const fallbackLetter = review.name?.charAt(0).toUpperCase() || '?';

                                            return (
                                                <motion.div
                                                    key={index}
                                                    className="flex items-start space-x-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                >
                                                    {validPhoto ? (
                                                        <img
                                                            src={review.photoURL}
                                                            alt={review.name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg transform hover:scale-105 transition-transform duration-200 ease-in-out">
                                                            {fallbackLetter}
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <div>
                                                            <p className="font-semibold text-gray-800 dark:text-gray-100">{review.name}</p>
                                                        </div>
                                                        <div className="flex items-center space-x-1 text-yellow-500 dark:text-yellow-400 mb-1">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <StarIcon
                                                                    key={star}
                                                                    className={`h-4 w-4 ${star <= review.rating ? 'fill-current text-yellow-400 dark:text-yellow-300' : 'text-gray-300 dark:text-gray-600'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            Rated on: {new Date(review.date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                    {hasMoreReviews && (
                                        <div className="text-center mt-6">
                                            <motion.button
                                                onClick={() => setShowAllReviews(true)}
                                                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-6 py-2 rounded-full font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                View All Reviews ({trainer.ratings.length})
                                            </motion.button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* Right Column: Available Slots */}
                    <motion.section
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8 max-w-4xl w-full mx-auto"
                        variants={itemVariants}
                    >
                        <motion.h2
                            className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center sm:text-left"
                            variants={itemVariants}
                        >
                            Available Slots
                        </motion.h2>

                        {/* Conditional Rendering for Slots */}
                        {isLoadingUserBookings ? (
                            <SlotSkeleton />
                        ) : (
                            <motion.div className="space-y-4" variants={containerVariants}>
                                {trainer.slots && trainer.slots.length > 0 ? (
                                    trainer.slots.map((slot, index) => {
                                        const isAlreadyBookedByUser = userBookings.some(
                                            (booking) => booking.trainerId === trainer._id && booking.slotId === slot.id
                                        );
                                        const isSlotFull = slot.bookingCount >= slot.maxParticipants;

                                        const isDisabled = isTrainerSelf || isAlreadyBookedByUser || isSlotFull;

                                        return (
                                            <motion.div
                                                key={index}
                                                className={`border rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between transition-colors duration-200 ${isDisabled
                                                    ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 cursor-not-allowed'
                                                    : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 hover:bg-blue-100 dark:hover:bg-blue-950/40 cursor-pointer'
                                                    }`}
                                                initial={{ x: -100, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{ scale: isDisabled ? 1 : 1.02 }}
                                            >
                                                <div className="flex flex-col flex-1">
                                                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-lg sm:text-xl mb-2 sm:mb-0">
                                                        {slot.slotName}
                                                    </h3>

                                                    {/* Details Row 1: Time, Duration, and Day */}
                                                    <div className="flex flex-wrap gap-4 text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                                                        <div className="flex items-center space-x-1">
                                                            <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                                            <span>{slot.slotTime}</span>
                                                        </div>

                                                        {slot.duration && (
                                                            <div className="flex items-center space-x-1">
                                                                <Hourglass className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                                                <span>{slot.duration}</span>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center space-x-1">
                                                            <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                                            <span>{slot.days}</span>
                                                        </div>
                                                    </div>

                                                    {/* Details Row 2: Participants - only if it's a group slot */}
                                                    {slot.maxParticipants > 1 && (
                                                        <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 text-sm sm:text-base mt-2">
                                                            <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                                            <span>{slot.bookingCount || 0}/{slot.maxParticipants} Participants</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-4 sm:mt-0">
                                                    {isTrainerSelf ? (
                                                        <span className="bg-purple-500 dark:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm sm:text-base select-none inline-block text-center min-w-[96px]">
                                                            Your Slot
                                                        </span>
                                                    ) : isAlreadyBookedByUser ? (
                                                        <span className="bg-yellow-500 dark:bg-yellow-700 text-white px-5 py-2 rounded-lg text-sm sm:text-base select-none inline-block text-center min-w-[96px]">
                                                            Booked by You
                                                        </span>
                                                    ) : isSlotFull ? (
                                                        <span className="bg-red-500 dark:bg-red-700 text-white px-5 py-2 rounded-lg text-sm sm:text-base select-none inline-block text-center min-w-[96px]">
                                                            Full
                                                        </span>
                                                    ) : (
                                                        <Link
                                                            to={`/book-trainer/${trainer._id}/${slot.id}`}
                                                            className="inline-block bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 text-white px-5 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors duration-200 min-w-[96px] text-center"
                                                            onClick={(e) => {
                                                                if (!user) {
                                                                    e.preventDefault();
                                                                    Swal.fire("Login Required", "Please log in to book a slot.", "warning");
                                                                    navigate('/login');
                                                                }
                                                            }}
                                                        >
                                                            Book Now
                                                        </Link>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                ) : (
                                    <motion.p variants={itemVariants} className="text-center text-gray-600 dark:text-gray-300 text-lg py-8">
                                        No slots available at the moment.
                                    </motion.p>
                                )}
                            </motion.div>
                        )}
                    </motion.section>
                </div>
                {(user?.role === 'member' || !user) && (
                    <motion.section
                        className="mt-16 bg-gradient-to-r from-blue-700 to-orange-600 dark:from-blue-950 dark:to-orange-950 rounded-xl p-8 text-white text-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold mb-4">Want to Become a Trainer?</h2>
                        <p className="text-xl mb-6 text-blue-100 dark:text-blue-200">
                            Join our team of expert trainers and help others achieve their fitness goals
                            {user?.role === 'member' ? ' while earning extra income.' : '.'}
                        </p>

                        <div className="space-x-4">
                            {!user && (
                                <>
                                    <Link
                                        to="/register"
                                        className="bg-white dark:bg-gray-200 text-blue-700 dark:text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-300 transition-colors duration-200 inline-block"
                                    >
                                        Sign Up First
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="bg-blue-800 dark:bg-blue-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900 dark:hover:bg-blue-950 transition-colors duration-200 inline-block border border-white/30"
                                    >
                                        Login
                                    </Link>
                                </>
                            )}
                            {user?.role === 'member' && (
                                <Link
                                    to="/be-trainer"
                                    className="bg-white dark:bg-gray-200 text-blue-700 dark:text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-300 transition-colors duration-200 inline-block"
                                >
                                    Become a Trainer
                                </Link>
                            )}
                        </div>
                    </motion.section>
                )}
            </div>
            {showAllReviews && (
                <ReviewsModal
                    reviews={trainer.ratings}
                    onClose={() => setShowAllReviews(false)}
                />
            )}
        </motion.div>
    );
};

export default TrainerDetail;
