import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Star, Calendar, Award, Instagram, Twitter, Linkedin } from 'lucide-react';
import { AuthContext } from '../../Provider/AuthProvider';
import useAxiosSecure from '../../Provider/UseAxiosSecure';
import Loader from '../Loader';

const Trainers = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosSecure.get('/trainers')
            .then(res => {
                setTrainers(res.data);
                setLoading(false);
                console.log(res.data);
            })
            .catch(err => {
                console.error('Error fetching trainers:', err);
                setLoading(false);
            });
    }, [axiosSecure]);

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <Loader/>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="md:container mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <header className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Our Expert Trainers
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Meet our certified fitness professionals who are passionate about helping you achieve your goals.
                    </p>
                </header>

                {/* Trainers Grid */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" aria-label="Trainers List">
                    {trainers.map((trainer) => (
                        <article key={trainer._id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
                            <div className="relative">
                                <img
                                    src={trainer.image}
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
                                    {trainer.bio && trainer.bio.length > 80
                                        ? trainer.bio.slice(0, 80) + '...'
                                        : trainer.bio || 'No bio available.'}
                                </p>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        <span>{trainer.experience || 'N/A'} experience</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Award className="h-4 w-4 mr-2" />
                                        <span>{trainer.sessions || 0}+ sessions completed</span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="text-sm text-gray-600 mb-2">Available Slots:</div>
                                    <div className="flex flex-wrap gap-2">
                                        {(trainer.availableSlots && trainer.availableSlots.length > 0)
                                            ? trainer.availableSlots.map((slot) => (
                                                <span
                                                    key={slot}
                                                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                                                >
                                                    {slot}
                                                </span>
                                            ))
                                            : <span className="text-gray-400 text-xs italic">No slots available</span>
                                        }
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-auto">
                                    {/* Social Links */}
                                    <div className="flex space-x-3">
                                        {/* Instagram */}
                                        {trainer.social?.instagram ? (
                                            <a
                                                href={`https://instagram.com/${trainer.social.instagram.replace('@', '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={`${trainer.name} Instagram`}
                                            >
                                                <Instagram className="h-5 w-5 text-gray-400 hover:text-pink-500 cursor-pointer transition-colors duration-200" />
                                            </a>
                                        ) : (
                                            <Instagram className="h-5 w-5 text-gray-300 cursor-not-allowed" />
                                        )}

                                        {/* Twitter */}
                                        {trainer.social?.twitter ? (
                                            <a
                                                href={`https://twitter.com/${trainer.social.twitter.replace('@', '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={`${trainer.name} Twitter`}
                                            >
                                                <Twitter className="h-5 w-5 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors duration-200" />
                                            </a>
                                        ) : (
                                            <Twitter className="h-5 w-5 text-gray-300 cursor-not-allowed" />
                                        )}

                                        {/* LinkedIn */}
                                        {trainer.social?.linkedin ? (
                                            <a
                                                href={`https://linkedin.com/in/${trainer.social.linkedin}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={`${trainer.name} LinkedIn`}
                                            >
                                                <Linkedin className="h-5 w-5 text-gray-400 hover:text-blue-600 cursor-pointer transition-colors duration-200" />
                                            </a>
                                        ) : (
                                            <Linkedin className="h-5 w-5 text-gray-300 cursor-not-allowed" />
                                        )}
                                    </div>

                                    <Link
                                        to={`/trainer/${trainer._id}`}
                                        className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                                    >
                                        Know More
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </section>

                {/* Become a Trainer CTA */}
                {user?.role === 'member' && (
                    <section className="mt-16 bg-gradient-to-r from-blue-700 to-orange-600 rounded-xl p-8 text-white text-center">
                        <h2 className="text-3xl font-bold mb-4">Want to Become a Trainer?</h2>
                        <p className="text-xl mb-6 text-blue-100">
                            Join our team of expert trainers and help others achieve their fitness goals while earning extra income.
                        </p>
                        <Link
                            to="/be-trainer"
                            className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 inline-block"
                        >
                            Become a Trainer
                        </Link>
                    </section>
                )}

                {!user && (
                    <section className="mt-16 bg-gradient-to-r from-blue-700 to-orange-600 rounded-xl p-8 text-white text-center">
                        <h2 className="text-3xl font-bold mb-4">Want to Become a Trainer?</h2>
                        <p className="text-xl mb-6 text-blue-100">
                            Join our team of expert trainers and help others achieve their fitness goals.
                        </p>
                        <div className="space-x-4">
                            <Link
                                to="/register"
                                className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 inline-block"
                            >
                                Sign Up First
                            </Link>
                            <Link
                                to="/login"
                                className="bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-colors duration-200 inline-block border border-white/30"
                            >
                                Login
                            </Link>
                        </div>
                    </section>
                )}

            </div>
        </div>
    );
};

export default Trainers;