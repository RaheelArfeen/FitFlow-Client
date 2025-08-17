import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ChartLine, Check, Dumbbell, HeartPulse, Star } from 'lucide-react';
import Loader from '../Loader';
import useAxiosSecure from '../../Provider/UseAxiosSecure';
import { AuthContext } from '../../Provider/AuthProvider';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { Title } from 'react-head';

const membershipPackages = [
    {
        id: 'basic',
        name: 'Basic Membership',
        price: 10,
        features: [
            'Access to gym facilities during regular operating hours',
            'Use of cardio and strength training equipment',
            'Access to locker rooms and showers'
        ]
    },
    {
        id: 'standard',
        name: 'Standard Membership',
        price: 50,
        features: [
            'All benefits of the basic membership',
            'Access to group fitness classes such as yoga, spinning, and Zumba',
            'Use of additional amenities like a sauna or steam room'
        ]
    },
    {
        id: 'premium',
        name: 'Premium Membership',
        price: 100,
        features: [
            'All benefits of the standard membership',
            'Access to personal training sessions with certified trainers',
            'Discounts on additional services such as massage therapy or nutrition counseling'
        ]
    }
];

const BookTrainerPage = () => {
    const { trainerId, slotId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const axiosSecure = useAxiosSecure();

    const [selectedPackage, setSelectedPackage] = useState('');

    const { data: trainer, isLoading, isError, error } = useQuery({
        queryKey: ['trainerDetails', trainerId],
        queryFn: async () => {
            const res = await axiosSecure.get(`/trainers/${trainerId}`);
            return res.data;
        },
        enabled: !!trainerId,
        staleTime: 1000 * 60 * 5,
        onError: (err) => {
            console.error('Error fetching trainer:', err);
            toast.error('Failed to load trainer details.');
        }
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center dark:bg-gray-900">
                <Loader />
            </div>
        );
    }

    if (isError) {
        return (
            <motion.div
                className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center">
                    <motion.h2
                        className="text-2xl font-bold text-red-600 mb-4 dark:text-red-400"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        Error Loading Trainer Details
                    </motion.h2>
                    <p className="text-gray-600 mb-4 dark:text-gray-400">{error?.message || 'An unexpected error occurred.'}</p>
                    <motion.button
                        onClick={() => navigate('/trainers')}
                        className="text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        Back to Trainers
                    </motion.button>
                </div>
            </motion.div>
        );
    }

    const slot = trainer?.slots?.find(s => s.id === slotId);

    if (!trainer || !slot) {
        return (
            <motion.div
                className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center">
                    <motion.h2
                        className="text-2xl font-bold text-gray-800 mb-4 dark:text-gray-200"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        Booking Not Found
                    </motion.h2>
                    <motion.button
                        onClick={() => navigate('/trainers')}
                        className="text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        Back to Trainers
                    </motion.button>
                </div>
            </motion.div>
        );
    }

    const handleJoinNow = () => {
        if (!selectedPackage) {
            toast.error('Please select a membership package');
            return;
        }
        navigate(`/payment/${trainerId}/${slotId}/${selectedPackage}`);
    };

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
            className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <Title>{trainer?.name ? `Book ${trainer.name} | FitFlow` : 'Book Trainer | FitFlow'}</Title>
            <div className="md:container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="bg-white rounded-xl shadow-lg overflow-hidden dark:bg-gray-800 dark:shadow-2xl"
                    variants={itemVariants}
                >
                    {/* Header */}
                    <motion.div
                        className="bg-gradient-to-r from-blue-700 to-orange-600 text-white p-8 dark:from-blue-900 dark:to-orange-800"
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-3xl font-bold mb-2">Book Your Training Session</h1>
                        <p className="text-blue-100">Complete your booking with {trainer.name}</p>
                    </motion.div>

                    <div className="p-8">
                        {/* Booking Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <motion.div variants={itemVariants}>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-gray-200">Session Details</h2>
                                <div className="space-y-3">
                                    <motion.div className="flex gap-2" variants={itemVariants}>
                                        <span className="text-gray-600 dark:text-gray-400">Trainer:</span>
                                        <span className="font-medium dark:text-gray-100">{trainer.name}</span>
                                    </motion.div>
                                    <motion.div className="flex gap-2" variants={itemVariants}>
                                        <span className="text-gray-600 dark:text-gray-400">Specialization:</span>
                                        <span className="font-medium dark:text-gray-100">{trainer.specialization}</span>
                                    </motion.div>
                                    <motion.div className="flex gap-2" variants={itemVariants}>
                                        <span className="text-gray-600 dark:text-gray-400">Selected Slot:</span>
                                        <span className="font-medium dark:text-gray-100">{slot.slotName}</span>
                                    </motion.div>
                                    <motion.div className="flex gap-2" variants={itemVariants}>
                                        <span className="text-gray-600 dark:text-gray-400">Time:</span>
                                        <span className="font-medium dark:text-gray-100">{slot.slotTime}</span>
                                    </motion.div>
                                    <motion.div className="flex gap-2" variants={itemVariants}>
                                        <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                                        <span className="font-medium dark:text-gray-100">{slot.duration}</span>
                                    </motion.div>
                                    <motion.div className="flex gap-2" variants={itemVariants}>
                                        <span className="text-gray-600 dark:text-gray-400">Day:</span>
                                        <span className="font-medium dark:text-gray-100">{slot.days}</span>
                                    </motion.div>
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-gray-200">Classes Included</h2>
                                <ul className="space-y-4">
                                    <motion.li className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950" whileHover={{ scale: 1.03 }}>
                                        <motion.div className="flex-shrink-0">
                                            <Dumbbell size={24} className="text-blue-800 dark:text-blue-400" />
                                        </motion.div>
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-blue-800 dark:text-blue-400">Personal Training</h3>
                                            <p className="text-sm text-blue-600 dark:text-blue-300">Get one-on-one sessions with your trainer.</p>
                                        </div>
                                    </motion.li>
                                    <motion.li className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950" whileHover={{ scale: 1.03 }}>
                                        <motion.div className="flex-shrink-0">
                                            <HeartPulse size={24} className="text-green-800 dark:text-green-400" />
                                        </motion.div>
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-green-800 dark:text-green-400">Cardio & Strength</h3>
                                            <p className="text-sm text-green-600 dark:text-green-300">Access to all cardio and strength equipment.</p>
                                        </div>
                                    </motion.li>
                                    <motion.li className="flex items-center gap-3 p-4 rounded-lg bg-orange-50 dark:bg-orange-950" whileHover={{ scale: 1.03 }}>
                                        <motion.div className="flex-shrink-0">
                                            <ChartLine size={24} className="text-orange-800 dark:text-orange-400" />
                                        </motion.div>
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-orange-800 dark:text-orange-400">Progress Tracking</h3>
                                            <p className="text-sm text-orange-600 dark:text-orange-300">Monitor your fitness journey and results.</p>
                                        </div>
                                    </motion.li>
                                    {trainer?.specialization && (
                                        <motion.li className="flex items-center gap-3 p-4 rounded-lg bg-purple-50 dark:bg-purple-950" whileHover={{ scale: 1.03 }}>
                                            <motion.div className="flex-shrink-0">
                                                <Star size={24} className="text-purple-800 dark:text-purple-400" />
                                            </motion.div>
                                            <div className="flex-grow">
                                                <h3 className="font-semibold text-purple-800 dark:text-purple-400">Specialization: {trainer.specialization}</h3>
                                                <p className="text-sm text-purple-600 dark:text-purple-300">Focus on specialized training and techniques.</p>
                                            </div>
                                        </motion.li>
                                    )}
                                </ul>
                            </motion.div>
                        </div>

                        {/* Membership Packages */}
                        <div className="mb-8">
                            <motion.h2
                                className="text-xl font-semibold text-gray-800 mb-6 dark:text-gray-200"
                                variants={itemVariants}
                            >
                                Choose Your Membership Package
                            </motion.h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {membershipPackages.map((pkg) => (
                                    <motion.div
                                        key={pkg.id}
                                        className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${selectedPackage === pkg.id
                                            ? 'border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950'
                                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-500'
                                            } dark:bg-gray-800 `}
                                        onClick={() => setSelectedPackage(pkg.id)}
                                        whileHover={{ scale: 1.05, boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.1)' }}
                                        whileTap={{ scale: 0.98 }}
                                        variants={itemVariants}
                                    >
                                        <div className="text-center mb-4">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-2 dark:text-gray-200">{pkg.name}</h3>
                                            <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">${pkg.price}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">per month</div>
                                        </div>

                                        <ul className="space-y-2">
                                            {pkg.features.map((feature, index) => (
                                                <li key={index} className="flex items-start space-x-2 text-sm">
                                                    <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {selectedPackage === pkg.id && (
                                            <motion.div
                                                className="mt-4 text-center"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium dark:bg-blue-400 dark:text-gray-800">
                                                    Selected
                                                </span>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Action Button */}
                        <motion.div className="text-center" variants={itemVariants}>
                            <motion.button
                                onClick={handleJoinNow}
                                disabled={!selectedPackage}
                                className="bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 dark:bg-blue-500 dark:hover:bg-blue-600 dark:disabled:bg-gray-600 dark:text-gray-900"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Join Now
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default BookTrainerPage;