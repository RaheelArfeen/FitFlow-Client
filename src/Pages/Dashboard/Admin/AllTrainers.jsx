import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Trash2, Star, Calendar, Award, CheckCircle } from 'lucide-react'; // Import CheckCircle for certified count
import useAxiosSecure from '../../../Provider/UseAxiosSecure';
import Loader from '../../Loader';
import Swal from 'sweetalert2';

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
    });

    // Calculate stats
    const totalTrainers = acceptedTrainers.length;
    const totalSessions = acceptedTrainers.reduce((sum, trainer) => sum + (trainer.sessions || 0), 0);
    const averageRating = totalTrainers > 0
        ? (acceptedTrainers.reduce((sum, trainer) => sum + (trainer.rating || 0), 0) / totalTrainers).toFixed(1)
        : '0';

    // NEW: Calculate Total Certified Trainers
    const totalCertifiedTrainers = acceptedTrainers.filter(trainer =>
        trainer.certifications && trainer.certifications.length > 0
    ).length;

    // Filter and paginate trainers
    const filteredTrainers = acceptedTrainers.filter(trainer =>
        trainer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastTrainer = currentPage * trainersPerPage;
    const indexOfFirstTrainer = indexOfLastTrainer - trainersPerPage;
    const currentTrainers = filteredTrainers.slice(indexOfFirstTrainer, indexOfLastTrainer);
    const totalPages = Math.ceil(filteredTrainers.length / trainersPerPage);

    // Mutation to demote a trainer (change status to 'rejected' and user role to 'member')
    const demoteTrainerMutation = useMutation({
        mutationFn: async ({ trainerId, trainerEmail, trainerName }) => {
            // 1. Change trainer status to 'rejected'
            await axiosSecure.patch(`/trainers/${trainerId}/status`, { status: 'rejected', feedback: 'Demoted by Admin' });
            // 2. Change user role back to 'member'
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

    if (isLoading) return <Loader />;
    if (error) return <div className="text-red-500 text-center py-10">Error loading trainers: {error.message}</div>;

    return (
        <div className="p-6 md:p-8 lg:p-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">All Trainers</h1>
                <p className="text-gray-600">Manage all accepted trainers on the platform.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800">{totalTrainers}</h3>
                            <p className="text-gray-600">Total Accepted Trainers</p>
                        </div>
                        <Award className="h-8 w-8 text-blue-600" />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800">{averageRating}</h3>
                            <p className="text-gray-600">Avg Rating</p>
                        </div>
                        <Star className="h-8 w-8 text-yellow-500" />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800">{totalSessions}</h3>
                            <p className="text-gray-600">Total Sessions</p>
                        </div>
                        <Calendar className="h-8 w-8 text-green-600" />
                    </div>
                </div>
                {/* REPLACED: Average Experience with Certified Trainers */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800">{totalCertifiedTrainers}</h3>
                            <p className="text-gray-600">Certified Trainers</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-indigo-600" /> {/* Changed icon and color */}
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search trainers by name, specialization, or email..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Trainers Grid */}
            {currentTrainers.length === 0 && filteredTrainers.length > 0 && (
                <div className="text-center text-gray-600 py-10">
                    No trainers found on this page. Try adjusting your search or pagination.
                </div>
            )}
            {filteredTrainers.length === 0 && searchTerm && (
                <div className="text-center text-gray-600 py-10">
                    No trainers match your search term "{searchTerm}".
                </div>
            )}
            {acceptedTrainers.length === 0 && !searchTerm && (
                <div className="text-center text-gray-600 py-10">
                    No accepted trainers available at the moment.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentTrainers.map((trainer) => (
                    <div key={trainer._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                        <div className="relative">
                            <img
                                src={trainer.photoURL}
                                alt={trainer.name}
                                className="w-full h-48 object-cover"
                            />
                            <div className="absolute top-4 left-4 bg-green-600 text-white px-2 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                                <Star className="h-3 w-3 fill-current" />
                                <span>{trainer.rating?.toFixed(1) || '0.0'}</span>
                            </div>
                        </div>

                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">{trainer.name}</h3>
                            <p className="text-orange-600 font-medium text-sm mb-3">{trainer.specialization}</p>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center text-sm text-gray-500">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    <span>{trainer.experience}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <Award className="h-4 w-4 mr-2" />
                                    <span>{trainer.sessions || 0}+ sessions</span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="text-sm text-gray-600 mb-2">Certifications:</div>
                                <div className="flex flex-wrap gap-1">
                                    {(trainer.certifications || []).slice(0, 2).map((cert, index) => (
                                        <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                            {cert}
                                        </span>
                                    ))}
                                    {(trainer.certifications || []).length > 2 && (
                                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                            +{(trainer.certifications.length - 2)} more
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">{trainer.email}</span>
                                <button
                                    onClick={() => handleDeleteTrainer(trainer._id, trainer.name, trainer.email)}
                                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                    title="Remove Trainer Role"
                                    disabled={demoteTrainerMutation.isLoading}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 rounded-lg ${currentPage === page
                                    ? 'bg-blue-700 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-50'
                                } border border-gray-300 transition-colors duration-200`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllTrainers;