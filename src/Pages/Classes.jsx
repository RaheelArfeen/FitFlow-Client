import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router';
import { Users, Clock, Star, Search, Filter, Grid, List, Award, TrendingUp, ChevronLeft, ChevronRight, AlertCircle, ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../Provider/UseAxiosSecure';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '../Pages/Loader'

const Classes = () => {
    const axiosSecure = useAxiosSecure();

    const CustomDropdown = ({ options, value, onChange, placeholder, className = '' }) => {
        const [isOpen, setIsOpen] = useState(false);
        const dropdownRef = useRef(null);

        const handleSelect = (optionValue) => {
            onChange(optionValue);
            setIsOpen(false);
        };

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        useEffect(() => {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, []);

        const selectedOption = options.find(option => option.value === value) || { label: placeholder, value: '' };

        const dropdownVariants = {
            open: { opacity: 1, y: 0, scaleY: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
            closed: { opacity: 0, y: -10, scaleY: 0.9, transition: { duration: 0.2 } }
        };

        const itemVariants = {
            hidden: { opacity: 0, y: -10 },
            visible: { opacity: 1, y: 0 },
            hover: { backgroundColor: '#e0f2fe', scale: 1.02 },
            tap: { scale: 0.98 }
        };

        return (
            <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
                <motion.button
                    type="button"
                    className="inline-flex justify-between items-center w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 min-w-[150px]"
                    onClick={() => setIsOpen(!isOpen)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {selectedOption.label}
                    <ChevronDown className={`-mr-1 ml-2 h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                </motion.button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial="closed"
                            animate="open"
                            exit="closed"
                            variants={dropdownVariants}
                            style={{ originY: 0 }}
                            className="absolute z-10 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                        >
                            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                {options.map((option) => (
                                    <motion.button
                                        key={option.value}
                                        onClick={() => handleSelect(option.value)}
                                        className={`block w-full text-left px-4 py-2 text-sm ${option.value === value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}
                                        role="menuitem"
                                        variants={itemVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                    >
                                        {option.label}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };
    // --- End Custom Dropdown Component ---

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('');
    const [sortBy, setSortBy] = useState('popular');
    const [viewMode, setViewMode] = useState('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const classesPerPage = 6;

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

    const { data: classesData = [], isLoading: classesLoading, isError: classesError } = useQuery({
        queryKey: ['classes'],
        queryFn: async () => {
            const res = await axiosSecure.get('/classes');
            return res.data;
        },
        enabled: !!axiosSecure,
    });

    const { data: allTrainers = [], isLoading: trainersLoading, isError: trainersError } = useQuery({
        queryKey: ['trainers'],
        queryFn: async () => {
            const res = await axiosSecure.get('/trainers');
            return res.data;
        },
        enabled: !!axiosSecure,
    });

    const filteredAndSortedClasses = useMemo(() => {
        let tempClasses = [...classesData];

        if (searchTerm) {
            tempClasses = tempClasses.filter(classItem => {
                const categoryName = categories.find(cat => cat.id === classItem.category)?.name || classItem.category;
                return classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    categoryName.toLowerCase().includes(searchTerm.toLowerCase());
            });
        }

        if (selectedCategory) {
            tempClasses = tempClasses.filter(classItem => classItem.category === selectedCategory);
        }

        if (selectedDifficulty) {
            tempClasses = tempClasses.filter(classItem => classItem.difficulty === selectedDifficulty);
        }

        tempClasses.sort((a, b) => {
            switch (sortBy) {
                case 'popular':
                    return b.bookings - a.bookings;
                case 'rating':
                    return b.rating - a.rating;
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'name':
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });

        return tempClasses;
    }, [classesData, searchTerm, selectedCategory, selectedDifficulty, sortBy, categories]);

    const indexOfLastClass = currentPage * classesPerPage;
    const indexOfFirstClass = indexOfLastClass - classesPerPage;
    const currentClasses = filteredAndSortedClasses.slice(indexOfFirstClass, indexOfLastClass);
    const totalPages = Math.ceil(filteredAndSortedClasses.length / classesPerPage);

    const getTrainersByClass = useCallback((classTrainersNames) => {
        return allTrainers
            .filter(trainer => classTrainersNames.includes(trainer.name))
            .map(trainer => ({
                id: trainer._id,
                name: trainer.name,
                image: trainer.photoURL,
            }))
            .slice(0, 5);
    }, [allTrainers]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, selectedDifficulty, sortBy]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentPage, searchTerm, selectedCategory, selectedDifficulty, sortBy]);


    const isLoading = classesLoading || trainersLoading;
    const isError = classesError || trainersError;

    // --- Framer Motion Variants ---
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 } }
    };

    const textVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const statBoxVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 10 } }
    };

    const controlsContainerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.5, ease: "easeOut", staggerChildren: 0.05 } }
    };

    const controlItemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    const inputFocusVariants = {
        rest: { borderColor: '#d1d5db' },
        focus: { borderColor: '#3b82f6', borderWidth: '2px', boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)' }
    };

    const viewModeButtonVariants = {
        active: { backgroundColor: '#1d4ed8', color: '#ffffff', scale: 1 },
        inactive: { backgroundColor: '#ffffff', color: '#4b5563', scale: 1 },
        hover: { scale: 1.05, backgroundColor: '#f3f4f6' },
        tap: { scale: 0.95 }
    };

    const badgeVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 150, damping: 15 } },
        exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
    };

    const classCardVariants = {
        hidden: { opacity: 0, y: 50, scale: 0.9 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: "easeOut"
            }
        }),
        hover: { scale: 1.02, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)' }
    };

    const cardImageVariants = {
        hover: { scale: 1.05, transition: { duration: 0.3 } }
    };

    const trainerImageVariants = {
        hover: { scale: 1.15, boxShadow: '0 0 0 2px #fff, 0 0 0 4px #2563eb' }
    };

    const paginationButtonVariants = {
        rest: { scale: 1, backgroundColor: '#ffffff', color: '#4b5563', borderColor: '#d1d5db', transition: { duration: 0.1 } },
        hover: { scale: 1.05, backgroundColor: '#f3f4f6', borderColor: '#9ca3af', transition: { duration: 0.1 } },
        tap: { scale: 0.95, transition: { duration: 0.05 } },
        active: { scale: 1, backgroundColor: '#2563eb', color: '#ffffff', borderColor: '#2563eb', transition: { duration: 0.1 } },
        disabled: { backgroundColor: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed', scale: 1, transition: { duration: 0.1 } }
    };

    const paginationIconButtonVariants = {
        rest: { scale: 1, backgroundColor: '#ffffff', color: '#4b5563', borderColor: '#d1d5db', transition: { duration: 0.1 } },
        hover: { scale: 1.05, backgroundColor: '#f3f4f6', borderColor: '#9ca3af', transition: { duration: 0.1 } },
        tap: { scale: 0.95, transition: { duration: 0.05 } },
        disabled: { backgroundColor: '#e5e7eb', color: '#9ca3af', cursor: 'not-allowed', scale: 1, transition: { duration: 0.1 } }
    };

    const pageNumberItemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } }
    };

    const getVisiblePageNumbers = useCallback(() => {
        const delta = 2;
        const range = [];
        const left = currentPage - delta;
        const right = currentPage + delta;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= left && i <= right)) {
                range.push(i);
            }
        }

        const visiblePages = [];
        let lastPage = 0;
        for (let i = 0; i < range.length; i++) {
            if (range[i] - lastPage > 1) {
                visiblePages.push('...');
            }
            visiblePages.push(range[i]);
            lastPage = range[i];
        }
        return visiblePages;
    }, [currentPage, totalPages]);


    if (isLoading) {
        return <Loader />;
    }

    if (isError) {
        return (
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="min-h-screen flex items-center justify-center bg-gray-50 py-12"
            >
                <motion.div variants={textVariants} className="text-center text-red-600">
                    <AlertCircle className="h-16 w-16 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Error Loading Data</h2>
                    <p>There was an issue fetching classes or trainers. Please try again later.</p>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="min-h-screen bg-gray-50 py-12"
        >
            <div className="md:container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <motion.h1 variants={textVariants} className="text-4xl font-bold text-gray-800 mb-4">
                        Fitness Classes
                    </motion.h1>
                    <motion.p variants={textVariants} className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Discover our comprehensive range of fitness classes designed for all levels and interests. Join thousands of members on their fitness journey.
                    </motion.p>

                    <motion.div variants={controlsContainerVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <motion.div variants={statBoxVariants} className="bg-white rounded-lg p-6 shadow-sm">
                            <div className="text-2xl font-bold text-blue-700">{classesData.length}</div>
                            <div className="text-sm text-gray-600">Total Classes</div>
                        </motion.div>
                        <motion.div variants={statBoxVariants} className="bg-white rounded-lg p-6 shadow-sm">
                            <div className="text-2xl font-bold text-green-700">{categories.length}</div>
                            <div className="text-sm text-gray-600">Categories</div>
                        </motion.div>
                        <motion.div variants={statBoxVariants} className="bg-white rounded-lg p-6 shadow-sm">
                            <div className="text-2xl font-bold text-orange-700">{classesData.reduce((sum, c) => sum + c.bookings, 0)}</div>
                            <div className="text-sm text-gray-600">Total Bookings</div>
                        </motion.div>
                        <motion.div variants={statBoxVariants} className="bg-white rounded-lg p-6 shadow-sm">
                            <div className="text-2xl font-bold text-purple-700">
                                {(classesData.length > 0 ? (classesData.reduce((sum, c) => sum + c.rating, 0) / classesData.length).toFixed(1) : '0')}
                            </div>
                            <div className="text-sm text-gray-600">Avg Rating</div>
                        </motion.div>
                    </motion.div>
                </div>

                <motion.div variants={controlsContainerVariants} className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
                        <motion.div variants={controlItemVariants} className="flex-1 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <motion.input
                                    type="text"
                                    placeholder="Search classes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    variants={inputFocusVariants}
                                    whileFocus="focus"
                                    initial="rest"
                                />
                            </div>
                        </motion.div>

                        <div className="flex flex-wrap items-center space-x-4">
                            <motion.div variants={controlItemVariants} className="flex items-center space-x-2">
                                <Filter className="h-5 w-5 text-gray-500" />
                                <CustomDropdown
                                    options={[
                                        { label: 'All Categories', value: '' },
                                        ...categories.map(cat => ({ label: cat.name, value: cat.id }))
                                    ]}
                                    value={selectedCategory}
                                    onChange={setSelectedCategory}
                                    placeholder="All Categories"
                                    className="w-full sm:w-auto"
                                />
                            </motion.div>

                            <CustomDropdown
                                options={[
                                    { label: 'All Levels', value: '' },
                                    ...difficulties.map(diff => ({ label: diff, value: diff }))
                                ]}
                                value={selectedDifficulty}
                                onChange={setSelectedDifficulty}
                                placeholder="All Levels"
                                className="w-full sm:w-auto"
                            />

                            <CustomDropdown
                                options={[
                                    { label: 'Most Popular', value: 'popular' },
                                    { label: 'Highest Rated', value: 'rating' },
                                    { label: 'Newest', value: 'newest' },
                                    { label: 'Name A-Z', value: 'name' }
                                ]}
                                value={sortBy}
                                onChange={setSortBy}
                                placeholder="Sort By"
                                className="w-full sm:w-auto"
                            />

                            <motion.div variants={controlItemVariants} className="flex border border-gray-300 rounded-lg overflow-hidden">
                                <motion.button
                                    onClick={() => setViewMode('grid')}
                                    variants={viewModeButtonVariants}
                                    animate={viewMode === 'grid' ? 'active' : 'inactive'}
                                    whileHover="hover"
                                    whileTap="tap"
                                    className={`p-2 transition-colors duration-200`}
                                >
                                    <Grid className="h-4 w-4" />
                                </motion.button>
                                <motion.button
                                    onClick={() => setViewMode('list')}
                                    variants={viewModeButtonVariants}
                                    animate={viewMode === 'list' ? 'active' : 'inactive'}
                                    whileHover="hover"
                                    whileTap="tap"
                                    className={`p-2 transition-colors duration-200`}
                                >
                                    <List className="h-4 w-4" />
                                </motion.button>
                            </motion.div>
                        </div>
                    </div>

                    <AnimatePresence>
                        {(selectedCategory || selectedDifficulty || searchTerm) && (
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={controlItemVariants}
                                className="mt-4 flex flex-wrap items-center space-x-2"
                            >
                                <span className="text-sm text-gray-600">Active filters:</span>
                                {selectedCategory && (
                                    <motion.span variants={badgeVariants} initial="hidden" animate="visible" exit="exit" className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                                        <span>{categories.find(cat => cat.id === selectedCategory)?.name || selectedCategory}</span>
                                        <motion.button onClick={() => setSelectedCategory('')} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }} className="text-blue-600 hover:text-blue-800">×</motion.button>
                                    </motion.span>
                                )}
                                {selectedDifficulty && (
                                    <motion.span variants={badgeVariants} initial="hidden" animate="visible" exit="exit" className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                                        <span>{selectedDifficulty}</span>
                                        <motion.button onClick={() => setSelectedDifficulty('')} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }} className="text-green-600 hover:text-green-800">×</motion.button>
                                    </motion.span>
                                )}
                                {searchTerm && (
                                    <motion.span variants={badgeVariants} initial="hidden" animate="visible" exit="exit" className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                                        <span>"{searchTerm}"</span>
                                        <motion.button onClick={() => setSearchTerm('')} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }} className="text-orange-600 hover:text-orange-800">×</motion.button>
                                    </motion.span>
                                )}
                                <motion.button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedCategory('');
                                        setSelectedDifficulty('');
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                                >
                                    Clear all
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {!isLoading && (
                    <motion.div
                        key={viewMode}
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.07,
                                    delayChildren: 0.2
                                }
                            }
                        }}
                        className={viewMode === 'grid'
                            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
                            : "space-y-6 mb-12"
                        }
                    >
                        <AnimatePresence mode='wait'>
                            {currentClasses.length > 0 ? (
                                currentClasses.map((classItem, index) => (
                                    viewMode === 'grid' ? (
                                        <motion.div
                                            key={classItem._id}
                                            variants={classCardVariants}
                                            custom={index}
                                            whileHover="hover"
                                            className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 group"
                                        >
                                            <div className="relative">
                                                <motion.img
                                                    src={classItem.image}
                                                    alt={classItem.name}
                                                    className="w-full h-48 object-cover transition-transform duration-300"
                                                    variants={cardImageVariants}
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
                                                                <motion.img
                                                                    src={trainer.image}
                                                                    alt={trainer.name}
                                                                    className="w-8 h-8 rounded-full border-2 object-cover border-white"
                                                                    title={trainer.name}
                                                                    variants={trainerImageVariants}
                                                                    whileHover="hover"
                                                                />
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>

                                                <Link
                                                    to={`/join-class/${classItem._id}`}
                                                    className="w-full bg-blue-700 text-white py-3 rounded-lg text-sm font-medium inline-block text-center"
                                                >
                                                    <motion.span whileHover="hover" whileTap="tap" className="block">
                                                        Join Class
                                                    </motion.span>
                                                </Link>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key={classItem._id}
                                            variants={classCardVariants}
                                            custom={index}
                                            whileHover="hover"
                                            className="bg-white rounded-xl shadow-lg p-6 transition-shadow duration-300"
                                        >
                                            <div className="flex items-start space-x-6">
                                                <motion.img
                                                    src={classItem.image}
                                                    alt={classItem.name}
                                                    className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                                                    variants={cardImageVariants}
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
                                                            to={`/join-class/${classItem._id}`}
                                                            className="bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium"
                                                        >
                                                            <motion.span whileHover="hover" whileTap="tap" className="block">
                                                                Join Class
                                                            </motion.span>
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
                                                                    <motion.div whileHover="hover" className='flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg ml-3'>
                                                                        <motion.img
                                                                            src={trainer.image}
                                                                            alt={trainer.name}
                                                                            className="w-6 h-6 rounded-full border-2 border-white object-cover"
                                                                            title={trainer.name}
                                                                            variants={trainerImageVariants}
                                                                        />
                                                                        <span className='text-sm'>{trainer.name}</span>
                                                                    </motion.div>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                ))
                            ) : (
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={textVariants}
                                    className="text-center py-16 col-span-full"
                                >
                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Search className="h-12 w-12 text-gray-400" />
                                    </div>
                                    <h3 className="text-2xl font-semibold text-gray-800 mb-2">No classes found</h3>
                                    <p className="text-gray-600 mb-6">Try adjusting your search terms or filters to find what you're looking for.</p>
                                    <motion.button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setSelectedCategory('');
                                            setSelectedDifficulty('');
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                                    >
                                        Clear Filters
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {!isLoading && totalPages > 1 && (
                    <nav className="flex flex-wrap justify-between gap-2 mb-8 items-center" aria-label="Pagination">
                        <motion.button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            variants={paginationIconButtonVariants}
                            initial="rest"
                            whileHover="hover"
                            whileTap="tap"
                            animate={currentPage === 1 ? "disabled" : "rest"}
                            className="px-2 py-2 rounded-lg border text-center font-medium flex items-center justify-center"
                        >
                            <ChevronLeft size={20} />
                        </motion.button>

                        <div className='flex items-center gap-2'>
                            <AnimatePresence mode='wait'>
                                {getVisiblePageNumbers().map((page) => (
                                    <motion.span
                                        key={page}
                                        variants={pageNumberItemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                    >
                                        {page === '...' ? (
                                            <span className="px-4 py-2 text-gray-700 text-center">
                                                ...
                                            </span>
                                        ) : (
                                            <motion.button
                                                onClick={() => setCurrentPage(page)}
                                                variants={paginationButtonVariants}
                                                initial="rest"
                                                whileHover="hover"
                                                whileTap="tap"
                                                animate={currentPage === page ? "active" : "rest"}
                                                className="px-4 py-2 rounded-lg border min-w-[44px] text-center"
                                            >
                                                {page}
                                            </motion.button>
                                        )}
                                    </motion.span>
                                ))}
                            </AnimatePresence>
                        </div>

                        <motion.button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            variants={paginationIconButtonVariants}
                            initial="rest"
                            whileHover="hover"
                            whileTap="tap"
                            animate={currentPage === totalPages ? "disabled" : "rest"}
                            className="px-2 py-2 rounded-lg border text-center font-medium flex items-center justify-center"
                        >
                            <ChevronRight size={20} />
                        </motion.button>
                    </nav>
                )}
            </div>
        </motion.div>
    );
};

export default Classes;