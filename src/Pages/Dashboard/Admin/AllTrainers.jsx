import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Trash2, Star, Calendar, Award, CheckCircle, Mail } from 'lucide-react';
import useAxiosSecure from '../../../Provider/UseAxiosSecure';
import Loader from '../../Loader';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

const AllTrainers = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const trainersPerPage = 8;

    // Fetch accepted trainers data
    const { data: acceptedTrainers = [], isLoading, error } = useQuery({
        queryKey: ['acceptedTrainers'],
        queryFn: async () => {
            const res = await axiosSecure.get('/trainers?status=accepted');
            return res.data;
        },
        staleTime: 5 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    // Calculate stats
    const totalTrainers = acceptedTrainers.length;
    const totalSessions = acceptedTrainers.reduce((sum, trainer) => sum + (trainer.sessions || 0), 0);
    const averageRating = totalTrainers > 0
        ? (acceptedTrainers.reduce((sum, trainer) => sum + (trainer.rating || 0), 0) / totalTrainers).toFixed(1)
        : '0.0';

    const totalCertifiedTrainers = acceptedTrainers.filter(trainer =>
        trainer.certifications && trainer.certifications.length > 0
    ).length;

    // Filter and paginate trainers
    const filteredTrainers = acceptedTrainers.filter(trainer =>
        trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastTrainer = currentPage * trainersPerPage;
    const indexOfFirstTrainer = indexOfLastTrainer - trainersPerPage;
    const currentTrainers = filteredTrainers.slice(indexOfFirstTrainer, indexOfLastTrainer);
    const totalPages = Math.ceil(filteredTrainers.length / trainersPerPage);

    // Mutation to demote a trainer (change status to 'rejected' and user role to 'member')
    const demoteTrainerMutation = useMutation({
        mutationFn: async ({ trainerId, trainerEmail, trainerName }) => {
            await axiosSecure.patch(`/trainers/${trainerId}/status`, { status: 'rejected', feedback: 'Demoted by Admin' });
            await axiosSecure.patch(`/users`, { email: trainerEmail, role: 'member' });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['acceptedTrainers']);
            queryClient.invalidateQueries(['pendingTrainerApplications']);
            queryClient.invalidateQueries(['rejectedTrainers']);
            queryClient.invalidateQueries(['users']);
            Swal.fire({
                icon: 'success',
                title: 'Demoted!',
                text: `${variables.trainerName} has been demoted from trainer role and is now a member.`,
                timer: 2000,
                showConfirmButton: false,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer);
                    toast.addEventListener('mouseleave', Swal.resumeTimer);
                }
            });
        },
        onError: (mutationError) => {
            console.error('Error demoting trainer:', mutationError?.response?.data || mutationError.message);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Failed to demote trainer. Please try again. ' + (mutationError?.response?.data?.message || mutationError.message),
            });
        },
    });

    const handleDeleteTrainer = (trainerId, trainerName, trainerEmail) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to remove ${trainerName} from trainer role? They will become a regular member.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, remove them!'
        }).then((result) => {
            if (result.isConfirmed) {
                demoteTrainerMutation.mutate({ trainerId, trainerName, trainerEmail });
            }
        });
    };

    // Framer Motion Variants
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
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 10,
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
        hover: { scale: 1.03, boxShadow: "0 15px 25px rgba(0, 0, 0, 0.15)", dark: { boxShadow: "0 15px 25px rgba(255, 255, 255, 0.05)" } },
    };

    const trainerCardVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
        hover: { scale: 1.02, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)", dark: { boxShadow: "0 10px 20px rgba(255, 255, 255, 0.05)" } }
    };

    if (isLoading) return <Loader />;
    if (error) return <div className="text-red-500 dark:text-red-400 text-center py-10 text-xl font-medium">Error loading trainers: {error.message}</div>;

    return (
        <motion.div
            className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div className="mb-12 text-center md:text-left" variants={itemVariants}>
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">All Trainers</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Oversee and manage all approved professional fitness trainers.
                </p>
            </motion.div>

            {/* Stats */}
            <motion.div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-8 mb-12" variants={containerVariants}>
                <motion.div
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-7 border border-gray-100 dark:border-gray-700 flex flex-col justify-between"
                    variants={cardVariants}
                    whileHover="hover"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{totalTrainers}</h3>
                            <p className="text-lg text-gray-600 dark:text-gray-400">Total Trainers</p>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-full">
                            <Award className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Active trainers on the platform.</p>
                </motion.div>

                <motion.div
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-7 border border-gray-100 dark:border-gray-700 flex flex-col justify-between"
                    variants={cardVariants}
                    whileHover="hover"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{averageRating}</h3>
                            <p className="text-lg text-gray-600 dark:text-gray-400">Average Rating</p>
                        </div>
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-full">
                            <Star className="h-10 w-10 text-yellow-600 dark:text-yellow-400 fill-yellow-600 dark:fill-yellow-400" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Platform-wide average trainer rating.</p>
                </motion.div>

                <motion.div
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-7 border border-gray-100 dark:border-gray-700 flex flex-col justify-between"
                    variants={cardVariants}
                    whileHover="hover"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{totalSessions}</h3>
                            <p className="text-lg text-gray-600 dark:text-gray-400">Total Sessions Conducted</p>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900 rounded-full">
                            <Calendar className="h-10 w-10 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Cumulative sessions led by all trainers.</p>
                </motion.div>

                <motion.div
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-7 border border-gray-100 dark:border-gray-700 flex flex-col justify-between"
                    variants={cardVariants}
                    whileHover="hover"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{totalCertifiedTrainers}</h3>
                            <p className="text-lg text-gray-600 dark:text-gray-400">Certified Trainers</p>
                        </div>
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900 rounded-full">
                            <CheckCircle className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Trainers with verified certifications.</p>
                </motion.div>
            </motion.div>

            {/* Search */}
            <motion.div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-12 border border-gray-100 dark:border-gray-700"
                variants={itemVariants}
            >
                <div className="relative w-full mx-auto">
                    <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search trainers by name, specialization, or email..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1); // Reset pagination on search
                        }}
                        className="pl-14 pr-6 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl w-full text-lg text-gray-700 dark:text-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 ease-in-out"
                    />
                </div>
            </motion.div>

            {/* Conditional Messages for No Data */}
            {filteredTrainers.length === 0 && searchTerm && (
                <motion.div
                    className="text-center p-20 text-gray-500 dark:text-gray-500 text-xl flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 min-h-[300px] mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Search className="h-16 w-16 mb-6 text-gray-400 dark:text-gray-500" />
                    <p>No trainers found matching "{searchTerm}".</p>
                </motion.div>
            )}
            {acceptedTrainers.length === 0 && !searchTerm && (
                <motion.div
                    className="text-center p-20 text-gray-500 dark:text-gray-500 text-xl flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 min-h-[300px] mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Mail className="h-16 w-16 mb-6 text-gray-400 dark:text-gray-500" />
                    <p>No accepted trainers available at the moment.</p>
                </motion.div>
            )}

            {/* Trainers Grid */}
            {filteredTrainers.length > 0 && (
                <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" variants={containerVariants}>
                    {currentTrainers.map((trainer) => (
                        <motion.div
                            key={trainer._id}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col"
                            variants={trainerCardVariants}
                            whileHover="hover"
                        >
                            <div className="relative h-56 w-full">
                                <img
                                    src={trainer.photoURL}
                                    alt={trainer.name}
                                    className="w-full h-full object-cover object-center"
                                />
                                <div className="absolute top-5 left-5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center space-x-1 shadow-md">
                                    <Star className="h-4 w-4 fill-current text-white" />
                                    <span>{trainer.rating?.toFixed(1) || '0.0'}</span>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{trainer.name}</h3>
                                <p className="text-orange-600 dark:text-orange-400 font-semibold text-base mb-4">{trainer.specialization}</p>

                                <div className="space-y-3 mb-5 text-gray-700 dark:text-gray-300">
                                    <div className="flex items-center text-sm">
                                        <Calendar className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                                        <span>{trainer.experience || 'N/A'} of Experience</span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <Award className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" />
                                        <span>{trainer.sessions || 0} Sessions Conducted</span>
                                    </div>
                                </div>

                                <div className="mb-5 flex-grow">
                                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Certifications:</div>
                                    <div className="flex flex-wrap gap-2">
                                        {(trainer.certifications || []).slice(0, 2).map((cert, index) => (
                                            <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium dark:bg-blue-900 dark:text-blue-300">
                                                {cert}
                                            </span>
                                        ))}
                                        {(trainer.certifications || []).length > 2 && (
                                            <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-xs font-medium dark:bg-gray-700 dark:text-gray-300">
                                                +{(trainer.certifications.length - 2)} more
                                            </span>
                                        )}
                                        {(trainer.certifications || []).length === 0 && (
                                            <span className="text-gray-500 dark:text-gray-500 text-xs">No certifications listed</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{trainer.email}</span>
                                    <motion.button
                                        onClick={() => handleDeleteTrainer(trainer._id, trainer.name, trainer.email)}
                                        className="text-red-600 hover:text-red-800 p-3 rounded-full
                                                   hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2
                                                   transition-all duration-200 ease-in-out dark:hover:bg-red-900 dark:focus:ring-red-600"
                                        title="Remove Trainer Role"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        disabled={demoteTrainerMutation.isLoading}
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-12 space-x-3">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <motion.button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ease-in-out
                                ${currentPage === page
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {page}
                        </motion.button>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default AllTrainers;