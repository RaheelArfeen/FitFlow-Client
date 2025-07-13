import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router';
import { Users, Clock, Star, Search, Filter, Grid, List, Award, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../Provider/UseAxiosSecure';

const ClassesPage = () => {
    const axiosSecure = useAxiosSecure();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('');
    const [sortBy, setSortBy] = useState('popular');
    const [viewMode, setViewMode] = useState('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const classesPerPage = 6;

    // Defined categories and difficulties, aligned with AddNewClass
    const categories = [
        { id: 'HIIT', name: 'HIIT' },
        { id: 'YogaMindfulness', name: 'Yoga & Mindfulness' },
        { id: 'Strength', name: 'Strength Training' },
        { id: 'Cardio', name: 'Cardio' },
        { id: 'Pilates', name: 'Pilates' },
        { id: 'Dance', name: 'Dance Fitness' },
        { id: 'Boxing', name: 'Boxing' },
        { id: 'CrossFit', name: 'CrossFit' },
        { id: 'Meditation', name: 'Meditation' },
        { id: 'Nutrition', name: 'Nutrition Coaching' }
    ];

    const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

    // Fetch classes data
    const { data: classesData = [], isLoading: classesLoading, isError: classesError } = useQuery({
        queryKey: ['classes'],
        queryFn: async () => {
            const res = await axiosSecure.get('/classes');
            return res.data;
        },
        enabled: !!axiosSecure,
    });

    // Fetch trainers data (needed for displaying trainer images/links)
    const { data: allTrainers = [], isLoading: trainersLoading, isError: trainersError } = useQuery({
        queryKey: ['trainers'],
        queryFn: async () => {
            const res = await axiosSecure.get('/trainers');
            return res.data;
        },
        enabled: !!axiosSecure,
    });

    // Filter and sort classes
    const filteredAndSortedClasses = useMemo(() => {
        let tempClasses = [...classesData];

        // Apply search term filter
        if (searchTerm) {
            tempClasses = tempClasses.filter(classItem => {
                const categoryName = categories.find(cat => cat.id === classItem.category)?.name || classItem.category;
                return classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    categoryName.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }

        // Apply category filter
        if (selectedCategory) {
            tempClasses = tempClasses.filter(classItem => classItem.category === selectedCategory);
        }

        // Apply difficulty filter
        if (selectedDifficulty) {
            tempClasses = tempClasses.filter(classItem => classItem.difficulty === selectedDifficulty);
        }

        // Apply sorting
        tempClasses.sort((a, b) => {
            switch (sortBy) {
                case 'popular':
                    return b.bookings - a.bookings;
                case 'rating':
                    return b.rating - a.rating;
                case 'newest':
                    // Assuming 'createdAt' is an ISO string or Date object
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'name':
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });

        return tempClasses;
    }, [classesData, searchTerm, selectedCategory, selectedDifficulty, sortBy, categories]);

    // Pagination
    const indexOfLastClass = currentPage * classesPerPage;
    const indexOfFirstClass = indexOfLastClass - classesPerPage;
    const currentClasses = filteredAndSortedClasses.slice(indexOfFirstClass, indexOfLastClass);
    const totalPages = Math.ceil(filteredAndSortedClasses.length / classesPerPage);

    // Function to get trainer details for a class
    const getTrainersByClass = (classTrainersNames) => {
        return allTrainers
            .filter(trainer => classTrainersNames.includes(trainer.name))
            .map(trainer => ({
                id: trainer._id, // Use MongoDB _id as React key
                name: trainer.name,
                image: trainer.photoURL || 'https://placehold.co/40x40/cccccc/000000?text=TN', // Fallback for trainer image
            }))
            .slice(0, 5); // Limit to 5 trainers for display
    };

    // Reset page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, selectedDifficulty, sortBy]);

    // Scroll to top on page or filter change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentPage, searchTerm, selectedCategory, selectedDifficulty, sortBy]);

    const handleFilterChange = () => {
        // No need for isLoading state and setTimeout here, react-query handles it
        // The useEffect above will reset currentPage
    };

    const isLoading = classesLoading || trainersLoading;
    const isError = classesError || trainersError;

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
                <div className="text-center text-red-600">
                    <AlertCircle className="h-16 w-16 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Error Loading Data</h2>
                    <p>There was an issue fetching classes or trainers. Please try again later.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="md:container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Fitness Classes
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Discover our comprehensive range of fitness classes designed for all levels and interests. Join thousands of members on their fitness journey.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="text-2xl font-bold text-blue-700">{classesData.length}</div>
                            <div className="text-sm text-gray-600">Total Classes</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="text-2xl font-bold text-green-700">{categories.length}</div>
                            <div className="text-sm text-gray-600">Categories</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="text-2xl font-bold text-orange-700">{classesData.reduce((sum, c) => sum + c.bookings, 0)}</div>
                            <div className="text-sm text-gray-600">Total Bookings</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="text-2xl font-bold text-purple-700">
                                {(classesData.length > 0 ? (classesData.reduce((sum, c) => sum + c.rating, 0) / classesData.length).toFixed(1) : '0')}
                            </div>
                            <div className="text-sm text-gray-600">Avg Rating</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search classes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <Filter className="h-5 w-5 text-gray-500" />
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => {
                                        setSelectedCategory(e.target.value);
                                        handleFilterChange();
                                    }}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                            </div>

                            <select
                                value={selectedDifficulty}
                                onChange={(e) => {
                                    setSelectedDifficulty(e.target.value);
                                    handleFilterChange();
                                }}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">All Levels</option>
                                {difficulties.map(difficulty => (
                                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                                ))}
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="popular">Most Popular</option>
                                <option value="rating">Highest Rated</option>
                                <option value="newest">Newest</option>
                                <option value="name">Name A-Z</option>
                            </select>

                            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <Grid className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {(selectedCategory || selectedDifficulty || searchTerm) && (
                        <div className="mt-4 flex flex-wrap items-center space-x-2">
                            <span className="text-sm text-gray-600">Active filters:</span>
                            {selectedCategory && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                                    <span>{categories.find(cat => cat.id === selectedCategory)?.name || selectedCategory}</span>
                                    <button onClick={() => setSelectedCategory('')} className="text-blue-600 hover:text-blue-800">×</button>
                                </span>
                            )}
                            {selectedDifficulty && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                                    <span>{selectedDifficulty}</span>
                                    <button onClick={() => setSelectedDifficulty('')} className="text-green-600 hover:text-green-800">×</button>
                                </span>
                            )}
                            {searchTerm && (
                                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                                    <span>"{searchTerm}"</span>
                                    <button onClick={() => setSearchTerm('')} className="text-orange-600 hover:text-orange-800">×</button>
                                </span>
                            )}
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategory('');
                                    setSelectedDifficulty('');
                                }}
                                className="text-sm text-gray-500 hover:text-gray-700 underline"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>

                {isLoading && (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                        <p className="ml-4 text-gray-600">Loading classes...</p>
                    </div>
                )}

                {!isLoading && (
                    <div className={viewMode === 'grid'
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
                        : "space-y-6 mb-12"
                    }>
                        {currentClasses.length > 0 ? (
                            currentClasses.map((classItem) => (
                                viewMode === 'grid' ? (
                                    <div key={classItem.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
                                        <div className="relative">
                                            <img
                                                src={classItem.image}
                                                alt={classItem.name}
                                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute top-4 right-4 bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                                                <Award className="h-3 w-3" />
                                                <span>{categories.find(cat => cat.id === classItem.category)?.name || classItem.category}</span>
                                            </div>
                                            <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                                                <TrendingUp className="h-3 w-3" />
                                                <span>#{filteredAndSortedClasses.indexOf(classItem) + 1}</span>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-xl font-semibold text-gray-800">{classItem.name}</h3>
                                                <div className="flex items-center space-x-1">
                                                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                                    <span className="text-sm text-gray-600">{classItem.rating.toFixed(1)}</span>
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

                                            <div className="mb-4">
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">Trainers:</h4>
                                                <div className="flex -space-x-2">
                                                    {getTrainersByClass(classItem.trainers).map((trainer) => (
                                                        <Link
                                                            key={trainer.id}
                                                            to={`/trainer/${trainer.id}`}
                                                            className="relative"
                                                        >
                                                            <img
                                                                src={trainer.image}
                                                                alt={trainer.name}
                                                                className="w-8 h-8 rounded-full border-2 border-white hover:scale-110 transition-transform duration-200"
                                                                title={trainer.name}
                                                            />
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>

                                            <Link
                                                to={`/join-class/${classItem.id}`}
                                                className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg text-sm font-medium transition-colors duration-200 inline-block text-center group-hover:bg-blue-800"
                                            >
                                                View Class
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div key={classItem.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                                        <div className="flex items-start space-x-6">
                                            <img
                                                src={classItem.image}
                                                alt={classItem.name}
                                                className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-gray-800 mb-1">{classItem.name}</h3>
                                                        <div className="flex items-center space-x-3">
                                                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                                                                {categories.find(cat => cat.id === classItem.category)?.name || classItem.category}
                                                            </span>
                                                            <div className="flex items-center space-x-1">
                                                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                                                <span className="text-sm text-gray-600">{classItem.rating.toFixed(1)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Link
                                                        to={`/join-class/${classItem.id}`}
                                                        className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                                                    >
                                                        View Class
                                                    </Link>
                                                </div>

                                                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                                                    {classItem.description}
                                                </p>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <div className="flex items-center space-x-1">
                                                            <Users className="h-4 w-4" />
                                                            <span>{classItem.bookings} joined</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Clock className="h-4 w-4" />
                                                            <span>{classItem.duration}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex -space-x-2">
                                                        {getTrainersByClass(classItem.trainers).map((trainer) => (
                                                            <Link
                                                                key={trainer.id}
                                                                to={`/trainer/${trainer.id}`}
                                                                className="relative"
                                                            >
                                                                <img
                                                                    src={trainer.image}
                                                                    alt={trainer.name}
                                                                    className="w-6 h-6 rounded-full border-2 border-white hover:scale-110 transition-transform duration-200"
                                                                    title={trainer.name}
                                                                />
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            ))
                        ) : (
                            <div className="text-center py-16 col-span-full">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="h-12 w-12 text-gray-400" />
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-800 mb-2">No classes found</h3>
                                <p className="text-gray-600 mb-6">Try adjusting your search terms or filters to find what you're looking for.</p>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedCategory('');
                                        setSelectedDifficulty('');
                                    }}
                                    className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {!isLoading && totalPages > 1 && (
                    <div className="flex justify-center space-x-2">
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
        </div>
    );
};

export default ClassesPage;
