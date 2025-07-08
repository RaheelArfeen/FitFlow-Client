import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Check } from 'lucide-react';
import Loader from '../Loader';
import useAxiosSecure from '../../Provider/UseAxiosSecure';
import { AuthContext } from '../../Provider/AuthProvider';

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

    const [trainer, setTrainer] = useState(null);
    const [selectedPackage, setSelectedPackage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosSecure.get(`/trainers/${trainerId}`)
            .then(res => {
                setTrainer(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching trainer:', err);
                setLoading(false);
            });
    }, [trainerId, axiosSecure]);

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <Loader />
            </div>
        );
    }

    const slot = trainer?.slots?.find(s => s.id === slotId);

    if (!trainer || !slot) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Not Found</h2>
                    <button onClick={() => navigate('/trainers')} className="text-blue-700 hover:text-blue-800">
                        Back to Trainers
                    </button>
                </div>
            </div>
        );
    }

    const handleJoinNow = () => {
        if (!selectedPackage) {
            alert('Please select a membership package');
            return;
        }
        navigate(`/payment/${trainerId}/${slotId}/${selectedPackage}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="md:container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-700 to-orange-600 text-white p-8">
                        <h1 className="text-3xl font-bold mb-2">Book Your Training Session</h1>
                        <p className="text-blue-100">Complete your booking with {trainer.name}</p>
                    </div>

                    <div className="p-8">
                        {/* Booking Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Session Details</h2>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <span className="text-gray-600">Trainer:</span>
                                        <span className="font-medium">{trainer.name}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-gray-600">Specialization:</span>
                                        <span className="font-medium">{trainer.specialization}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-gray-600">Selected Slot:</span>
                                        <span className="font-medium">{slot.name}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-gray-600">Time:</span>
                                        <span className="font-medium">{slot.time}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="text-gray-600">Day:</span>
                                        <span className="font-medium">{slot.day}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Classes Included</h2>
                                <div className="space-y-2">
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <span className="font-medium text-blue-800">{trainer.specialization}</span>
                                    </div>
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <span className="font-medium text-green-800">Personal Training</span>
                                    </div>
                                    <div className="bg-orange-50 p-3 rounded-lg">
                                        <span className="font-medium text-orange-800">Progress Tracking</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Membership Packages */}
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Choose Your Membership Package</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {membershipPackages.map((pkg) => (
                                    <div
                                        key={pkg.id}
                                        className={`border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ${selectedPackage === pkg.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        onClick={() => setSelectedPackage(pkg.id)}
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
                                            <div className="mt-4 text-center">
                                                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                    Selected
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="text-center">
                            <button
                                onClick={handleJoinNow}
                                disabled={!selectedPackage}
                                className="bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
                            >
                                Join Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookTrainerPage;
