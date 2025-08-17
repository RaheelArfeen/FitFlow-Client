import React from 'react';
import { Star, Calendar, Award } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../Provider/UseAxiosSecure';
import { Link } from 'react-router';
import { motion } from 'framer-motion';

const TeamSection = () => {
    const axiosSecure = useAxiosSecure();

    const { data: trainers, isLoading, isError, error } = useQuery({
        queryKey: ['trainers'],
        queryFn: async () => {
            const response = await axiosSecure.get('/trainers?status=accepted');
            return response.data;
        },
    });

    if (isLoading) {
        return (
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="md:container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-xl text-gray-600 dark:text-gray-400">Loading trainers...</p>
                </div>
            </section>
        );
    }

    if (isError) {
        return (
            <section className="py-20 bg-white dark:bg-gray-900">
                <div className="md:container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-xl text-red-600 dark:text-red-400">Error loading trainers: {error.message}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 bg-white dark:bg-gray-900">
            <div className="md:container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                        Meet Our Expert Trainers
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        Work with certified professionals who are passionate about helping you achieve your fitness goals.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {trainers.slice(0, 6).map((trainer, index) => (
                        <motion.article
                            key={trainer.email}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div className="relative">
                                <img
                                    src={trainer.photoURL || 'https://via.placeholder.com/400'}
                                    alt={trainer.name || 'Trainer Profile'}
                                    className="w-full h-64 object-cover"
                                />
                                <div className="absolute top-4 right-4 flex items-center bg-white/90 dark:bg-gray-800/90 px-2 py-1 rounded-full">
                                    <Star className="h-4 w-4 text-yellow-400" />
                                    <span className="ml-1 text-sm font-medium text-gray-800 dark:text-gray-200">{trainer.rating?.toFixed(1) || 'N/A'}</span>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <div className="mb-4">
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-1">{trainer.name}</h3>
                                    <p className="text-orange-600 dark:text-orange-400 font-medium">{trainer.specialization || '-'}</p>
                                </div>

                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed flex-grow">
                                    {trainer.description && trainer.description.length > 80
                                        ? trainer.description.slice(0, 80) + '...'
                                        : trainer.description || 'No description available.'}
                                </p>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        <span>{trainer.experience} years experience</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <Award className="h-4 w-4 mr-2" />
                                        <span>{trainer.sessions || 0}+ sessions completed</span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Available Slots:</div>
                                    <div className="flex flex-wrap gap-2">
                                        {trainer.slots && trainer.slots.length > 0 ? (
                                            <>
                                                {trainer.slots.slice(0, 2).map((slot, index) => (
                                                    <span
                                                        key={index}
                                                        className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs mr-1"
                                                    >
                                                        {`${slot.days}, ${slot.slotTime}`}
                                                    </span>
                                                ))}
                                                {trainer.slots.length > 2 && (
                                                    <span className="text-gray-500 text-xs">...</span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-gray-400 dark:text-gray-500 text-xs italic">
                                                No slots available
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <motion.div whileHover={{ scale: 1.05 }} className="mt-auto text-right">
                                    <Link
                                        to={`/trainer/${trainer._id}`}
                                        className="bg-blue-700 dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                                    >
                                        Know More
                                    </Link>
                                </motion.div>
                            </div>
                        </motion.article>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <button className="bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200">
                        View All Trainers
                    </button>
                </div>
            </div>
        </section>
    );
};

export default TeamSection;