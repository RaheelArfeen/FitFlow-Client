import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router';
import { Star, Calendar, Award, Instagram, Twitter, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthContext } from '../../Provider/AuthProvider';
import useAxiosSecure from '../../Provider/UseAxiosSecure';
import Loader from '../Loader';
import { useQuery } from '@tanstack/react-query'; 

const Trainers = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();

    // --- TanStack Query for fetching trainers ---
    const { data: trainers, isLoading, isError, error } = useQuery({
        queryKey: ['trainers'], // Unique key for this query
        queryFn: async () => {
            const res = await axiosSecure.get('/trainers?status=accepted');
            return res.data;
        },
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 30,
        onError: (err) => {
            console.error('Error fetching trainers:', err);
        },
    });

    useEffect(() => {
        // Scroll to top on component mount
        const timer = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <Loader />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <p className="text-red-600 text-lg">Failed to load trainers: {error.message}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="md:container mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <motion.header
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: -40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Our Expert Trainers
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Meet our certified fitness professionals who are passionate about helping you achieve your goals.
                    </p>
                </motion.header>

                {/* Trainers Grid or Fallback Message */}
                <motion.section
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    aria-label="Trainers List"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: {},
                        visible: {
                            transition: {
                                staggerChildren: 0.15
                            }
                        }
                    }}
                >
                    {trainers && trainers.length > 0 ? (
                        trainers.map((trainer, index) => (
                            <motion.article
                                key={trainer._id}
                                className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <div className="relative">
                                    <img
                                        src={trainer.photoURL}
                                        alt={trainer.name || 'Trainer Profile'}
                                        className="w-full h-64 object-cover"
                                    />
                                    <div className="absolute top-4 right-4 flex items-center bg-white/90 px-2 py-1 rounded-full">
                                        <Star className="h-4 w-4 text-yellow-400" />
                                        <span className="ml-1 text-sm font-medium">{trainer.rating?.toFixed(1) || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="mb-4">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-1">{trainer.name}</h3>
                                        <p className="text-orange-600 font-medium">{trainer.specialization || '-'}</p>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-4 leading-relaxed flex-grow">
                                        {trainer.description && trainer.description.length > 80
                                            ? trainer.description.slice(0, 80) + '...'
                                            : trainer.description || 'No description available.'}
                                    </p>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            <span>{trainer.experience || 'N/A'} experience</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Award className="h-4 w-4 mr-2" />
                                            <span>{trainer.sessions || 0}+ sessions completed</span>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <div className="text-sm text-gray-600 mb-2">Available Slots:</div>
                                        <div className="flex flex-wrap gap-2">
                                            {(trainer.availableSlots && trainer.availableSlots.length > 0)
                                                ? trainer.availableSlots.map((slot) => (
                                                    <span
                                                        key={slot}
                                                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                                                    >
                                                        {slot}
                                                    </span>
                                                ))
                                                : <span className="text-gray-400 text-xs italic">No slots available</span>
                                            }
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex space-x-3">
                                            <motion.div whileHover={{ scale: 1.2 }}>
                                                {trainer.social?.instagram ? (
                                                    <a
                                                        href={`${trainer.social.instagram.startsWith('http') ? '' : 'https://'}${trainer.social.instagram.replace('@', '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Instagram className="h-5 w-5 text-gray-400 hover:text-pink-500 transition-colors duration-200" />
                                                    </a>
                                                ) : (
                                                    <Instagram className="h-5 w-5 text-gray-300 cursor-not-allowed" />
                                                )}
                                            </motion.div>

                                            <motion.div whileHover={{ scale: 1.2 }}>
                                                {trainer.social?.twitter ? (
                                                    <a
                                                        href={`${trainer.social.twitter.startsWith('http') ? '' : 'https://'}${trainer.social.twitter.replace('@', '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Twitter className="h-5 w-5 text-gray-400 hover:text-blue-400 transition-colors duration-200" />
                                                    </a>
                                                ) : (
                                                    <Twitter className="h-5 w-5 text-gray-300 cursor-not-allowed" />
                                                )}
                                            </motion.div>

                                            <motion.div whileHover={{ scale: 1.2 }}>
                                                {trainer.social?.linkedin ? (
                                                    <a
                                                        href={`${trainer.social.linkedin.startsWith('http') ? '' : 'https://'}${trainer.social.linkedin}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Linkedin className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors duration-200" />
                                                    </a>
                                                ) : (
                                                    <Linkedin className="h-5 w-5 text-gray-300 cursor-not-allowed" />
                                                )}
                                            </motion.div>
                                        </div>

                                        <motion.div whileHover={{ scale: 1.05 }}>
                                            <Link
                                                to={`/trainer/${trainer._id}`}
                                                className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                                            >
                                                Know More
                                            </Link>
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.article>
                        ))
                    ) : (
                        <motion.div
                            className="col-span-full flex flex-col items-center justify-center text-center py-20 bg-white rounded-xl shadow-inner border border-gray-200"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                                <Award className="text-blue-500 w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                                No Trainers Found
                            </h2>
                            <p className="text-gray-600 max-w-md">
                                We currently have no trainers available. But don’t worry — our team is working on bringing top experts onboard.
                            </p>

                            {(user?.role === 'member' || !user) && (
                                <div className="mt-6">
                                    <Link
                                        to={user ? "/be-trainer" : "/register"}
                                        className="inline-block bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors duration-200"
                                    >
                                        {user ? "Become a Trainer" : "Join as a Trainer"}
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    )}
                </motion.section>

                {/* Become a Trainer CTA */}
                {(user?.role === 'member' || !user) && (
                    <motion.section
                        className="mt-16 bg-gradient-to-r from-blue-700 to-orange-600 rounded-xl p-8 text-white text-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold mb-4">Want to Become a Trainer?</h2>
                        <p className="text-xl mb-6 text-blue-100">
                            Join our team of expert trainers and help others achieve their fitness goals
                            {user?.role === 'member' ? ' while earning extra income.' : '.'}
                        </p>

                        <div className="space-x-4">
                            {!user && (
                                <>
                                    <Link
                                        to="/register"
                                        className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 inline-block"
                                    >
                                        Sign Up First
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors duration-200 inline-block border border-white/30"
                                    >
                                        Login
                                    </Link>
                                </>
                            )}
                            {user?.role === 'member' && (
                                <Link
                                    to="/be-trainer"
                                    className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 inline-block"
                                >
                                    Become a Trainer
                                </Link>
                            )}
                        </div>
                    </motion.section>
                )}
            </div>
        </div>
    );
};

export default Trainers;