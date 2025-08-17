import React, { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../Provider/UseAxiosSecure';
import { motion } from 'framer-motion';
import { Users, Award, AlertCircle, Loader, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router';

const FeaturedClasses = () => {
    const axiosSecure = useAxiosSecure();

    const categories = [
        { id: 'HIIT', name: 'HIIT' },
        { id: 'Yoga', name: 'Yoga & Mindfulness' },
        { id: 'Strength', name: 'Strength Training' },
        { id: 'Cardio', name: 'Cardio' },
        { id: 'Pilates', name: 'Pilates' },
        { id: 'Dance', name: 'Dance Fitness' },
        { id: 'Boxing', name: 'Boxing' },
        { id: 'CrossFit', name: 'CrossFit' },
        { id: 'Meditation', name: 'Meditation' },
        { id: 'Nutrition', name: 'Nutrition Coaching' }
    ];

    // Fetch the classes data
    const { data: classesData = [], isLoading: classesLoading, isError: classesError } = useQuery({
        queryKey: ['featuredClasses'],
        queryFn: async () => {
            const res = await axiosSecure.get('/classes');
            return res.data.map(cls => ({ ...cls, _id: cls._id || cls.id }));
        },
        staleTime: 5 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    // Fetch the trainers data
    const { data: allTrainers = [], isLoading: trainersLoading, isError: trainersError } = useQuery({
        queryKey: ['allTrainers'],
        queryFn: async () => {
            const res = await axiosSecure.get('/trainers');
            return res.data.map(trainer => ({ ...trainer, _id: trainer._id || trainer.id }));
        },
        staleTime: 5 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    const featuredClasses = useMemo(() => {
        return [...classesData]
            .sort((a, b) => b.bookings - a.bookings)
            .slice(0, 6);
    }, [classesData]);

    const getTrainersForClass = useCallback((classItemTrainers) => {
        if (!classItemTrainers || !Array.isArray(classItemTrainers) || !allTrainers.length) {
            return [];
        }

        const assignedTrainersDetails = classItemTrainers.map(assignedTrainer => {
            const fullTrainer = allTrainers.find(t => t._id === assignedTrainer.id || t.id === assignedTrainer.id);
            if (!fullTrainer) {
                console.warn("Trainer not found for ID:", assignedTrainer.id);
                return null;
            }
            return {
                id: fullTrainer._id,
                name: fullTrainer.name,
                image: fullTrainer.photoURL || fullTrainer.image,
            };
        }).filter(Boolean);

        return assignedTrainersDetails.slice(0, 5);
    }, [allTrainers]);

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut",
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 50, scale: 0.9 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
        hover: { scale: 1.03, boxShadow: '0 15px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.08)' }
    };

    const imageVariants = {
        hover: { scale: 1.08, transition: { duration: 0.3 } }
    };

    const trainerImageVariants = {
        hover: { scale: 1.15, boxShadow: '0 0 0 2px #fff, 0 0 0 4px #2563eb' }
    };

    const isLoading = classesLoading || trainersLoading;
    const isError = classesError || trainersError;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[300px] dark:bg-gray-900">
                <Loader className="animate-spin h-10 w-10 text-gray-600 dark:text-gray-400" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-[300px] flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12">
                <div className="text-center text-red-600 dark:text-red-400">
                    <AlertCircle className="h-16 w-16 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Error Loading Featured Classes</h2>
                    <p>There was an issue fetching featured classes. Please try again later.</p>
                </div>
            </div>
        );
    }

    if (featuredClasses.length === 0) {
        return (
            <div className="min-h-[300px] flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12">
                <div className="text-center text-gray-600 dark:text-gray-400">
                    <AlertCircle className="h-16 w-16 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">No Featured Classes Available</h2>
                    <p>It looks like there are no classes to feature at the moment.</p>
                </div>
            </div>
        );
    }

    return (
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
            <div className="md:container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                        Our Most Popular Classes
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Join the classes everyone is talking about! These are our top-booked sessions.
                    </p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {featuredClasses.map((classItem, index) => (
                        <motion.div
                            key={classItem._id}
                            variants={cardVariants}
                            custom={index}
                            whileHover="hover"
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-xl dark:shadow-gray-950/20 overflow-hidden transition-all duration-300 group"
                        >
                            <div className="relative">
                                <motion.img
                                    src={classItem.image}
                                    alt={classItem.name}
                                    className="w-full h-60 object-cover transition-transform duration-300"
                                    variants={imageVariants}
                                />

                                <div className="absolute top-4 right-4 bg-orange-600 dark:bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                                    <Award className="h-3 w-3" />
                                    <span>{categories.find(cat => cat.id === classItem.category)?.name || classItem.category}</span>
                                </div>

                                <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                                    <TrendingUp className="h-3 w-3" />
                                    <span>#{index + 1}</span>
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{classItem.name}</h3>

                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trainers:</h4>
                                    <div className="flex -space-x-2">
                                        {getTrainersForClass(classItem.trainers).map((trainer, tIndex) => (
                                            <Link
                                                key={trainer.id || tIndex}
                                                to={`/trainer/${trainer.id}`}
                                                className="relative"
                                            >
                                                <motion.img
                                                    src={trainer.image}
                                                    alt={trainer.name}
                                                    className="w-8 h-8 rounded-full border-2 object-cover border-white dark:border-gray-800"
                                                    title={trainer.name}
                                                    variants={trainerImageVariants}
                                                    whileHover="hover"
                                                    onError={(e) => {
                                                        e.target.src = "https://via.placeholder.com/40?text=No+Img";
                                                    }}
                                                />
                                            </Link>
                                        ))}
                                        {classItem.trainers?.length > 5 && (
                                            <span className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-400">
                                                +{classItem.trainers.length - 5}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed line-clamp-3">
                                    {classItem.description}
                                </p>

                                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    <div className="flex items-center space-x-1">
                                        <Users className="h-4 w-4" />
                                        <span>{classItem.bookings} joined</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{classItem.duration}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default FeaturedClasses;