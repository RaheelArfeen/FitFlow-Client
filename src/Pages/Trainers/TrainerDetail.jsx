import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import {
    Star as StarIcon,
    Calendar,
    Award,
    Instagram,
    Twitter,
    Linkedin,
    Clock,
    MapPin,
} from 'lucide-react';
import useAxiosSecure from '../../Provider/UseAxiosSecure';
import Loader from '../Loader';
import Swal from 'sweetalert2';
import { AuthContext } from '../../Provider/AuthProvider';

const TrainerDetail = () => {
    const { id } = useParams();
    const axiosSecure = useAxiosSecure();
    const { user } = useContext(AuthContext);

    const [trainer, setTrainer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRating, setUserRating] = useState(0);
    const [submittingRating, setSubmittingRating] = useState(false);

    useEffect(() => {
        setLoading(true);

        const fetchAllData = async () => {
            try {
                // Fetch trainer details
                const trainerRes = await axiosSecure.get(`/trainers/${id}`);
                setTrainer(trainerRes.data);

                // Fetch user rating only if logged in
                if (user?.email) {
                    const ratingRes = await axiosSecure.get(`/trainers/rating/${id}`, { withCredentials: true });
                    setUserRating(ratingRes.data?.userRating || 0);
                } else {
                    setUserRating(0);
                }
            } catch (err) {
                console.error("Failed to fetch trainer or rating data:", err);
                setTrainer(null);
                setUserRating(0);
            }
        };

        fetchAllData().finally(() => {
            // Keep loader visible for 2 seconds minimum
            setTimeout(() => {
                setLoading(false);
            }, 1500);
        });
    }, [id, axiosSecure, user]);

    const handleRatingSubmit = async (ratingValue) => {
        if (!user) {
            return Swal.fire("Login Required", "Please log in to rate the trainer.", "warning");
        }

        try {
            setSubmittingRating(true);

            const res = await axiosSecure.post(
                `/trainers/rating/${trainer._id}`,
                { rating: ratingValue },
                { withCredentials: true }
            );

            if (res.data?.success) {
                Swal.fire("Thank you!", "Your rating has been submitted.", "success");
                setUserRating(ratingValue);

                // Refresh trainer data to get updated average rating
                const refreshed = await axiosSecure.get(`/trainers/${trainer._id}`);
                setTrainer(refreshed.data);
            } else {
                Swal.fire("Notice", res.data?.message || "Rating already submitted.", "info");
            }
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to submit rating.", "error");
        } finally {
            setSubmittingRating(false);
        }
    };

    if (loading) {
        return (
            <div>
                <Loader />
            </div>
        );
    }

    if (!trainer) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Trainer Not Found</h2>
                    <Link to="/trainers" className="text-blue-700 hover:text-blue-800">
                        Back to Trainers
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="md:container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Column */}
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <div className="text-center">
                            <img
                                src={trainer.image}
                                alt={trainer.name}
                                className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
                            />
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">{trainer.name}</h1>
                            <p className="text-xl text-orange-600 font-medium mb-4">{trainer.specialization}</p>
                            <div className="flex flex-col items-center space-y-2">
                                <div className="flex items-center space-x-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <StarIcon
                                            key={star}
                                            className={`h-6 w-6 cursor-pointer transition-colors duration-200 ${star <= userRating
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-gray-300'
                                                }`}
                                            onClick={() => !submittingRating && handleRatingSubmit(star)}
                                            title={`${star} star${star > 1 ? 's' : ''}`}
                                        />
                                    ))}
                                </div>
                                <p className="text-sm text-gray-600">
                                    Average Rating:{' '}
                                    <span className="font-semibold text-yellow-600">
                                        {trainer.rating?.toFixed(1) || 'N/A'}
                                    </span>
                                </p>
                            </div>

                            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 mt-4">
                                <div className="flex items-center space-x-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{trainer.experience || 'N/A'}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Award className="h-4 w-4" />
                                    <span>{trainer.sessions || 0}+ Sessions</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 mt-8">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">About</h3>
                                <p className="text-gray-600 leading-relaxed">{trainer.bio || 'No bio available.'}</p>
                            </div>

                            {trainer.certifications && trainer.certifications.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Certifications</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {trainer.certifications.map((cert, index) => (
                                            <span key={index} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                                                {cert}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {trainer.availableDays && trainer.availableDays.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Available Days</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {trainer.availableDays.map((day, index) => (
                                            <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                                                {day}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Connect</h3>
                                <div className="flex space-x-4">
                                    {trainer.social?.instagram ? (
                                        <a href={`https://instagram.com/${trainer.social.instagram.replace('@', '')}`} target="_blank" rel="noreferrer">
                                            <Instagram className="h-6 w-6 text-gray-400 hover:text-pink-500 transition-colors duration-200" />
                                        </a>
                                    ) : <Instagram className="h-6 w-6 text-gray-300" />}

                                    {trainer.social?.twitter ? (
                                        <a href={`https://twitter.com/${trainer.social.twitter.replace('@', '')}`} target="_blank" rel="noreferrer">
                                            <Twitter className="h-6 w-6 text-gray-400 hover:text-blue-400 transition-colors duration-200" />
                                        </a>
                                    ) : <Twitter className="h-6 w-6 text-gray-300" />}

                                    {trainer.social?.linkedin ? (
                                        <a href={`https://linkedin.com/in/${trainer.social.linkedin}`} target="_blank" rel="noreferrer">
                                            <Linkedin className="h-6 w-6 text-gray-400 hover:text-blue-600 transition-colors duration-200" />
                                        </a>
                                    ) : <Linkedin className="h-6 w-6 text-gray-300" />}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Slots */}
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Slots</h2>
                        <div className="space-y-4">
                            {trainer.slots && trainer.slots.length > 0 ? (
                                trainer.slots.map((slot, index) => (
                                    <div
                                        key={index}
                                        className={`border rounded-lg p-4 ${slot.isBooked ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200 hover:bg-blue-100 cursor-pointer'} transition-colors duration-200`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{slot.name}</h3>
                                                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                                    <div className="flex items-center space-x-1">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{slot.time}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <MapPin className="h-4 w-4" />
                                                        <span>{slot.day}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                {slot.isBooked ? (
                                                    <span className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm">Booked</span>
                                                ) : (
                                                    <Link
                                                        to={`/book-trainer/${trainer._id}/${slot.id}`}
                                                        className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                                                    >
                                                        Book Now
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-400 italic">No slots available</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-16 bg-gradient-to-r from-blue-700 to-orange-600 rounded-xl p-8 text-white text-center">
                    <h2 className="text-3xl font-bold mb-4">Want to Become a Trainer?</h2>
                    <p className="text-xl mb-6 text-blue-100">
                        Join our team of expert trainers and help others achieve their fitness goals.
                    </p>
                    <Link
                        to="/be-trainer"
                        className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 inline-block"
                    >
                        Become a Trainer
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default TrainerDetail;