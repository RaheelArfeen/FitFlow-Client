import React, { useState, useEffect, useRef, useContext } from 'react';
import { Calendar, Clock, User, Trash2, Eye, XCircle, PlusCircle } from 'lucide-react';
import { Link } from 'react-router';
import useAxiosSecure from '../../../Provider/UseAxiosSecure';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Loader from '../../Loader';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../../Provider/AuthProvider';

const ManageSlots = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    const [selectedSlot, setSelectedSlot] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const {
        data: trainerData,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['trainerData', user?.email],
        queryFn: async () => {
            if (!user?.email) {
                throw new Error("User not logged in or email not available.");
            }
            const response = await axiosSecure.get(`/trainers?email=${user.email}`);
            const foundTrainer = response.data[0];
            if (!foundTrainer) {
                throw new Error("Trainer profile not found for the logged-in user.");
            }
            return foundTrainer;
        },
        enabled: !!user?.email,
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
    });

    const trainerSlots = trainerData?.slots || [];

    const deleteSlotMutation = useMutation({
        mutationFn: async (slotId) => {
            await axiosSecure.delete(`/trainers/slots/${slotId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['trainerData', user?.email]);
            Swal.fire(
                'Deleted!',
                'Slot has been deleted successfully.',
                'success'
            );
        },
        onError: (err) => {
            console.error('Error deleting slot:', err);
            Swal.fire(
                'Error!',
                'Failed to delete slot. Please try again later.',
                'error'
            );
        },
    });

    const handleViewBooking = (slot) => {
        setSelectedSlot(slot);
        setShowModal(true);
    };

    const handleDeleteSlot = (slotId, slotName) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete "${slotName}". This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteSlotMutation.mutate(slotId);
            }
        });
    };

    const bookedSlots = trainerSlots.filter(slot => slot.bookedMembers && slot.bookedMembers.length > 0);
    const availableSlots = trainerSlots.filter(slot => !slot.bookedMembers || slot.bookedMembers.length === 0);
    const totalEarnings = bookedSlots.reduce((acc, slot) => acc + (slot.bookedMembers.length * 50), 0);

    // Framer Motion Variants
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                delayChildren: 0.2,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const tableRowVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, x: 50, transition: { duration: 0.3, ease: "easeIn" } }
    };

    if (isLoading) {
        return <Loader />;
    }

    if (isError) {
        return (
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="text-center py-8 text-red-600 dark:text-red-400"
            >
                <motion.p variants={itemVariants}>Error loading trainer data: {error?.message || "Unknown error."}</motion.p>
            </motion.div>
        );
    }

    if (!trainerData) {
        return (
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="text-center py-8 text-gray-600 dark:text-gray-400"
            >
                <motion.p variants={itemVariants}>No trainer data found. Please ensure you are logged in as a trainer.</motion.p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="p-6 md:p-8 font-inter bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-300"
        >
            <motion.div variants={itemVariants} className="mb-8">
                <motion.h1
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2"
                >
                    Manage Slots
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-gray-600 dark:text-gray-400"
                >
                    View and manage your training slots and bookings.
                </motion.p>
            </motion.div>

            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{trainerSlots.length}</h3>
                        <p className="text-gray-600 dark:text-gray-400">Total Slots</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-600" />
                </motion.div>
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{bookedSlots.length}</h3>
                        <p className="text-gray-600 dark:text-gray-400">Booked Slots</p>
                    </div>
                    <User className="h-8 w-8 text-green-600" />
                </motion.div>
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{availableSlots.length}</h3>
                        <p className="text-gray-600 dark:text-gray-400">Available Slots</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600" />
                </motion.div>
                <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">${totalEarnings}</h3>
                        <p className="text-gray-600 dark:text-gray-400">Potential Earnings</p>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-600" />
                </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Your Training Slots</h2>
                    <Link to="/dashboard/add-slot">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 shadow-md text-sm"
                        >
                            <PlusCircle className="h-4 w-4" />
                            <span>Add New Slot</span>
                        </motion.button>
                    </Link>
                </div>

                {trainerSlots.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Slot Details
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Schedule
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Booking Info
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <AnimatePresence>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {trainerSlots.map((slot) => (
                                        <motion.tr
                                            key={slot.id}
                                            variants={tableRowVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            layout
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{slot.slotName}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">{slot.classType || 'Personal Training'}</div>
                                                    {slot.maxParticipants && (
                                                        <div className="text-xs text-gray-400 dark:text-gray-500">Max: {slot.maxParticipants} participants</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                    <div>
                                                        <div className="text-sm text-gray-900 dark:text-gray-100">{slot.days.join(', ')}</div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">{slot.slotTime}</div>
                                                        {slot.duration && (
                                                            <div className="text-xs text-gray-400 dark:text-gray-500">{slot.duration}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${slot.bookedMembers && slot.bookedMembers.length > 0
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200'
                                                    }`}>
                                                    {slot.bookedMembers && slot.bookedMembers.length > 0 ? 'Booked' : 'Available'}
                                                </span>
                                                {slot.status === 'completed' && (
                                                    <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                                                        Completed
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {slot.bookedMembers && slot.bookedMembers.length > 0 ? (
                                                    <div className="text-sm">
                                                        <div className="font-medium text-gray-900 dark:text-gray-100">{slot.bookedMembers[0].name}</div>
                                                        {slot.bookedMembers.length > 1 && (
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                +{slot.bookedMembers.length - 1} more
                                                            </div>
                                                        )}
                                                        {slot.bookedMembers[0].package && (
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">{slot.bookedMembers[0].package}</div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">No booking</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                {slot.bookedMembers && slot.bookedMembers.length > 0 && (
                                                    <>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            onClick={() => handleViewBooking(slot)}
                                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 transition-colors duration-200 p-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900"
                                                            title="View Booking Details"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </motion.button>
                                                    </>
                                                )}
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleDeleteSlot(slot.id, slot.slotName)}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 transition-colors duration-200 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900"
                                                    title="Delete Slot"
                                                    disabled={deleteSlotMutation.isPending}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </motion.button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </AnimatePresence>
                        </table>
                    </div>
                ) : (
                    <motion.div variants={itemVariants} className="p-12 text-center">
                        <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">No Slots Created</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">You haven't created any training slots yet.</p>
                        <Link to="/add-slot">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                            >
                                Create Your First Slot
                            </motion.button>
                        </Link>
                    </motion.div>
                )}
            </motion.div>

            <AnimatePresence>
                {showModal && selectedSlot && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-lg text-gray-800 dark:text-gray-200"
                            nitial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                                        Booking Details
                                    </h2>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setShowModal(false)}
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <XCircle className="h-6 w-6" />
                                    </motion.button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Slot Information</h3>
                                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Slot: {selectedSlot.slotName}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Time: {selectedSlot.slotTime}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Day: {selectedSlot.days.join(', ')}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Class: {selectedSlot.classType || 'Personal Training'}</div>
                                        </div>
                                    </div>

                                    {selectedSlot.bookedMembers && selectedSlot.bookedMembers.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Client Information ({selectedSlot.bookedMembers.length} Participants)</h3>
                                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg space-y-3 max-h-[180px] overflow-y-auto custom-scrollbar">
                                                {selectedSlot.bookedMembers.map((member, index) => (
                                                    <div key={index} className="flex items-center space-x-3 border-b border-gray-200 dark:border-gray-600 pb-2 last:border-b-0 last:pb-0">
                                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                                                            {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-800 dark:text-gray-100">{member.name || 'N/A'}</div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400">{member.email || 'N/A'}</div>
                                                            {member.package && <div className="text-xs text-gray-500 dark:text-gray-500">Package: {member.package}</div>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Booking Details</h3>
                                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Booked on: Jan 15, 2024</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Payment Status: Completed</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Package: Premium Membership - $100</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">Session Type: {selectedSlot.classType || 'Personal Training'}</div>
                                        </div>
                                    </div>

                                    <div className="flex space-x-3 mt-6">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors duration-200"
                                        >
                                            Close
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ManageSlots;