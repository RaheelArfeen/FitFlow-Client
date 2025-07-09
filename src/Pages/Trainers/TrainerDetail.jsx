import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router'; 
import { motion } from 'framer-motion'; 
import {
    Star as StarIcon,
    Calendar,
    Award,
    Instagram,
    Twitter,
    Linkedin,
    Clock,
    MapPin,
} from 'lucide-react';
import useAxiosSecure from '../../Provider/UseAxiosSecure';
import Loader from '../Loader';
import Swal from 'sweetalert2';
import { AuthContext } from '../../Provider/AuthProvider';

const TrainerDetail = () => {
    const { id } = useParams();
    const axiosSecure = useAxiosSecure();
    const { user } = useContext(AuthContext);

    const [trainer, setTrainer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRating, setUserRating] = useState(0);
    const [submittingRating, setSubmittingRating] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        setLoading(true);

        const fetchAllData = async () => {
            try {
                const trainerRes = await axiosSecure.get(`/trainers/${id}`);
                setTrainer(trainerRes.data);

                if (user?.email) {
                    const ratingRes = await axiosSecure.get(`/trainers/rating/${id}`, { withCredentials: true });
                    setUserRating(ratingRes.data?.userRating || 0);
                } else {
                    setUserRating(0);
                }
            } catch (err) {
                console.error("Failed to fetch trainer or rating data:", err);
                setTrainer(null);
                setUserRating(0);
            }
        };

        fetchAllData().finally(() => {
            setTimeout(() => {
                setLoading(false);
            }, 1500);
        });
    }, [id, axiosSecure, user]);

    const handleRatingSubmit = async (ratingValue) => {
        if (!user) {
            return Swal.fire("Login Required", "Please log in to rate the trainer.", "warning");
        }

        try {
            setSubmittingRating(true);

            const res = await axiosSecure.post(
                `/trainers/rating/${trainer._id}`,
                { rating: ratingValue },
                { withCredentials: true }
            );

            if (res.data?.success) {
                Swal.fire("Thank you!", "Your rating has been submitted.", "success");
                setUserRating(ratingValue);

                const refreshed = await axiosSecure.get(`/trainers/${trainer._id}`);
                setTrainer(refreshed.data);
            } else {
                Swal.fire("Notice", res.data?.message || "Rating already submitted.", "info");
            }
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to submit rating.", "error");
        } finally {
            setSubmittingRating(false);
        }
    };

    if (loading) {
        return (
            <div>
                <Loader />
            </div>
        );
    }

    if (!trainer) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Trainer Not Found</h2>
                    <Link to="/trainers" className="text-blue-700 hover:text-blue-800">
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

    return (
        <motion.div
            className="min-h-screen bg-gray-50 py-12"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="md:container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <motion.div
                        className="bg-white rounded-xl shadow-lg p-8"
                        variants={itemVariants}
                    >
                        <motion.div className="text-center" variants={itemVariants}>
                            <motion.img
                                src={trainer.image}
                                alt={trainer.name}
                                className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            />
                            <motion.h1
                                className="text-3xl font-bold text-gray-800 mb-2"
                                variants={itemVariants}
                            >
                                {trainer.name}
                            </motion.h1>
                            <motion.p
                                className="text-xl text-orange-600 font-medium mb-4"
                                variants={itemVariants}
                            >
                                {trainer.specialization}
                            </motion.p>
                            <motion.div
                                className="flex flex-col items-center space-y-2"
                                variants={itemVariants}
                            >
                                <div className="flex items-center space-x-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <motion.div
                                            key={star}
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <StarIcon
                                                className={`h-6 w-6 cursor-pointer transition-colors duration-200 ${star <= userRating
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-gray-300'
                                                    }`}
                                                onClick={() => !submittingRating && handleRatingSubmit(star)}
                                                title={`${star} star${star > 1 ? 's' : ''}`}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-600">
                                    Average Rating:{' '}
                                    <span className="font-semibold text-yellow-600">
                                        {trainer.rating?.toFixed(1) || 'N/A'}
                                    </span>
                                </p>
                            </motion.div>

                            <motion.div
                                className="flex items-center justify-center space-x-4 text-sm text-gray-600 mt-4"
                                variants={itemVariants}
                            >
                                <div className="flex items-center space-x-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{trainer.experience || 'N/A'}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Award className="h-4 w-4" />
                                    <span>{trainer.sessions || 0}+ Sessions</span>
                                </div>
                            </motion.div>
                        </motion.div>

                        <div className="space-y-6 mt-8">
                            <motion.div variants={itemVariants}>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">About</h3>
                                <p className="text-gray-600 leading-relaxed">{trainer.bio || 'No bio available.'}</p>
                            </motion.div>

                            {trainer.certifications && trainer.certifications.length > 0 && (
                                <motion.div variants={itemVariants}>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Certifications</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {trainer.certifications.map((cert, index) => (
                                            <motion.span
                                                key={index}
                                                className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
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
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Available Days</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {trainer.availableDays.map((day, index) => (
                                            <motion.span
                                                key={index}
                                                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {day}
                                            </motion.span>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            <motion.div variants={itemVariants}>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Connect</h3>
                                <div className="flex space-x-4">
                                    {trainer.social?.instagram ? (
                                        <motion.a
                                            href={`https://instagram.com/${trainer.social.instagram.replace('@', '')}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            whileHover={{ y: -3 }}
                                            whileTap={{ y: 0 }}
                                        >
                                            <Instagram className="h-6 w-6 text-gray-400 hover:text-pink-500 transition-colors duration-200" />
                                        </motion.a>
                                    ) : <Instagram className="h-6 w-6 text-gray-300" />}

                                    {trainer.social?.twitter ? (
                                        <motion.a
                                            href={`https://twitter.com/${trainer.social.twitter.replace('@', '')}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            whileHover={{ y: -3 }}
                                            whileTap={{ y: 0 }}
                                        >
                                            <Twitter className="h-6 w-6 text-gray-400 hover:text-blue-400 transition-colors duration-200" />
                                        </motion.a>
                                    ) : <Twitter className="h-6 w-6 text-gray-300" />}

                                    {trainer.social?.linkedin ? (
                                        <motion.a
                                            href={`https://linkedin.com/in/${trainer.social.linkedin}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            whileHover={{ y: -3 }}
                                            whileTap={{ y: 0 }}
                                        >
                                            <Linkedin className="h-6 w-6 text-gray-400 hover:text-blue-600 transition-colors duration-200" />
                                        </motion.a>
                                    ) : <Linkedin className="h-6 w-6 text-gray-300" />}
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.section
                        className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-4xl w-full mx-auto"
                        variants={itemVariants}
                    >
                        <motion.h2
                            className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 text-center sm:text-left"
                            variants={itemVariants}
                        >
                            Available Slots
                        </motion.h2>

                        <motion.div className="space-y-4" variants={containerVariants}>
                            {trainer.slots && trainer.slots.length > 0 ? (
                                trainer.slots.map((slot, index) => (
                                    <motion.div
                                        key={index}
                                        className={`border rounded-lg p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between transition-colors duration-200 ${slot.isBooked
                                            ? 'bg-gray-50 border-gray-200'
                                            : 'bg-blue-50 border-blue-200 hover:bg-blue-100 cursor-pointer'
                                            }`}
                                        initial={{ x: -100, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <div className="flex flex-col flex-1">
                                            <h3 className="font-semibold text-gray-800 text-lg sm:text-xl mb-2 sm:mb-0">
                                                {slot.name}
                                            </h3>

                                            <div className="flex flex-wrap gap-4 text-gray-600 text-sm sm:text-base">
                                                <div className="flex items-center space-x-1">
                                                    <Clock className="h-5 w-5 text-gray-500" />
                                                    <span>{slot.time}</span>
                                                </div>

                                                <div className="flex items-center space-x-1">
                                                    <MapPin className="h-5 w-5 text-gray-500" />
                                                    <span>{slot.day}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 sm:mt-0">
                                            {slot.isBooked ? (
                                                <span className="bg-gray-500 text-white px-5 py-2 rounded-lg text-sm sm:text-base select-none inline-block text-center min-w-[96px]">
                                                    Booked
                                                </span>
                                            ) : (
                                                <Link
                                                    to={`/book-trainer/${trainer._id}/${slot.id}`}
                                                    className="inline-block bg-blue-700 hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 text-white px-5 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors duration-200 min-w-[96px] text-center"
                                                    tabIndex={0}
                                                    aria-label={`Book slot ${slot.name} at ${slot.time} on ${slot.day}`}
                                                >
                                                    Book Now
                                                </Link>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <p className="text-center text-sm text-gray-400 italic">No slots available</p>
                            )}
                        </motion.div>
                    </motion.section>
                </div>

                {user.role !== 'trainer' && (
                    <motion.div
                        className="mt-12 bg-gradient-to-r from-blue-700 to-orange-600 rounded-xl p-8 text-white text-center"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <h2 className="text-3xl font-bold mb-4">Want to Become a Trainer?</h2>
                        <p className="text-xl mb-6 text-blue-100">
                            Join our team of expert trainers and help others achieve their fitness goals.
                        </p>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link
                                to="/be-trainer"
                                className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 inline-block"
                            >
                                Become a Trainer
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default TrainerDetail;