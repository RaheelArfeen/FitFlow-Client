import React from 'react';
import { Users, Clock, Star } from 'lucide-react';
import { Link } from 'react-router';

const FeaturedClasses = () => {
    const classes = [
        {
            id: 1,
            name: "HIIT Power Hour",
            description: "High-intensity interval training to maximize calorie burn and build strength.",
            image: "https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=600",
            bookings: 1250,
            duration: "45 min",
            rating: 4.9,
            instructor: "Sarah Johnson"
        },
        {
            id: 2,
            name: "Zen Yoga Flow",
            description: "Mindful yoga practice focusing on flexibility, balance, and inner peace.",
            image: "https://images.pexels.com/photos/1051838/pexels-photo-1051838.jpeg?auto=compress&cs=tinysrgb&w=600",
            bookings: 980,
            duration: "60 min",
            rating: 4.8,
            instructor: "David Chen"
        },
        {
            id: 3,
            name: "Strength & Conditioning",
            description: "Build lean muscle and improve overall strength with progressive resistance training.",
            image: "https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=600",
            bookings: 890,
            duration: "50 min",
            rating: 4.9,
            instructor: "Mike Rodriguez"
        },
        {
            id: 4,
            name: "Cardio Dance Fusion",
            description: "Fun, energetic dance workouts that combine cardio with rhythm and movement.",
            image: "https://images.pexels.com/photos/1552103/pexels-photo-1552103.jpeg?auto=compress&cs=tinysrgb&w=600",
            bookings: 756,
            duration: "40 min",
            rating: 4.7,
            instructor: "Lisa Thompson"
        },
        {
            id: 5,
            name: "Pilates Core",
            description: "Strengthen your core and improve posture with precise, controlled movements.",
            image: "https://images.pexels.com/photos/1552108/pexels-photo-1552108.jpeg?auto=compress&cs=tinysrgb&w=600",
            bookings: 634,
            duration: "45 min",
            rating: 4.8,
            instructor: "Emma Wilson"
        },
        {
            id: 6,
            name: "Boxing Bootcamp",
            description: "High-energy boxing-inspired workout that builds strength, speed, and confidence.",
            image: "https://images.pexels.com/photos/1552249/pexels-photo-1552249.jpeg?auto=compress&cs=tinysrgb&w=600",
            bookings: 567,
            duration: "55 min",
            rating: 4.9,
            instructor: "Alex Martinez"
        }
    ];

    return (
        <section className="py-20 bg-gray-50">
            <div className="md:container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                        Featured Classes
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Discover our most popular and highly-rated classes that our community loves most.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {classes.map((classItem) => (
                        <div key={classItem.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                            <div className="relative">
                                <img
                                    src={classItem.image}
                                    alt={classItem.name}
                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-4 right-4 bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                                    <span>#{classes.indexOf(classItem) + 1}</span>
                                </div>
                                <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                                    {classItem.category}
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xl font-semibold text-gray-800">{classItem.name}</h3>
                                    <div className="flex items-center space-x-1">
                                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                        <span className="text-sm text-gray-600">{classItem.rating}</span>
                                    </div>
                                </div>

                                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                                    {classItem.description}
                                </p>

                                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                    <div className="flex items-center space-x-1">
                                        <Users className="h-4 w-4" />
                                        <span>{classItem.bookings} joined</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{classItem.duration}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">

                                    </div>
                                    <Link
                                        to={`/join-class/${classItem.id}`}
                                        className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 inline-block group-hover:bg-blue-800"
                                    >
                                        Join Class
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Link
                        to="/classes"
                        className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 inline-block"
                    >
                        View All Classes
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FeaturedClasses;