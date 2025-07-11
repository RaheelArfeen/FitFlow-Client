import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Loader from '../Loader';
import useAxiosSecure from '../../Provider/UseAxiosSecure';
import { AuthContext } from '../../Provider/AuthProvider';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query'; // Import useQuery

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
    const { user } = useContext(AuthContext); // user is not directly used in this component's logic, but kept for context

    const axiosSecure = useAxiosSecure();

    const [selectedPackage, setSelectedPackage] = useState('');

    // --- TanStack Query for fetching trainer data ---
    const { data: trainer, isLoading, isError, error } = useQuery({
        queryKey: ['trainerDetails', trainerId], // Unique key for this trainer's details
        queryFn: async () => {
            const res = await axiosSecure.get(`/trainers/${trainerId}`);
            return res.data;
        },
        enabled: !!trainerId, // Only run the query if trainerId is available
        staleTime: 1000 * 60 * 5, // Data considered fresh for 5 minutes
        onError: (err) => {
            console.error('Error fetching trainer:', err);
            toast.error('Failed to load trainer details.'); // Using toast for error notification
        }
    });

    useEffect(() => {
        // Scroll to top on component mount
        const timer = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    // Loader based on TanStack Query's isLoading
    if (isLoading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <Loader />
            </div>
        );
    }

    // Error state when data fetching fails
    if (isError) {
        return (
            <motion.div
                className="min-h-screen bg-gray-50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center">
                    <motion.h2
                        className="text-2xl font-bold text-red-600 mb-4"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        Error Loading Trainer Details
                    </motion.h2>
                    <p className="text-gray-600 mb-4">{error?.message || 'An unexpected error occurred.'}</p>
                    <motion.button
                        onClick={() => navigate('/trainers')}
                        className="text-blue-700 hover:text-blue-800"
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

    // Find the slot after trainer data is loaded
    const slot = trainer?.slots?.find(s => s.id === slotId);

    // Case where trainer or slot is not found (after successful fetch)
    if (!trainer || !slot) {
        return (
            <motion.div
                className="min-h-screen bg-gray-50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center">
                    <motion.h2
                        className="text-2xl font-bold text-gray-800 mb-4"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        Booking Not Found
                    </motion.h2>
                    <motion.button
                        onClick={() => navigate('/trainers')}
                        className="text-blue-700 hover:text-blue-800"
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
            toast.error('Please select a membership package'); // Using toast for validation error
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
            className="min-h-screen bg-gray-50 py-12"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="md:container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                    variants={itemVariants}
                >
                    {/* Header */}
                    <motion.div
                        className="bg-gradient-to-r from-blue-700 to-orange-600 text-white p-8"
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
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Session Details</h2>
                                <div className="space-y-3">
                                    <motion.div className="flex gap-2" variants={itemVariants}>
                                        <span className="text-gray-600">Trainer:</span>
                                        <span className="font-medium">{trainer.name}</span>
                                    </motion.div>
                                    <motion.div className="flex gap-2" variants={itemVariants}>
                                        <span className="text-gray-600">Specialization:</span>
                                        <span className="font-medium">{trainer.specialization}</span>
                                    </motion.div>
                                    <motion.div className="flex gap-2" variants={itemVariants}>
                                        <span className="text-gray-600">Selected Slot:</span>
                                        <span className="font-medium">{slot.name}</span>
                                    </motion.div>
                                    <motion.div className="flex gap-2" variants={itemVariants}>
                                        <span className="text-gray-600">Time:</span>
                                        <span className="font-medium">{slot.time}</span>
                                    </motion.div>
                                    <motion.div className="flex gap-2" variants={itemVariants}>
                                        <span className="text-gray-600">Day:</span>
                                        <span className="font-medium">{slot.day}</span>
                                    </motion.div>
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Classes Included</h2>
                                <div className="space-y-2">
                                    <motion.div className="bg-blue-50 p-3 rounded-lg" whileHover={{ scale: 1.03 }}>
                                        <span className="font-medium text-blue-800">{trainer.specialization}</span>
                                    </motion.div>
                                    <motion.div className="bg-green-50 p-3 rounded-lg" whileHover={{ scale: 1.03 }}>
                                        <span className="font-medium text-green-800">Personal Training</span>
                                    </motion.div>
                                    <motion.div className="bg-orange-50 p-3 rounded-lg" whileHover={{ scale: 1.03 }}>
                                        <span className="font-medium text-orange-800">Progress Tracking</span>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Membership Packages */}
                        <div className="mb-8">
                            <motion.h2
                                className="text-xl font-semibold text-gray-800 mb-6"
                                variants={itemVariants}
                            >
                                Choose Your Membership Package
                            </motion.h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {membershipPackages.map((pkg) => (
                                    <motion.div
                                        key={pkg.id}
                                        className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${selectedPackage === pkg.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        onClick={() => setSelectedPackage(pkg.id)}
                                        whileHover={{ scale: 1.05, boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.1)' }}
                                        whileTap={{ scale: 0.98 }}
                                        variants={itemVariants}
                                    >
                                        <div className="text-center mb-4">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{pkg.name}</h3>
                                            <div className="text-3xl font-bold text-blue-700">${pkg.price}</div>
                                            <div className="text-sm text-gray-500">per month</div>
                                        </div>

                                        <ul className="space-y-2">
                                            {pkg.features.map((feature, index) => (
                                                <li key={index} className="flex items-start space-x-2 text-sm">
                                                    <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                    <span className="text-gray-600">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {selectedPackage === pkg.id && (
                                            <motion.div
                                                className="mt-4 text-center"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
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
                                className="bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
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