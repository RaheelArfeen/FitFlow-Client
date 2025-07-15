import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, Check, X, Calendar, User } from 'lucide-react';
import useAxiosSecure from '../../../Provider/UseAxiosSecure';
import Loader from '../../Loader';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

const AppliedTrainers = () => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    const [selectedTrainer, setSelectedTrainer] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('details');
    const [rejectFeedback, setRejectFeedback] = useState('');

    // Fetch only pending trainers directly from the backend
    const { data: pendingTrainers = [], isLoading } = useQuery({
        queryKey: ['pendingTrainerApplications'],
        queryFn: async () => {
            const res = await axiosSecure.get('/trainers?status=pending');
            return res.data;
        },
    });

    // Fetch accepted trainers for stats/display
    const { data: acceptedTrainers = [], isLoading: isLoadingAccepted } = useQuery({
        queryKey: ['acceptedTrainers'],
        queryFn: async () => {
            const res = await axiosSecure.get('/trainers?status=accepted');
            return res.data;
        },
    });

    // Fetch rejected trainers for stats/display
    const { data: rejectedTrainers = [], isLoading: isLoadingRejected } = useQuery({
        queryKey: ['rejectedTrainers'],
        queryFn: async () => {
            const res = await axiosSecure.get('/trainers?status=rejected');
            return res.data;
        },
    });

    // Total trainers for stats, combine all fetched lists
    const allTrainersCount = pendingTrainers.length + acceptedTrainers.length + rejectedTrainers.length;


    // Mutation to approve a trainer (change status to 'accepted')
    const approveTrainerMutation = useMutation({
        mutationFn: async (trainerId) => {
            await axiosSecure.patch(`/trainers/${trainerId}/status`, { status: 'accepted' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['pendingTrainerApplications']); // Invalidate specific pending query
            queryClient.invalidateQueries(['acceptedTrainers']); // Invalidate accepted query
            setShowModal(false);
            Swal.fire({
                icon: 'success',
                title: 'Approved!',
                text: 'Trainer approved successfully!',
                timer: 2000,
                showConfirmButton: false,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer);
                    toast.addEventListener('mouseleave', Swal.resumeTimer);
                }
            });
        },
        onError: (error) => {
            console.error('Error approving trainer:', error?.response?.data || error.message);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong during approval! ' + (error?.response?.data?.message || error.message),
            });
        },
    });

    // Mutation to reject a trainer (change status to 'rejected' with feedback)
    const rejectTrainerMutation = useMutation({
        mutationFn: async ({ id, feedback }) => {
            await axiosSecure.patch(`/trainers/${id}/status`, { status: 'rejected', feedback });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['pendingTrainerApplications']); // Invalidate specific pending query
            queryClient.invalidateQueries(['rejectedTrainers']); // Invalidate rejected query
            setShowModal(false);
            setRejectFeedback('');
            Swal.fire({
                icon: 'success',
                title: 'Rejected!',
                text: 'Trainer rejected successfully!',
                timer: 2000,
                showConfirmButton: false,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
            });
        },
        onError: (error) => {
            console.error('Error rejecting trainer:', error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong during rejection! ' + (error?.response?.data?.message || error.message),
            });
        },
    });

    const handleViewDetails = (trainer) => {
        setSelectedTrainer(trainer);
        setModalType('details');
        setShowModal(true);
    };

    const handleApprove = (trainer) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to approve ${trainer.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, approve it!'
        }).then((result) => {
            if (result.isConfirmed) {
                approveTrainerMutation.mutate(trainer._id);
            }
        });
    };

    const handleReject = (trainer) => {
        setSelectedTrainer(trainer);
        setModalType('reject');
        setShowModal(true);
    };

    const submitRejection = () => {
        if (selectedTrainer && rejectFeedback.trim()) {
            Swal.fire({
                title: 'Are you sure?',
                text: `Do you want to reject ${selectedTrainer.name}? This action cannot be undone.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, reject it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    rejectTrainerMutation.mutate({
                        id: selectedTrainer._id,
                        feedback: rejectFeedback,
                    });
                }
            });
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Feedback Required',
                text: 'Please provide rejection feedback.',
            });
        }
    };

    if (isLoading || isLoadingAccepted || isLoadingRejected) return <Loader />; // Check all loading states

    // Framer Motion Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 10 } },
        exit: { opacity: 0, y: -50, transition: { duration: 0.3 } }
    };

    const modalContentVariants = {
        hidden: { opacity: 0, y: 50, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 10 } },
        exit: { opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.3 } }
    };

    const renderTrainerCard = (trainer) => (
        <motion.div
            key={trainer._id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            whileHover={{
                scale: 1.03,
                boxShadow:
                    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition duration-300"
        >
            <div className="relative">
                <img
                    src={trainer.photoURL}
                    alt={trainer.name}
                    className="w-full h-48 object-cover"
                />
                <div
                    className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold shadow-md ${trainer.status === 'pending'
                        ? 'bg-orange-600 text-white'
                        : trainer.status === 'accepted'
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}
                >
                    {trainer.status.charAt(0).toUpperCase() + trainer.status.slice(1)}
                </div>
            </div>

            <div className="p-5 space-y-2">
                <h3 className="text-xl font-semibold text-gray-800">{trainer.name}</h3>
                <p className="text-sm text-gray-500">{trainer.email}</p>

                <div className="grid grid-cols-2 text-sm text-gray-600 gap-y-1 pt-2">
                    <p>
                        <span className="font-medium text-gray-700">Age:</span> {trainer.age}
                    </p>
                    <p>
                        <span className="font-medium text-gray-700">Experience:</span>{' '}
                        {trainer.experience}
                    </p>
                    <p>
                        <span className="font-medium text-gray-700">Specialization:</span>{' '}
                        {trainer.specialization}
                    </p>
                    <p>
                        <span className="font-medium text-gray-700">Sessions:</span>{' '}
                        {trainer.sessions}
                    </p>
                </div>

                <div className="pt-3 flex flex-wrap gap-2">
                    {(trainer.certifications || []).slice(0, 5).map((cert, i) => (
                        <span
                            key={i}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium border border-blue-200"
                        >
                            {cert}
                        </span>
                    ))}
                </div>

                {trainer.status === 'rejected' && trainer.adminFeedback && (
                    <p className="mt-3 text-sm text-red-700 italic">
                        <strong>Rejection Feedback:</strong>{' '}
                        {trainer.adminFeedback.length > 100
                            ? trainer.adminFeedback.slice(0, 100) + '...'
                            : trainer.adminFeedback}
                    </p>
                )}

                <div className="flex gap-2 pt-4 flex-wrap">
                    <button
                        onClick={() => handleViewDetails(trainer)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 px-3 py-1.5 rounded-lg"
                    >
                        <Eye className="h-4 w-4" /> View
                    </button>

                    {trainer.status === 'pending' && (
                        <>
                            <button
                                onClick={() => handleApprove(trainer)}
                                className="flex items-center gap-1 text-green-600 hover:text-green-800 text-sm font-medium bg-green-50 px-3 py-1.5 rounded-lg"
                                disabled={approveTrainerMutation.isLoading}
                            >
                                <Check className="h-4 w-4" /> Approve
                            </button>
                            <button
                                onClick={() => handleReject(trainer)}
                                className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium bg-red-50 px-3 py-1.5 rounded-lg"
                                disabled={rejectTrainerMutation.isLoading}
                            >
                                <X className="h-4 w-4" /> Reject
                            </button>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );

    return (
        <motion.div
            className="p-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.h1 className="text-3xl font-bold text-gray-800 mb-4" variants={cardVariants}>Manage Trainer Applications</motion.h1>
            <motion.p className="text-gray-600 mb-8" variants={cardVariants}>Review and manage trainer applications.</motion.p>

            {/* Stats */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10"
                variants={containerVariants}
            >
                {[
                    { label: 'Pending', count: pendingTrainers.length, icon: <User />, color: 'orange' },
                    { label: 'Approved', count: acceptedTrainers.length, icon: <Check />, color: 'green' },
                    { label: 'Rejected', count: rejectedTrainers.length, icon: <X />, color: 'red' },
                    { label: 'Total', count: allTrainersCount, icon: <Calendar />, color: 'blue' },
                ].map(({ label, count, icon, color }, i) => (
                    <motion.div
                        key={i}
                        className="bg-white shadow rounded-xl px-6 py-8 flex items-center justify-between"
                        variants={cardVariants}
                        whileHover={{
                            scale: 1.03,
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        }}
                        transition={{ duration: 0.2 }}
                    >
                        <div>
                            <h3 className="text-3xl font-bold text-gray-800">{count}</h3>
                            <p className="text-lg text-gray-600">{label}</p>
                        </div>
                        {React.cloneElement(icon, { className: `h-10 w-10 text-${color}-600` })}
                    </motion.div>
                ))}
            </motion.div>

            {/* Pending Applications Section */}
            <section className="mb-10">
                <motion.h2 className="text-2xl font-semibold mb-4" variants={cardVariants}>Pending Applications</motion.h2>
                {pendingTrainers.length === 0 ? (
                    <motion.div
                        className="text-center bg-white py-20 rounded-xl shadow"
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-xl font-semibold">No pending applications</p>
                    </motion.div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        variants={containerVariants}
                    >
                        <AnimatePresence>
                            {pendingTrainers.map(renderTrainerCard)}
                        </AnimatePresence>
                    </motion.div>
                )}
            </section>

            {/* Accepted Applications Section */}
            <section className="mb-10">
                <motion.h2 className="text-2xl font-semibold mb-4" variants={cardVariants}>Accepted Trainers</motion.h2>
                {acceptedTrainers.length === 0 ? (
                    <motion.div
                        className="text-center bg-white py-20 rounded-xl shadow"
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <Check className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-xl font-semibold">No accepted trainers</p>
                    </motion.div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        variants={containerVariants}
                    >
                        <AnimatePresence>
                            {acceptedTrainers.map(renderTrainerCard)}
                        </AnimatePresence>
                    </motion.div>
                )}
            </section>

            {/* Rejected Applications Section */}
            <section className="mb-10">
                <motion.h2 className="text-2xl font-semibold mb-4" variants={cardVariants}>Rejected Trainers</motion.h2>
                {rejectedTrainers.length === 0 ? (
                    <motion.div
                        className="text-center bg-white py-20 rounded-xl shadow"
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <X className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-xl font-semibold">No rejected trainers</p>
                    </motion.div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        variants={containerVariants}
                    >
                        <AnimatePresence>
                            {rejectedTrainers.map(renderTrainerCard)}
                        </AnimatePresence>
                    </motion.div>
                )}
            </section>

            {/* Modal */}
            <AnimatePresence>
                {showModal && selectedTrainer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            variants={modalContentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="bg-white rounded-xl max-w-lg w-full p-6 relative overflow-y-auto max-h-[80vh] shadow-2xl"
                        >
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition duration-200"
                            >
                                <X className="h-6 w-6" />
                            </button>

                            {modalType === 'details' ? (
                                <>
                                    <div className="flex items-center space-x-4 mb-4">
                                        <img
                                            src={selectedTrainer.photoURL}
                                            alt={selectedTrainer.name}
                                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                                        />
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">{selectedTrainer.name}</h3>
                                            <p className="text-sm text-gray-600">{selectedTrainer.email}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-gray-700 text-sm md:text-base">
                                        <p><strong>Bio:</strong> {selectedTrainer.description}</p>
                                        <p><strong>Age:</strong> {selectedTrainer.age}</p>
                                        <p><strong>Experience:</strong> {selectedTrainer.experience}</p>
                                        <p><strong>Specialization:</strong> {selectedTrainer.specialization}</p>
                                        <p><strong>Sessions Completed:</strong> {selectedTrainer.sessions}</p>
                                        <p>
                                            <strong>Certifications:</strong>{' '}
                                            {selectedTrainer.certifications && selectedTrainer.certifications.length > 0
                                                ? selectedTrainer.certifications.join(', ')
                                                : 'None'}
                                        </p>
                                        <p>
                                            <strong>Available Slots:</strong>{' '}
                                            {selectedTrainer.slots && selectedTrainer.slots.length > 0
                                                ? selectedTrainer.slots.map(slot => `${slot.days}: ${slot.slotTime}${slot.isBooked ? ' (Booked)' : ''}`).join(', ')
                                                : 'None'}
                                        </p>
                                    </div>

                                    {selectedTrainer.status === 'rejected' && selectedTrainer.adminFeedback && (
                                        <p className="text-red-700 italic mt-4 mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                                            <strong>Rejection Feedback:</strong> {selectedTrainer.adminFeedback}
                                        </p>
                                    )}

                                    <div className="flex space-x-3 flex-wrap mt-6 justify-end">
                                        {selectedTrainer.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(selectedTrainer)}
                                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 flex items-center gap-1"
                                                    disabled={approveTrainerMutation.isLoading}
                                                >
                                                    <Check className="h-4 w-4" /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(selectedTrainer)}
                                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200 flex items-center gap-1"
                                                    disabled={rejectTrainerMutation.isLoading}
                                                >
                                                    <X className="h-4 w-4" /> Reject
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-200"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Provide Rejection Feedback</h2>
                                    <textarea
                                        className="w-full p-3 border border-gray-300 shadow-inner rounded-md mb-4 resize-y outline-none focus:ring-2 focus:ring-red-400"
                                        rows={6}
                                        value={rejectFeedback}
                                        onChange={(e) => setRejectFeedback(e.target.value)}
                                        placeholder="Enter detailed feedback for rejection..."
                                    />
                                    <div className="flex space-x-4 justify-end">
                                        <button
                                            onClick={submitRejection}
                                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
                                            disabled={rejectTrainerMutation.isLoading}
                                        >
                                            Submit Rejection
                                        </button>
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-200"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AppliedTrainers;