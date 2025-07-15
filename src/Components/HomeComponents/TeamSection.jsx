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
            const response = await axiosSecure.get('/trainers');
            return response.data;
        },
    });

    if (isLoading) {
        return (
            <section className="py-20 bg-gray-50">
                <div className="md:container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-xl text-gray-600">Loading trainers...</p>
                </div>
            </section>
        );
    }

    if (isError) {
        return (
            <section className="py-20 bg-gray-50">
                <div className="md:container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <p className="text-xl text-red-600">Error loading trainers: {error.message}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 bg-gray-50">
            <div className="md:container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                        Meet Our Expert Trainers
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Work with certified professionals who are passionate about helping you achieve your fitness goals.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {trainers.map((trainer, index) => (
                        <motion.article
                            key={trainer.email} // Using email as key, assuming it's unique
                            className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div className="relative">
                                <img
                                    src={trainer.photoURL || 'https://via.placeholder.com/400'} // Fallback for photoURL
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
                                        <span>{trainer.experience} years experience</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Award className="h-4 w-4 mr-2" />
                                        <span>{trainer.sessions || 0}+ sessions completed</span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="text-sm text-gray-600 mb-2">Available Slots:</div>
                                    <div className="flex flex-wrap gap-2">
                                        {(trainer.slots && trainer.slots.length > 0)
                                            ? trainer.slots
                                                .filter(slot => !slot.isBooked) // Filter for available (not booked) slots
                                                .map((slot) => (
                                                    <span
                                                        key={slot.id} // Assuming each slot has a unique ID
                                                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                                                    >
                                                        {`${slot.day}, ${slot.timeRange}`}
                                                    </span>
                                                ))
                                            : <span className="text-gray-400 text-xs italic">No slots available</span>
                                        }
                                    </div>
                                </div>

                                <motion.div whileHover={{ scale: 1.05 }} className="mt-auto text-right">
                                    <Link
                                        to={`/trainer/${trainer._id}`}
                                        className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                                    >
                                        Know More
                                    </Link>
                                </motion.div>
                            </div>
                        </motion.article>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200">
                        View All Trainers
                    </button>
                </div>
            </div>
        </section>
    );
};

export default TeamSection;