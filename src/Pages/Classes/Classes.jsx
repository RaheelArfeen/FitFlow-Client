import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router';
import { Users, Clock, Search, Filter, Grid, List, Award, TrendingUp, ChevronLeft, ChevronRight, AlertCircle, ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../Provider/UseAxiosSecure';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '../Loader';
import { Title } from 'react-head';

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
                                        className={`block w-full text-left px-4 py-2 text-sm ${option.value === value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'}`}
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

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('');
    const [sortBy, setSortBy] = useState('popular');
    const [viewMode, setViewMode] = useState('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const classesPerPage = 6;

    const categories = [
        { id: 'HIIT', name: 'HIIT' },
        { id: 'Yoga', name: 'Yoga & Mindfulness' },
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
            console.log("Fetched Classes Data:", res.data); // DEBUG: Inspect this data
            return res.data.map(cls => ({ ...cls, _id: cls._id || cls.id }));
        },
        enabled: !!axiosSecure,
        staleTime: 5 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    const { data: allTrainers = [], isLoading: trainersLoading, isError: trainersError } = useQuery({
        queryKey: ['trainers'],
        queryFn: async () => {
            const res = await axiosSecure.get('/trainers');
            console.log("Fetched Trainers Data:", res.data); // DEBUG: Inspect this data
            return res.data.map(trainer => ({ ...trainer, _id: trainer._id || trainer.id }));
        },
        enabled: !!axiosSecure,
        staleTime: 5 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    const filteredAndSortedClasses = useMemo(() => {
        let tempClasses = [...classesData];

        if (searchTerm) {
            tempClasses = tempClasses.filter(classItem => {
                const categoryName = categories.find(cat => cat.id === classItem.category)?.name || classItem.category;
                return classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    classItem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

    const getTrainersForClass = useCallback((classItemTrainers) => {
        if (!classItemTrainers || !Array.isArray(classItemTrainers)) {
            console.warn("classItemTrainers is not an array or is null/undefined:", classItemTrainers);
            return [];
        }

        const assignedTrainersDetails = classItemTrainers.map(assignedTrainer => {
            console.log("Attempting to find trainer for ID:", assignedTrainer.id);
            // Ensure that allTrainers is not empty before attempting to find
            if (!allTrainers || allTrainers.length === 0) {
                console.warn("allTrainers array is empty or null, cannot find trainer.");
                return null;
            }

            const fullTrainer = allTrainers.find(
                t => t._id === assignedTrainer.id || t.id === assignedTrainer.id
            );

            if (!fullTrainer) {
                console.warn("Trainer not found for ID:", assignedTrainer.id);
                return null;
            }

            const imageUrl = fullTrainer.photoURL || fullTrainer.image;
            if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
                console.warn(`Invalid or missing image URL for trainer ${fullTrainer.name} (ID: ${fullTrainer._id}):`, imageUrl);
                return null;
            }

            console.log(`Found trainer ${fullTrainer.name} with image:`, imageUrl);
            return {
                id: fullTrainer._id,
                name: fullTrainer.name,
                image: imageUrl,
            };
        }).filter(Boolean); // Filter out any nulls

        console.log("Assigned Trainers Details:", assignedTrainersDetails);
        return assignedTrainersDetails.slice(0, 5);
    }, [allTrainers]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, selectedDifficulty, sortBy]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentPage]);

    const isLoading = classesLoading || trainersLoading;
    const isError = classesError || trainersError;

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
        hover: { scale: 1.05 },
        tap: { scale: 0.95 },
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

    const getVisiblePageNumbers = useCallback(() => {
        const delta = 2;
        const range = [];
        const left = Math.max(1, currentPage - delta);
        const right = Math.min(totalPages, currentPage + delta);

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                range.push(i);
            }
        } else {
            range.push(1);
            if (left > 2) {
                range.push('...');
            }
            for (let i = left; i <= right; i++) {
                if (i !== 1 && i !== totalPages) {
                    range.push(i);
                }
            }
            if (right < totalPages - 1) {
                range.push('...');
            }
            if (totalPages > 1) {
                range.push(totalPages);
            }
        }
        return [...new Set(range)].sort((a, b) => {
            if (a === '...') return -1;
            if (b === '...') return 1;
            return a - b;
        });
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

    if (!isLoading && !isError && classesData.length === 0) {
        return (
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="min-h-screen flex items-center justify-center bg-gray-50 py-12"
            >
                <motion.div variants={textVariants} className="text-center text-gray-600">
                    <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h2 className="text-2xl font-bold mb-2">No Classes Available</h2>
                    <p>It looks like there are no fitness classes added yet. Please check back later!</p>
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
                <Title>Classes | FitFlow</Title>
                <div className="text-center mb-12">
                    <motion.h1 variants={textVariants} className="text-4xl font-bold text-gray-800 mb-4">
                        Fitness Classes
                    </motion.h1>
                    <motion.p variants={textVariants} className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Discover our comprehensive range of fitness classes designed for all levels and interests. Join thousands of members on their fitness journey.
                    </motion.p>
                    <motion.div variants={controlsContainerVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <motion.div variants={statBoxVariants} className="bg-white rounded-lg p-6 shadow-sm">
                            <div className="text-2xl font-bold text-blue-700">{filteredAndSortedClasses.length}</div>
                            <div className="text-sm text-gray-600">Active Classes</div>
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
                                {allTrainers.length}
                            </div>
                            <div className="text-sm text-gray-600">Active Trainers</div>
                        </motion.div>
                    </motion.div>
                </div>

                <motion.div
                    variants={controlsContainerVariants}
                    className="bg-white rounded-xl shadow-lg p-6 mb-8"
                >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* Search Input */}
                        <motion.div variants={controlItemVariants} className="w-full lg:max-w-md">
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

                        {/* Filter Controls */}
                        <div className="flex flex-wrap gap-3 items-center justify-start">
                            {/* Category Filter */}
                            <motion.div
                                variants={controlItemVariants}
                                className="flex items-center space-x-2 w-full sm:w-auto"
                            >
                                <Filter className="h-5 w-5 text-gray-500 md:block hidden" />
                                <CustomDropdown
                                    options={[
                                        { label: 'All Categories', value: '' },
                                        ...categories.map((cat) => ({
                                            label: cat.name,
                                            value: cat.id,
                                        })),
                                    ]}
                                    value={selectedCategory}
                                    onChange={setSelectedCategory}
                                    placeholder="All Categories"
                                    className="w-full sm:w-40"
                                />
                            </motion.div>

                            {/* Difficulty Filter */}
                            <div className="w-full sm:w-36">
                                <CustomDropdown
                                    options={[
                                        { label: 'All Levels', value: '' },
                                        ...difficulties.map((diff) => ({
                                            label: diff,
                                            value: diff,
                                        })),
                                    ]}
                                    value={selectedDifficulty}
                                    onChange={setSelectedDifficulty}
                                    placeholder="All Levels"
                                    className="w-full"
                                />
                            </div>

                            {/* Sort Filter */}
                            <div className="w-full sm:w-36">
                                <CustomDropdown
                                    options={[
                                        { label: 'Most Popular', value: 'popular' },
                                        { label: 'Newest', value: 'newest' },
                                        { label: 'Name A-Z', value: 'name' },
                                    ]}
                                    value={sortBy}
                                    onChange={setSortBy}
                                    placeholder="Sort By"
                                    className="w-full"
                                />
                            </div>

                            {/* View Mode Toggle */}
                            <motion.div
                                variants={controlItemVariants}
                                className="flex border border-gray-300 rounded-lg overflow-hidden"
                            >
                                <motion.button
                                    onClick={() => setViewMode('grid')}
                                    variants={viewModeButtonVariants}
                                    animate={viewMode === 'grid' ? 'active' : 'inactive'}
                                    whileHover="hover"
                                    whileTap="tap"
                                    className="p-2"
                                >
                                    <Grid className="h-4 w-4" />
                                </motion.button>
                                <motion.button
                                    onClick={() => setViewMode('list')}
                                    variants={viewModeButtonVariants}
                                    animate={viewMode === 'list' ? 'active' : 'inactive'}
                                    whileHover="hover"
                                    whileTap="tap"
                                    className="p-2"
                                >
                                    <List className="h-4 w-4" />
                                </motion.button>
                            </motion.div>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    <AnimatePresence>
                        {(selectedCategory || selectedDifficulty || searchTerm) && (
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={controlItemVariants}
                                className="mt-4 flex flex-wrap gap-2 items-center"
                            >
                                <span className="text-sm text-gray-600">Active filters:</span>
                                {selectedCategory && (
                                    <motion.span
                                        variants={badgeVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center space-x-1"
                                    >
                                        <span>
                                            {categories.find((cat) => cat.id === selectedCategory)?.name ||
                                                selectedCategory}
                                        </span>
                                        <motion.button
                                            onClick={() => setSelectedCategory('')}
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.8 }}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            ×
                                        </motion.button>
                                    </motion.span>
                                )}
                                {selectedDifficulty && (
                                    <motion.span
                                        variants={badgeVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center space-x-1"
                                    >
                                        <span>{selectedDifficulty}</span>
                                        <motion.button
                                            onClick={() => setSelectedDifficulty('')}
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.8 }}
                                            className="text-green-600 hover:text-green-800"
                                        >
                                            ×
                                        </motion.button>
                                    </motion.span>
                                )}
                                {searchTerm && (
                                    <motion.span
                                        variants={badgeVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs flex items-center space-x-1"
                                    >
                                        <span>"{searchTerm}"</span>
                                        <motion.button
                                            onClick={() => setSearchTerm('')}
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.8 }}
                                            className="text-orange-600 hover:text-orange-800"
                                        >
                                            ×
                                        </motion.button>
                                    </motion.span>
                                )}
                                <motion.button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedCategory('');
                                        setSelectedDifficulty('');
                                        setSortBy('popular');
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="text-sm text-gray-500 hover:text-gray-700 underline ml-2"
                                >
                                    Clear all
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {!isLoading && (
                    <motion.div
                        key={viewMode} // Key change will re-animate children on view mode change
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
                                                    className="w-full h-60 object-cover transition-transform duration-300"
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
                                                <h3 className="text-xl font-semibold text-gray-800 mb-2">{classItem.name}</h3>

                                                {/* Trainer Position for Grid View - Moved Up */}
                                                <div className="mb-4">
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Trainers:</h4>
                                                    <div className="flex -space-x-2">
                                                        {getTrainersForClass(classItem.trainers).map((trainer) => (
                                                            <Link
                                                                key={trainer.id}
                                                                to={`/trainer/${trainer.id}`}
                                                                className="relative"
                                                            >
                                                                <motion.img
                                                                    src={trainer.image} // Use trainer.image from getTrainersForClass
                                                                    alt={trainer.name}
                                                                    className="w-8 h-8 rounded-full border-2 object-cover border-white"
                                                                    title={trainer.name}
                                                                    variants={trainerImageVariants}
                                                                    whileHover="hover"
                                                                    onError={(e) => {
                                                                        console.error("Failed to load trainer image:", trainer.image, e);
                                                                        e.target.src = "https://via.placeholder.com/40?text=No+Img"; // Fallback placeholder
                                                                    }}
                                                                />
                                                            </Link>
                                                        ))}
                                                        {classItem.trainers.length > 5 && (
                                                            <span className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-semibold text-gray-600">
                                                                +{classItem.trainers.length - 5}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-3">
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
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key={classItem._id}
                                            variants={classCardVariants}
                                            custom={index}
                                            whileHover="hover"
                                            className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 transition-shadow duration-300"
                                        >
                                            <motion.img
                                                src={classItem.image}
                                                alt={classItem.name}
                                                className="w-50 h-50 object-cover rounded-lg flex-shrink-0"
                                                variants={cardImageVariants}
                                                whileHover="hover"
                                            />
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold text-gray-800 mb-2">{classItem.name}</h3>
                                                <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium mb-3">
                                                    {categories.find(cat => cat.id === classItem.category)?.name || classItem.category}
                                                </span>

                                                {/* Trainer Position for List View - Moved Up */}
                                                <div className="mb-3">
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Trainers:</h4>
                                                    <div className="flex space-x-2">
                                                        {getTrainersForClass(classItem.trainers).map((trainer) => (
                                                            <Link
                                                                key={trainer.id}
                                                                to={`/trainer/${trainer.id}`}
                                                                className="relative"
                                                            >
                                                                <div className='flex items-center gap-2 bg-gray-100 pr-2.5 pl-1 py-1 rounded-lg'>
                                                                    <motion.img
                                                                        src={trainer.image} // Use trainer.image from getTrainersForClass
                                                                        alt={trainer.name}
                                                                        className="w-8 h-8 rounded-full border-2 object-cover border-white"
                                                                        title={trainer.name}
                                                                        variants={trainerImageVariants}
                                                                        whileHover="hover"
                                                                        onError={(e) => {
                                                                            console.error("Failed to load trainer image:", trainer.image, e);
                                                                            e.target.src = "https://via.placeholder.com/40?text=No+Img"; // Fallback placeholder
                                                                        }}
                                                                    />
                                                                    <span>{trainer.name}</span>
                                                                </div>
                                                            </Link>
                                                        ))}
                                                        {classItem.trainers.length > 5 && (
                                                            <span className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-semibold text-gray-600">
                                                                +{classItem.trainers.length - 5}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <p className="text-gray-600 mb-3 text-sm line-clamp-2">
                                                    {classItem.description}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                                                    <div className="flex items-center space-x-1">
                                                        <Users className="h-4 w-4" />
                                                        <span>{classItem.bookings} joined</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{classItem.duration}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${classItem.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                                                            classItem.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                                                classItem.difficulty === 'Advanced' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {classItem.difficulty}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="col-span-full text-center py-12 text-gray-600 text-lg"
                                >
                                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                    No classes found matching your criteria.
                                    <motion.button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setSelectedCategory('');
                                            setSelectedDifficulty('');
                                            setSortBy('popular');
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
                                    >
                                        Clear All Filters
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                {totalPages > 1 && (
                    <div className="flex justify-between items-center space-x-2 mt-8">
                        <motion.button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            variants={paginationIconButtonVariants}
                            initial="rest"
                            whileHover="hover"
                            whileTap="tap"
                            animate={currentPage === 1 ? 'disabled' : 'rest'}
                            className="p-2 border rounded-lg"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </motion.button>

                        <AnimatePresence mode="wait">
                            <div className="flex space-x-2">
                                {getVisiblePageNumbers().map((pageNumber, index) => (
                                    <motion.button
                                        key={pageNumber === '...' ? `dots-${index}` : pageNumber}
                                        onClick={() => pageNumber !== '...' && setCurrentPage(pageNumber)}
                                        disabled={pageNumber === '...'}
                                        variants={paginationButtonVariants}
                                        initial="rest"
                                        whileHover={pageNumber === '...' ? 'disabled' : 'hover'}
                                        whileTap={pageNumber === '...' ? 'disabled' : 'tap'}
                                        animate={currentPage === pageNumber ? 'active' : 'rest'}
                                        className="px-4 py-2 border rounded-lg text-sm font-medium"
                                    >
                                        {pageNumber}
                                    </motion.button>
                                ))}
                            </div>
                        </AnimatePresence>

                        <motion.button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            variants={paginationIconButtonVariants}
                            initial="rest"
                            whileHover="hover"
                            whileTap="tap"
                            animate={currentPage === totalPages ? 'disabled' : 'rest'}
                            className="p-2 border rounded-lg"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </motion.button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Classes;