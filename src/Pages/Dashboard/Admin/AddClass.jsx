import React, { useContext, useEffect, useState, useMemo } from 'react';
import { Plus, Image, FileText, Users, Clock, Target, Award, AlertCircle } from 'lucide-react';
import { AuthContext } from '../../../Provider/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../Provider/UseAxiosSecure';
import { motion, AnimatePresence } from 'framer-motion'; // Import motion and AnimatePresence

const AddNewClass = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();

    const [formData, setFormData] = useState({
        name: '',
        image: '',
        description: '',
        duration: '',
        difficulty: 'Beginner',
        category: '',
        maxParticipants: '',
        equipment: '',
        prerequisites: '',
        benefits: '',
        schedule: '',
        trainers: []
    });

    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;

    const categories = [
        { id: 'HIIT', name: 'HIIT', description: 'High-Intensity Interval Training' },
        { id: 'YogaMindfulness', name: 'Yoga & Mindfulness', description: 'Flexibility, balance, and mental clarity' },
        { id: 'Strength', name: 'Strength Training', description: 'Build muscle and power' },
        { id: 'Cardio', name: 'Cardio', description: 'Cardiovascular fitness' },
        { id: 'Pilates', name: 'Pilates', description: 'Core strength and stability' },
        { id: 'Dance', name: 'Dance Fitness', description: 'Fun rhythmic workouts' },
        { id: 'Boxing', name: 'Boxing', description: 'Combat sports training' },
        { id: 'CrossFit', name: 'CrossFit', description: 'Functional fitness' },
        { id: 'Meditation', name: 'Meditation', description: 'Calm your mind and reduce stress' },
        { id: 'Nutrition', name: 'Nutrition Coaching', description: 'Guidance for healthy eating and diets' }
    ];

    const difficultyLevels = [
        { id: 'Beginner', name: 'Beginner', description: 'Perfect for newcomers', color: 'bg-green-100 text-green-800' },
        { id: 'Intermediate', name: 'Intermediate', description: 'Some experience required', color: 'bg-yellow-100 text-yellow-800' },
        { id: 'Advanced', name: 'Advanced', description: 'For experienced athletes', color: 'bg-red-100 text-red-800' },
        { id: 'All Levels', name: 'All Levels', description: 'Suitable for everyone', color: 'bg-blue-100 text-blue-800' }
    ];

    const { data: allTrainers = [], isLoading: trainersLoading, isError: trainersError } = useQuery({
        queryKey: ['trainers'],
        queryFn: async () => {
            try {
                const res = await axiosSecure.get('/trainers');
                return res.data;
            } catch (error) {
                console.error("Error fetching trainers:", error);
                throw new Error("Could not fetch trainers.");
            }
        },
        enabled: !!axiosSecure,
    });

    const filteredTrainers = useMemo(() => {
        if (!formData.category || allTrainers.length === 0) {
            return allTrainers.map(trainer => trainer.name);
        }
        const selectedCategoryName = categories.find(cat => cat.id === formData.category)?.name;
        if (!selectedCategoryName) {
            return allTrainers.map(trainer => trainer.name);
        }
        return allTrainers
            .filter(trainer =>
                trainer.specialization && trainer.specialization.includes(selectedCategoryName)
            )
            .map(trainer => trainer.name);
    }, [formData.category, allTrainers, categories]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleTrainerToggle = (trainerName) => {
        setFormData((prev) => ({
            ...prev,
            trainers: prev.trainers.includes(trainerName)
                ? prev.trainers.filter((t) => t !== trainerName)
                : [...prev.trainers, trainerName]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newClass = {
            id: Date.now().toString(),
            ...formData,
            bookings: 0,
            rating: 0,
            createdBy: user?.role || 'admin',
            createdAt: new Date().toISOString()
        };

        try {
            const res = await axiosSecure.post('/classes', newClass);
            if (res.status === 200 || res.status === 201) {
                alert('New class added successfully!');
                setFormData({
                    name: '',
                    image: '',
                    description: '',
                    duration: '',
                    difficulty: 'Beginner',
                    category: '',
                    maxParticipants: '',
                    equipment: '',
                    prerequisites: '',
                    benefits: '',
                    schedule: '',
                    trainers: []
                });
                setCurrentStep(1);
            } else {
                alert('Failed to add class. Please try again.');
            }
        } catch (error) {
            console.error("Error adding class:", error);
            alert('Failed to add class. Please try again.');
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [currentStep]);

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const isStepValid = (step) => {
        switch (step) {
            case 1:
                return formData.name && formData.category && formData.difficulty;
            case 2:
                return formData.description && formData.duration && formData.trainers.length > 0;
            case 3:
                return formData.image;
            default:
                return false;
        }
    };

    // Animation variants for step transitions
    const stepVariants = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
        exit: { opacity: 0, x: -50, transition: { duration: 0.5, ease: "easeOut" } }
    };

    // Animation variants for individual elements (e.g., categories, difficulties, trainers)
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Add New Class</h1>
                <p className="text-gray-600">Create an engaging fitness class for your members to enjoy.</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    {[1, 2, 3].map((step) => (
                        <motion.div
                            key={step}
                            className="flex items-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: step * 0.1 }}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${currentStep >= step
                                ? 'bg-blue-700 text-white'
                                : 'bg-gray-200 text-gray-600'
                                }`}>
                                {step}
                            </div>
                            <div className="ml-3">
                                <div className={`font-medium ${currentStep >= step ? 'text-blue-700' : 'text-gray-600'}`}>
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
                            {step < 3 && (
                                <div className={`flex-1 h-1 mx-4 ${currentStep > step ? 'bg-blue-700' : 'bg-gray-200'
                                    }`}></div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
                <form onSubmit={handleSubmit}>
                    <AnimatePresence mode="wait"> {/* Use AnimatePresence for exit animations */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                variants={stepVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-6"
                            >
                                <div className="text-center mb-8">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                    >
                                        <Target className="h-12 w-12 text-blue-700 mx-auto mb-4" />
                                    </motion.div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Basic Class Information</h2>
                                    <p className="text-gray-600">Let's start with the fundamentals of your class</p>
                                </div>

                                <motion.div variants={itemVariants}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Class Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., Morning Power Yoga, HIIT Bootcamp"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Choose a catchy, descriptive name that attracts members</p>
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Category *
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {categories.map((cat) => (
                                            <motion.div
                                                key={cat.id}
                                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${formData.category === cat.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                onClick={() => {
                                                    setFormData({ ...formData, category: cat.id, trainers: [] });
                                                }}
                                                whileHover={{ scale: 1.02, boxShadow: "0px 5px 10px rgba(0,0,0,0.1)" }}
                                                whileTap={{ scale: 0.98 }}
                                                variants={itemVariants}
                                            >
                                                <div className="font-medium text-gray-800">{cat.name}</div>
                                                <div className="text-xs text-gray-500 mt-1">{cat.description}</div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Difficulty Level *
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {difficultyLevels.map((level) => (
                                            <motion.div
                                                key={level.id}
                                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${formData.difficulty === level.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                onClick={() => setFormData({ ...formData, difficulty: level.id })}
                                                whileHover={{ scale: 1.02, boxShadow: "0px 5px 10px rgba(0,0,0,0.1)" }}
                                                whileTap={{ scale: 0.98 }}
                                                variants={itemVariants}
                                            >
                                                <div className="font-medium text-gray-800">{level.name}</div>
                                                <div className="text-xs text-gray-500 mt-1">{level.description}</div>
                                                <span className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${level.color}`}>
                                                    {level.name}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}

                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                variants={stepVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-6"
                            >
                                <div className="text-center mb-8">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                    >
                                        <FileText className="h-12 w-12 text-blue-700 mx-auto mb-4" />
                                    </motion.div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Class Details & Trainers</h2>
                                    <p className="text-gray-600">Provide comprehensive information about your class</p>
                                </div>

                                <motion.div variants={itemVariants}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Class Description *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Describe what participants can expect, the workout style, and what makes this class special..."
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Be detailed and engaging to attract the right participants</p>
                                </motion.div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <motion.div variants={itemVariants}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Duration *
                                        </label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                name="duration"
                                                value={formData.duration}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="e.g., 45 minutes, 1 hour"
                                                required
                                            />
                                        </div>
                                    </motion.div>

                                    <motion.div variants={itemVariants}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Max Participants
                                        </label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="number"
                                                name="maxParticipants"
                                                value={formData.maxParticipants}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="e.g., 20"
                                                min="1"
                                                max="100"
                                            />
                                        </div>
                                    </motion.div>
                                </div>

                                <motion.div variants={itemVariants}>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Assign Trainers * (Select at least one)
                                    </label>
                                    {trainersLoading && <p className="text-gray-600">Loading trainers...</p>}
                                    {trainersError && <p className="text-red-600">Error loading trainers: {trainersError.message}</p>}
                                    {!trainersLoading && !trainersError && (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {filteredTrainers.length > 0 ? (
                                                filteredTrainers.map((trainerName) => (
                                                    <motion.div
                                                        key={trainerName}
                                                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${formData.trainers.includes(trainerName)
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                        onClick={() => handleTrainerToggle(trainerName)}
                                                        whileHover={{ scale: 1.02, boxShadow: "0px 5px 10px rgba(0,0,0,0.05)" }}
                                                        whileTap={{ scale: 0.98 }}
                                                        variants={itemVariants}
                                                    >
                                                        <div className="font-medium text-gray-800 text-sm">{trainerName}</div>
                                                        {formData.trainers.includes(trainerName) && (
                                                            <div className="text-xs text-blue-600 mt-1">✓ Selected</div>
                                                        )}
                                                    </motion.div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 col-span-full">No trainers available for this category or no category selected.</p>
                                            )}
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500 mt-2">
                                        Selected trainers: {formData.trainers.length > 0 ? formData.trainers.join(', ') : 'None'}
                                    </p>
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Equipment Needed
                                    </label>
                                    <input
                                        type="text"
                                        name="equipment"
                                        value={formData.equipment}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., Yoga mat, dumbbells, resistance bands (or 'None' if no equipment needed)"
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Prerequisites
                                    </label>
                                    <textarea
                                        name="prerequisites"
                                        value={formData.prerequisites}
                                        onChange={handleChange}
                                        rows={2}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Any requirements or recommendations for participants (e.g., basic fitness level, previous experience)"
                                    />
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Class Benefits
                                    </label>
                                    <textarea
                                        name="benefits"
                                        value={formData.benefits}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="What will participants gain from this class? (e.g., improved strength, flexibility, stress relief)"
                                    />
                                </motion.div>
                            </motion.div>
                        )}

                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                variants={stepVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="space-y-6"
                            >
                                <div className="text-center mb-8">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                    >
                                        <Image className="h-12 w-12 text-blue-700 mx-auto mb-4" />
                                    </motion.div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Media & Final Review</h2>
                                    <p className="text-gray-600">Add visuals and review your class details</p>
                                </div>

                                <motion.div variants={itemVariants}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Class Image URL *
                                    </label>
                                    <input
                                        type="url"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://example.com/class-image.jpg"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Use a high-quality image that represents your class</p>
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Schedule Information
                                    </label>
                                    <textarea
                                        name="schedule"
                                        value={formData.schedule}
                                        onChange={handleChange}
                                        rows={2}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="When will this class be available? (e.g., Mondays and Wednesdays at 7 PM, Daily at 6 AM)"
                                    />
                                </motion.div>

                                {formData.name && (
                                    <motion.div variants={itemVariants} className="border-t pt-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                            <Award className="h-5 w-5 mr-2 text-orange-600" />
                                            Class Preview
                                        </h3>
                                        <div className="bg-gray-50 rounded-lg p-6">
                                            <div className="flex items-start space-x-4">
                                                {formData.image && (
                                                    <motion.img
                                                        src={formData.image}
                                                        alt={formData.name}
                                                        className="w-32 h-32 object-cover rounded-lg"
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ duration: 0.5 }}
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h4 className="text-xl font-semibold text-gray-800">{formData.name}</h4>
                                                        {formData.difficulty && (
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyLevels.find(d => d.id === formData.difficulty)?.color
                                                                }`}>
                                                                {formData.difficulty}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {formData.category && (
                                                        <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm mb-2">
                                                            {categories.find(c => c.id === formData.category)?.name}
                                                        </span>
                                                    )}
                                                    <p className="text-gray-600 text-sm mb-3">{formData.description}</p>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                                                        {formData.duration && <span>⏱️ {formData.duration}</span>}
                                                        {formData.maxParticipants && <span>👥 Max {formData.maxParticipants}</span>}
                                                        {formData.equipment && <span>🏋️ {formData.equipment}</span>}
                                                    </div>
                                                    {formData.trainers.length > 0 && (
                                                        <div className="text-sm text-gray-600">
                                                            <strong>Trainers:</strong> {formData.trainers.join(', ')}
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

                    <div className="flex justify-between items-center mt-8 pt-6 border-t">
                        <div>
                            {currentStep > 1 && (
                                <motion.button
                                    type="button"
                                    onClick={prevStep}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Previous
                                </motion.button>
                            )}
                        </div>

                        <div className="flex items-center space-x-4">
                            {currentStep < totalSteps ? (
                                <motion.button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={!isStepValid(currentStep)}
                                    className="bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <span>Next Step</span>
                                    <span>→</span>
                                </motion.button>
                            ) : (
                                <motion.button
                                    type="submit"
                                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Plus className="h-5 w-5" />
                                    <span>Create Class</span>
                                </motion.button>
                            )}
                        </div>
                    </div>

                    <motion.div
                        className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                    >
                        <div className="flex items-start space-x-2">
                            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Tips for creating a successful class:</p>
                                <ul className="space-y-1 text-blue-700">
                                    <li>• Use clear, engaging descriptions that highlight benefits</li>
                                    <li>• Choose appropriate difficulty levels for your target audience</li>
                                    <li>• Include high-quality images that represent the class accurately</li>
                                    <li>• Assign qualified trainers who specialize in this type of workout</li>
                                    <li>• Be specific about equipment and prerequisites</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </form>
            </div>
        </div>
    );
};

export default AddNewClass;