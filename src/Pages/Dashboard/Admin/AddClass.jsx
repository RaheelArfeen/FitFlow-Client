import React, { useContext, useState } from 'react';
import { Plus, Image, FileText, Users, Clock, Target, Award, AlertCircle, Info, LayoutList, CalendarClock, Calendar, Dumbbell } from 'lucide-react';
import { AuthContext } from '../../../Provider/AuthProvider';
import useAxiosSecure from '../../../Provider/UseAxiosSecure';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const AddClass = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        name: '',
        image: '',
        description: '',
        duration: '',
        difficulty: 'Beginner', // Default selected
        category: '',
        startTime: '',
        endTime: '',
        equipment: '',
        prerequisites: '',
        benefits: '',
        schedule: '',
        trainers: []
    });

    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;

    // --- NEW STATE FOR VALIDATION ---
    const [submittedAttempt, setSubmittedAttempt] = useState(false); // Tracks if form submission was attempted
    const [errors, setErrors] = useState({}); // Stores validation error messages for fields

    const categories = [
        { id: 'Yoga & Mindfulness', name: 'Yoga & Mindfulness', description: 'Focuses on Yoga & Mindfulness.' },
        { id: 'Pilates', name: 'Pilates', description: 'Core strength and stability' },
        { id: 'HIIT', name: 'HIIT', description: 'High-Intensity Interval Training' },
        { id: 'Strength', name: 'Strength Training', description: 'Build muscle and power' },
        { id: 'Cardio', name: 'Cardio', description: 'Cardiovascular fitness' },
        { id: 'Boxing', name: 'Combat Sports', description: 'Combat sports training' },
        { id: 'Dance', name: 'Dance Fitness', description: 'Fun rhythmic workouts' },
        { id: 'CrossFit', name: 'CrossFit', description: 'Functional fitness' },
        { id: 'Meditation', name: 'Meditation', description: 'Focuses on Meditation.' },
        { id: 'Nutrition Coaching', name: 'Nutrition Coaching', description: 'Focuses on Nutrition Coaching.' }
    ];

    const difficultyLevels = [
        { id: 'Beginner', name: 'Beginner', description: 'Perfect for newcomers', color: 'bg-green-100 text-green-800 dark:bg-green-600 dark:text-white' },
        { id: 'Intermediate', name: 'Intermediate', description: 'Some experience required', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-white' },
        { id: 'Advanced', name: 'Advanced', description: 'For experienced athletes', color: 'bg-red-100 text-red-800 dark:bg-red-600 dark:text-white' },
        { id: 'All Levels', name: 'All Levels', description: 'Suitable for everyone', color: 'bg-blue-100 text-blue-800 dark:bg-blue-600 dark:text-white' }
    ];

    const { data: allTrainers = [], isLoading: trainersLoading, isError: trainersError } = useQuery({
        queryKey: ['trainers'],
        queryFn: async () => {
            const res = await axiosSecure.get('/trainers');
            return res.data;
        },
        staleTime: 5 * 60 * 1000,
        cacheTime: 30 * 60 * 1000,
    });

    const filteredTrainers = formData.category
        ? allTrainers.filter(trainer =>
            trainer.specialization?.includes(formData.category) && trainer.status === 'accepted'
        )
        : [];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (submittedAttempt && errors[name]) {
            setErrors(prevErrors => ({ ...prevErrors, [name]: undefined }));
        }
    };

    const handleTrainerToggle = (trainer) => {
        setFormData(prev => {
            const isSelected = prev.trainers.some(t => t._id === trainer._id);
            const newTrainers = isSelected
                ? prev.trainers.filter(t => t._id !== trainer._id)
                : [...prev.trainers, trainer];

            if (submittedAttempt && errors.trainers && newTrainers.length > 0) {
                setErrors(prevErrors => ({ ...prevErrors, trainers: undefined }));
            }
            return {
                ...prev,
                trainers: newTrainers
            };
        });
    };

    const addClassMutation = useMutation({
        mutationFn: async (newClassData) => {
            const res = await axiosSecure.post('/classes', newClassData);
            return res.data;
        },
        onSuccess: () => {
            toast.success('New class added successfully!');
            queryClient.invalidateQueries(['classes']);
            setFormData({
                name: '',
                image: '',
                description: '',
                duration: '',
                difficulty: 'Beginner',
                category: '',
                startTime: '',
                endTime: '',
                equipment: '',
                prerequisites: '',
                benefits: '',
                schedule: '',
                trainers: []
            });
            setCurrentStep(1);
            setSubmittedAttempt(false);
            setErrors({});
        },
        onError: (error) => {
            console.error('Failed to add class:', error.response?.data || error.message);
            toast.error(`Failed to add class: ${error.response?.data?.message || error.message}`);
        }
    });

    const validateCurrentStep = () => {
        let currentStepErrors = {};
        let isValid = true;

        switch (currentStep) {
            case 1:
                if (!formData.name.trim()) {
                    currentStepErrors.name = "Class Name is required.";
                    isValid = false;
                }
                if (!formData.category.trim()) {
                    currentStepErrors.category = "Category is required.";
                    isValid = false;
                }
                break;
            case 2:
                if (!formData.description.trim()) {
                    currentStepErrors.description = "Class description is required.";
                    isValid = false;
                }
                if (!formData.duration.trim()) {
                    currentStepErrors.duration = "Duration is required.";
                    isValid = false;
                } else if (isNaN(formData.duration) || parseFloat(formData.duration) <= 0) {
                    currentStepErrors.duration = "Duration must be a positive number (e.g., minutes).";
                    isValid = false;
                }
                if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
                    currentStepErrors.timeRange = "Start time must be before end time.";
                    toast.error("Start time must be before end time.");
                    isValid = false;
                }
                if (formData.trainers.length === 0) {
                    currentStepErrors.trainers = "At least one trainer must be selected.";
                    isValid = false;
                }
                break;
            case 3:
                if (!formData.image.trim()) {
                    currentStepErrors.image = "Class image URL is required.";
                    isValid = false;
                }
                break;
            default:
                break;
        }

        setErrors(currentStepErrors);
        return isValid;
    };

    const nextStep = () => {
        setSubmittedAttempt(true);
        if (validateCurrentStep()) {
            if (currentStep < totalSteps) {
                setCurrentStep(currentStep + 1);
                setSubmittedAttempt(false);
                setErrors({});
            }
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setSubmittedAttempt(false);
            setErrors({});
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmittedAttempt(true);

        const isValid = validateCurrentStep();

        if (!isValid) {
            console.log(`Validation failed for Step ${currentStep}.`);
            return;
        }

        if (currentStep < totalSteps) {
            nextStep();
            return;
        }

        console.log("Validation passed for the final step. Preparing to submit class data.");

        const selectedTrainersData = formData.trainers.map(trainer => ({
            id: trainer._id,
            name: trainer.name,
            email: trainer.email,
            photoURL: trainer.photoURL,
            specialization: trainer.specialization,
            bookingsCount: trainer.slots?.reduce((acc, slot) => acc + (slot.bookingCount || 0), 0) || 0
        }));

        const newClass = {
            name: formData.name,
            image: formData.image,
            description: formData.description,
            duration: parseFloat(formData.duration),
            difficulty: formData.difficulty,
            category: formData.category,
            startTime: formData.startTime || null,
            endTime: formData.endTime || null,
            equipment: formData.equipment.trim() || null,
            prerequisites: formData.prerequisites.trim() || null,
            benefits: formData.benefits.trim() || null,
            schedule: formData.schedule.trim() || null,
            bookings: 0,
            createdBy: user?.email,
            createdAt: new Date().toISOString(),
            trainers: selectedTrainersData,
        };

        console.log("Attempting to add new class:", newClass);
        addClassMutation.mutate(newClass);
    };

    const formVariants = {
        hidden: { opacity: 0, x: -100 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 100 },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200 min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Add New Class</h1>
                <p className="text-gray-600 dark:text-gray-400">Create an engaging fitness class for your members to enjoy.</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
            >
                <div className="flex items-center justify-between mb-6">
                    {[1, 2, 3].map((step) => (
                        <React.Fragment key={step}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: step * 0.1 }}
                                className="flex items-center"
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${currentStep >= step
                                    ? 'bg-blue-700 text-white'
                                    : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                    }`}>
                                    {step}
                                </div>
                                <div className="ml-3">
                                    <div className={`font-medium ${currentStep >= step ? 'text-blue-700 dark:text-blue-500' : 'text-gray-600 dark:text-gray-400'}`}>
                                        {step === 1 && 'Basic Info'}
                                        {step === 2 && 'Details & Trainers'}
                                        {step === 3 && 'Media & Finish'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {step === 1 && 'Name, category, difficulty'}
                                        {step === 2 && 'Description, duration, trainers'}
                                        {step === 3 && 'Images and final review'}
                                    </div>
                                </div>
                            </motion.div>
                            {step < totalSteps && (
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: 'auto' }}
                                    transition={{ duration: 0.5, delay: step * 0.1 + 0.2 }}
                                    className={`flex-1 h-1 mx-4 ${currentStep > step ? 'bg-blue-700' : 'bg-gray-200 dark:bg-gray-700'
                                        }`}
                                ></motion.div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
            >
                <form onSubmit={handleSubmit}>
                    <AnimatePresence mode="wait">
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                variants={formVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                transition={{ duration: 0.5 }}
                                className="space-y-6"
                            >
                                <motion.div variants={itemVariants} transition={{ delay: 0.1 }} className="text-center mb-8">
                                    <Info className="h-12 w-12 text-blue-700 dark:text-blue-500 mx-auto mb-4" />
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Basic Class Information</h2>
                                    <p className="text-gray-600 dark:text-gray-400">Let's start with the fundamentals of your class</p>
                                </motion.div>

                                <motion.div variants={itemVariants} transition={{ delay: 0.2 }}>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Class Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border ${submittedAttempt && errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400`}
                                        placeholder="e.g., Morning Power Yoga, HIIT Bootcamp"
                                        required
                                    />
                                    {submittedAttempt && errors.name && (
                                        <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">Choose a catchy, descriptive name that attracts members</p>
                                </motion.div>

                                <motion.div variants={itemVariants} transition={{ delay: 0.3 }}>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Category *
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {categories.map((cat) => (
                                            <motion.div
                                                key={cat.id}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${formData.category === cat.id
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:text-gray-50'
                                                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:hover:border-gray-600'
                                                    } text-gray-800 dark:text-gray-300`}
                                                onClick={() => {
                                                    setFormData({ ...formData, category: cat.id, trainers: [] });
                                                    if (submittedAttempt && errors.category) {
                                                        setErrors(prevErrors => ({ ...prevErrors, category: undefined }));
                                                    }
                                                }}
                                            >
                                                <div className="font-medium text-current">{cat.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{cat.description}</div>
                                            </motion.div>
                                        ))}
                                    </div>
                                    {submittedAttempt && errors.category && (
                                        <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                                    )}
                                </motion.div>

                                <motion.div variants={itemVariants} transition={{ delay: 0.4 }}>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Difficulty Level *
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {difficultyLevels.map((level) => (
                                            <motion.div
                                                key={level.id}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${formData.difficulty === level.id
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:text-gray-50'
                                                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:hover:border-gray-600'
                                                    } text-gray-800 dark:text-gray-300`}
                                                onClick={() => {
                                                    setFormData({ ...formData, difficulty: level.id });
                                                    if (submittedAttempt && errors.difficulty) {
                                                        setErrors(prevErrors => ({ ...prevErrors, difficulty: undefined }));
                                                    }
                                                }}
                                            >
                                                <div className="font-medium text-current">{level.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{level.description}</div>
                                                <span className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${level.color}`}>
                                                    {level.name}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                    {submittedAttempt && errors.difficulty && (
                                        <p className="text-red-500 text-xs mt-1">{errors.difficulty}</p>
                                    )}
                                </motion.div>
                            </motion.div>
                        )}

                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                variants={formVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                transition={{ duration: 0.5 }}
                                className="space-y-6"
                            >
                                <motion.div variants={itemVariants} transition={{ delay: 0.1 }} className="text-center mb-8">
                                    <LayoutList className="h-12 w-12 text-blue-700 dark:text-blue-500 mx-auto mb-4" />
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Class Details & Trainers</h2>
                                    <p className="text-gray-600 dark:text-gray-400">Provide comprehensive information about your class</p>
                                </motion.div>

                                <motion.div variants={itemVariants} transition={{ delay: 0.2 }}>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Class Description *
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        className={`w-full px-4 py-3 border ${submittedAttempt && errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400`}
                                        placeholder="Describe what participants can expect, the workout style, and what makes this class special..."
                                        required
                                    />
                                    {submittedAttempt && errors.description && (
                                        <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">Be detailed and engaging to attract the right participants</p>
                                </motion.div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <motion.div variants={itemVariants} transition={{ delay: 0.3 }}>
                                        <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Duration (in minutes) *
                                        </label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="number"
                                                id="duration"
                                                name="duration"
                                                value={formData.duration}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-4 py-3 border ${submittedAttempt && errors.duration ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400`}
                                                placeholder="e.g., 45, 60"
                                                required
                                                min="1"
                                            />
                                            {submittedAttempt && errors.duration && (
                                                <p className="text-red-500 text-xs mt-1">{errors.duration}</p>
                                            )}
                                        </div>
                                    </motion.div>

                                    <motion.div variants={itemVariants} transition={{ delay: 0.4 }}>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Class Time Range
                                        </label>
                                        <div className="flex space-x-2">
                                            <div className="relative flex-1">
                                                <CalendarClock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="time"
                                                    id="startTime"
                                                    name="startTime"
                                                    value={formData.startTime}
                                                    onChange={handleChange}
                                                    className={`w-full pl-10 pr-4 py-3 border ${submittedAttempt && errors.timeRange ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400`}
                                                    title="Start Time"
                                                />
                                            </div>
                                            <div className="relative flex-1">
                                                <CalendarClock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="time"
                                                    id="endTime"
                                                    name="endTime"
                                                    value={formData.endTime}
                                                    onChange={handleChange}
                                                    className={`w-full pl-10 pr-4 py-3 border ${submittedAttempt && errors.timeRange ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400`}
                                                    title="End Time"
                                                />
                                            </div>
                                        </div>
                                        {submittedAttempt && errors.timeRange && (
                                            <p className="text-red-500 text-xs mt-1">{errors.timeRange}</p>
                                        )}
                                    </motion.div>
                                </div>

                                <motion.div variants={itemVariants} transition={{ delay: 0.5 }}>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Assign Trainers * (Select at least one)
                                        {formData.category && <span className="ml-2 text-xs text-gray-500 dark:text-gray-500">(Filtered by "{formData.category}" specialization)</span>}
                                    </label>
                                    {trainersLoading && (
                                        <div className="flex items-center justify-center py-4 text-gray-500 dark:text-gray-400">
                                            <svg className="animate-spin h-5 w-5 mr-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Loading trainers...
                                        </div>
                                    )}
                                    {trainersError && <p className="text-red-500 flex items-center"><AlertCircle className="h-4 w-4 mr-1" /> Error loading trainers. Please try again.</p>}
                                    {!formData.category && <p className="text-gray-500 dark:text-gray-500">Please select a category first to see relevant trainers.</p>}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {filteredTrainers.length > 0 ? (
                                            filteredTrainers.map((trainer) => (
                                                <motion.div
                                                    key={trainer._id}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${formData.trainers.some(t => t._id === trainer._id)
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:text-gray-50'
                                                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:hover:border-gray-600'
                                                        } text-gray-800 dark:text-gray-300`}
                                                    onClick={() => handleTrainerToggle(trainer)}
                                                >
                                                    <div className="font-medium text-current text-sm">{trainer.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Specialization: {trainer.specialization}</div>
                                                    {formData.trainers.some(t => t._id === trainer._id) && (
                                                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">✓ Selected</div>
                                                    )}
                                                </motion.div>
                                            ))
                                        ) : (
                                            formData.category && !trainersLoading && <p className="text-gray-500 dark:text-gray-500">No trainers found for this category.</p>
                                        )}
                                    </div>
                                    {submittedAttempt && errors.trainers && (
                                        <p className="text-red-500 text-xs mt-1">{errors.trainers}</p>
                                    )}
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                        Selected trainers: {formData.trainers.length > 0 ? formData.trainers.map(t => t.name).join(', ') : 'None'}
                                    </p>
                                </motion.div>

                                <motion.div variants={itemVariants} transition={{ delay: 0.6 }}>
                                    <label htmlFor="equipment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Equipment Needed
                                    </label>
                                    <input
                                        type="text"
                                        id="equipment"
                                        name="equipment"
                                        value={formData.equipment}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                        placeholder="e.g., Yoga mat, dumbbells, resistance bands (or 'None' if no equipment needed)"
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants} transition={{ delay: 0.7 }}>
                                    <label htmlFor="prerequisites" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Prerequisites
                                    </label>
                                    <textarea
                                        id="prerequisites"
                                        name="prerequisites"
                                        value={formData.prerequisites}
                                        onChange={handleChange}
                                        rows={2}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                        placeholder="Any requirements or recommendations for participants (e.g., basic fitness level, previous experience)"
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants} transition={{ delay: 0.8 }}>
                                    <label htmlFor="benefits" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Class Benefits
                                    </label>
                                    <textarea
                                        id="benefits"
                                        name="benefits"
                                        value={formData.benefits}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                        placeholder="What will participants gain from this class? (e.g., improved strength, flexibility, stress relief)"
                                    />
                                </motion.div>
                            </motion.div>
                        )}

                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                variants={formVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                transition={{ duration: 0.5 }}
                                className="space-y-6"
                            >
                                <motion.div variants={itemVariants} transition={{ delay: 0.1 }} className="text-center mb-8">
                                    <Image className="h-12 w-12 text-blue-700 dark:text-blue-500 mx-auto mb-4" />
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Media & Final Review</h2>
                                    <p className="text-gray-600 dark:text-gray-400">Add visuals and review your class details</p>
                                </motion.div>

                                <motion.div variants={itemVariants} transition={{ delay: 0.2 }}>
                                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Class Image URL *
                                    </label>
                                    <input
                                        type="url"
                                        id="image"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border ${submittedAttempt && errors.image ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400`}
                                        placeholder="https://example.com/class-image.jpg"
                                        required
                                    />
                                    {submittedAttempt && errors.image && (
                                        <p className="text-red-500 text-xs mt-1">{errors.image}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">Use a high-quality image that represents your class</p>
                                </motion.div>

                                <motion.div variants={itemVariants} transition={{ delay: 0.3 }}>
                                    <label htmlFor="schedule" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Additional Schedule Information
                                    </label>
                                    <textarea
                                        id="schedule"
                                        name="schedule"
                                        value={formData.schedule}
                                        onChange={handleChange}
                                        rows={2}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                        placeholder="Any other recurring schedule details? (e.g., Every Monday, First Tuesday of the month)"
                                    />
                                </motion.div>

                                {formData.name && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5, delay: 0.4 }}
                                        className="border-t border-gray-200 dark:border-gray-700 pt-6"
                                    >
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                                            <Award className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-400" />
                                            Class Preview
                                        </h3>
                                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                                            <div className="flex items-start space-x-4">
                                                {formData.image && (
                                                    <motion.img
                                                        src={formData.image}
                                                        alt={formData.name}
                                                        className="w-32 h-32 object-cover rounded-lg"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ duration: 0.5 }}
                                                        onError={(e) => {
                                                            e.target.src = 'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=200';
                                                        }}
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h4 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{formData.name}</h4>
                                                        {formData.difficulty && (
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyLevels.find(d => d.id === formData.difficulty)?.color
                                                                }`}>
                                                                {formData.difficulty}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {formData.category && (
                                                        <span className="inline-block bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded text-sm mb-2">
                                                            {categories.find(c => c.id === formData.category)?.name}
                                                        </span>
                                                    )}
                                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{formData.description}</p>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                        {formData.duration && <span className='flex items-center gap-1'><Clock size={18} /> {formData.duration} minutes</span>}
                                                        {(formData.startTime && formData.endTime) && <span className='flex items-center gap-1'><Calendar size={18} /> {formData.startTime} - {formData.endTime}</span>}
                                                        {formData.equipment && <span className='flex items-center gap-1'><Dumbbell size={18} /> {formData.equipment}</span>}
                                                    </div>
                                                    {formData.trainers.length > 0 && (
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            <strong>Trainers:</strong> {formData.trainers.map(t => t.name).join(', ')}
                                                        </div>
                                                    )}
                                                    {formData.schedule && (
                                                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                            <strong>Schedule Notes:</strong> {formData.schedule}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div>
                            {currentStep > 1 && (
                                <motion.button
                                    type="button"
                                    onClick={prevStep}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    Previous
                                </motion.button>
                            )}
                        </div>

                        <div className="flex items-center space-x-4">
                            {currentStep < totalSteps ? (
                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                                >
                                    <span>Next Step</span>
                                    <span>→</span>
                                </motion.button>
                            ) : (
                                <motion.button
                                    type="submit"
                                    disabled={addClassMutation.isLoading}
                                    whileHover={{ scale: addClassMutation.isLoading ? 1 : 1.05 }}
                                    whileTap={{ scale: addClassMutation.isLoading ? 1 : 0.95 }}
                                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 disabled:bg-gray-400"
                                >
                                    {addClassMutation.isLoading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Adding Class...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-5 w-5" />
                                            <span>Add Class</span>
                                        </>
                                    )}
                                </motion.button>
                            )}
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AddClass;