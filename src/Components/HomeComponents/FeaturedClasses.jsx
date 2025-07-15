import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../Provider/UseAxiosSecure';
import { motion } from 'framer-motion';
import { Users, Award, AlertCircle, Loader, Clock } from 'lucide-react';
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

    const { data: classesData = [], isLoading, isError } = useQuery({
        queryKey: ['featuredClasses'],
        queryFn: async () => {
            const res = await axiosSecure.get('/classes');
            return res.data.map(cls => ({ ...cls, _id: cls._id || cls.id }));
        },
        staleTime: 5 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    const featuredClasses = React.useMemo(() => {
        return [...classesData]
            .sort((a, b) => b.bookings - a.bookings)
            .slice(0, 6);
    }, [classesData]);

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

    if (isLoading) {
        return <Loader />;
    }

    if (isError) {
        return (
            <div className="min-h-[300px] flex items-center justify-center bg-gray-50 py-12">
                <div className="text-center text-red-600">
                    <AlertCircle className="h-16 w-16 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Error Loading Featured Classes</h2>
                    <p>There was an issue fetching featured classes. Please try again later.</p>
                </div>
            </div>
        );
    }

    if (featuredClasses.length === 0) {
        return (
            <div className="min-h-[300px] flex items-center justify-center bg-gray-50 py-12">
                <div className="text-center text-gray-600">
                    <AlertCircle className="h-16 w-16 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">No Featured Classes Available</h2>
                    <p>It looks like there are no classes to feature at the moment.</p>
                </div>
            </div>
        );
    }

    return (
        <section className="py-16 bg-gray-50">
            <div className="md:container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
                        Our Most Popular Classes
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Join the classes everyone is talking about! These are our top-booked sessions.
                    </p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {featuredClasses.map((classItem) => (
                        <motion.div
                            key={classItem._id}
                            variants={cardVariants}
                            whileHover="hover"
                            className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transition-all duration-300"
                        >
                            <div className="relative overflow-hidden">
                                <motion.img
                                    src={classItem.image}
                                    alt={classItem.name}
                                    className="w-full h-56 object-cover transition-transform duration-300"
                                    variants={imageVariants}
                                />
                                <div className="absolute top-4 right-4 bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                                    <Award className="h-3 w-3" />
                                    <span>{categories.find(cat => cat.id === classItem.category)?.name || classItem.category}</span>
                                </div>
                            </div>
                            <div className="p-6 flex-grow flex flex-col">
                                <h3 className="text-2xl font-bold text-gray-800 mb-3">{classItem.name}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4 flex-grow">
                                    {classItem.description}
                                </p>
                                <div className="flex items-center justify-between space-x-4 text-gray-500 text-sm mb-5">
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
