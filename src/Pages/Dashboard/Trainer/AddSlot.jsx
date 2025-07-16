import React, { useState, useEffect, useContext, useRef } from 'react';
import { Plus, Clock, Calendar, BookOpen, ChevronDown } from 'lucide-react';
import useAxiosSecure from '../../../Provider/UseAxiosSecure';
import { AuthContext } from '../../../Provider/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Loader from '../../Loader';

const AddSlot = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    const [isDayDropdownOpen, setIsDayDropdownOpen] = useState(false);
    const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);

    const dayDropdownRef = useRef(null);
    const classDropdownRef = useRef(null);

    const [formData, setFormData] = useState({
        slotName: '',
        selectedDay: '',
        slotTime: '',
        duration: '',
        selectedClass: '',
        maxParticipants: '',
        description: ''
    });

    const daysOfWeek = [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
    ];

    // Fetch trainer data directly by email using the query parameter
    const { data: trainerData, isLoading: loadingTrainer, isError: errorTrainerQuery, error: trainerError } = useQuery({
        queryKey: ['trainerData', user?.email],
        queryFn: async () => {
            if (!user?.email) {
                throw new Error("User not logged in or email not available.");
            }
            // Use the backend's /trainers endpoint with email query parameter
            const response = await axiosSecure.get(`/trainers?email=${user.email}`);
            // The backend returns an array, even if only one trainer matches, so take the first element
            const foundTrainer = response.data[0];
            if (!foundTrainer) {
                throw new Error("Trainer profile not found for the logged-in user.");
            }
            return foundTrainer;
        },
        enabled: !!user?.email, // Only run this query if user.email is available
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
    });

    // Fetch all available classes
    const { data: availableClasses = [], isLoading: loadingClasses, isError: errorClassesQuery, error: classesError } = useQuery({
        queryKey: ['availableClasses'],
        queryFn: async () => {
            const response = await axiosSecure.get('/classes');
            return response.data;
        },
        staleTime: 10 * 60 * 1000,
        cacheTime: 15 * 60 * 1000,
    });

    // Mutation to add a new slot
    const addSlotMutation = useMutation({
        mutationFn: async (newSlot) => {
            const response = await axiosSecure.post('/trainers/slots', newSlot);
            return response.data;
        },
        onSuccess: () => {
            alert('New slot added successfully!');
            // Invalidate trainerSlots query to reflect the new slot in ManageSlots page
            queryClient.invalidateQueries(['trainerSlots', user?.email]);
            setFormData({
                slotName: '',
                selectedDay: '',
                slotTime: '',
                duration: '',
                selectedClass: '',
                maxParticipants: '',
                description: ''
            });
        },
        onError: (err) => {
            console.error('Error adding slot:', err);
            if (err.response && err.response.data && err.response.data.message) {
                alert(`Failed to add slot: ${err.response.data.message}`);
            } else {
                alert('Failed to add slot. Please try again later.');
            }
        },
    });

    // Effect to handle clicks outside dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dayDropdownRef.current && !dayDropdownRef.current.contains(event.target)) {
                setIsDayDropdownOpen(false);
            }
            if (classDropdownRef.current && !classDropdownRef.current.contains(event.target)) {
                setIsClassDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle form input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handle custom dropdown selections
    const handleCustomSelectChange = (name, value) => {
        setFormData({
            ...formData,
            [name]: value
        });
        if (name === 'selectedDay') {
            setIsDayDropdownOpen(false);
        } else if (name === 'selectedClass') {
            setIsClassDropdownOpen(false);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!trainerData) {
            alert('Trainer data is not loaded. Cannot add slot.');
            return;
        }

        const newSlot = {
            slotName: formData.slotName,
            slotTime: formData.slotTime,
            days: [formData.selectedDay], // Assuming a single day can be selected
            duration: formData.duration,
            classType: formData.selectedClass,
            maxParticipants: parseInt(formData.maxParticipants) || 10,
            description: formData.description,
            trainerId: trainerData._id, // Pass the trainer's actual MongoDB _id
            email: trainerData.email, // Pass trainer's email for backend verification
        };

        addSlotMutation.mutate(newSlot);
    };

    // Framer Motion variants for animations
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                delayChildren: 0.2,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const dropdownVariants = {
        hidden: { opacity: 0, y: -10, scaleY: 0.95, originY: 0 },
        visible: { opacity: 1, y: 0, scaleY: 1, originY: 0, transition: { duration: 0.2, ease: "easeOut" } },
        exit: { opacity: 0, y: -10, scaleY: 0.95, originY: 0, transition: { duration: 0.15, ease: "easeIn" } }
    };

    // Render loading state
    if (loadingTrainer || loadingClasses) {
        return (
            <Loader />
        );
    }

    // Render error states
    if (errorTrainerQuery) {
        return (
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="text-center py-8 text-red-600"
            >
                <motion.p variants={itemVariants}>Error loading trainer data: {trainerError?.message || "Unknown error."}</motion.p>
            </motion.div>
        );
    }

    if (errorClassesQuery) {
        return (
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="text-center py-8 text-red-600"
            >
                <motion.p variants={itemVariants}>Error loading classes data: {classesError?.message || "Unknown error."}</motion.p>
            </motion.div>
        );
    }

    // Render no trainer data state
    if (!trainerData) {
        return (
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="text-center py-8 text-red-600"
            >
                <motion.p variants={itemVariants}>No trainer data available. Please ensure you are logged in as a trainer.</motion.p>
            </motion.div>
        );
    }

    // Helper function to render trainer avatar
    const renderAvatar = () => {
        const isValidHttpUrl = (str) => {
            let url;
            try {
                url = new URL(str);
            } catch (_) {
                return false;
            }
            return url.protocol === "http:";
        };

        const avatarUrl = trainerData.photoURL;
        const shouldShowImage = avatarUrl && isValidHttpUrl(avatarUrl);

        if (shouldShowImage) {
            return (
                <motion.img
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 200, delay: 0.3 }}
                    src={avatarUrl}
                    alt={trainerData.name || 'Trainer'}
                    className="w-16 h-16 rounded-full object-cover"
                />
            );
        } else {
            const firstLetter = trainerData.name ? trainerData.name.charAt(0).toUpperCase() : '?';
            return (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, type: "spring", stiffness: 200, delay: 0.3 }}
                    className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold"
                    title={trainerData.name || 'Trainer'}
                >
                    {firstLetter}
                </motion.div>
            );
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className='p-6 md:p-8'
        >
            <motion.div variants={itemVariants} className="mb-8">
                <motion.h1
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-3xl font-bold text-gray-800 mb-2"
                >
                    Add New Slot
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-gray-600"
                >
                    Create a new training slot for your schedule.
                </motion.p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-xl shadow-lg p-6 mb-8"
            >
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                    className="text-lg font-semibold text-gray-800 mb-4"
                >
                    Trainer Information
                </motion.h2>
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="flex items-center space-x-4"
                >
                    {renderAvatar()}
                    <div className="flex flex-col">
                        <motion.h3 variants={itemVariants} className="font-semibold text-gray-800">
                            {trainerData.name || 'Trainer Name'}
                        </motion.h3>
                        <motion.p variants={itemVariants} className="text-gray-600">
                            {trainerData.specialization || 'Certified Fitness Trainer'}
                        </motion.p>
                        {/* Note: trainerData.slots.days is not directly available here unless explicitly fetched with trainerData */}
                        <motion.p variants={itemVariants} className="text-sm text-gray-500">
                            Trainer Email: {trainerData.email}
                        </motion.p>
                    </div>
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white rounded-xl shadow-lg p-8"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Slot Name *
                            </label>
                            <input
                                type="text"
                                name="slotName"
                                value={formData.slotName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., Morning Power Session"
                                required
                            />
                        </motion.div>

                        <motion.div variants={itemVariants} className="relative" ref={dayDropdownRef}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Day *
                            </label>
                            <div
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onClick={() => setIsDayDropdownOpen(!isDayDropdownOpen)}
                            >
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <Calendar className="h-5 w-5 text-gray-400" />
                                        <span>{formData.selectedDay || "Choose a day"}</span>
                                    </div>
                                    <ChevronDown className={`h-5 w-5 text-gray-400 transform transition-transform ${isDayDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                                </div>
                            </div>
                            <AnimatePresence>
                                {isDayDropdownOpen && (
                                    <motion.ul
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        variants={dropdownVariants}
                                        className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                                    >
                                        {daysOfWeek.map((day) => (
                                            <li
                                                key={day}
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-800"
                                                onClick={() => handleCustomSelectChange('selectedDay', day)}
                                            >
                                                {day}
                                            </li>
                                        ))}
                                    </motion.ul>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Slot Time *
                            </label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="slotTime"
                                    value={formData.slotTime}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., 9:00 AM - 10:00 AM"
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Duration *
                            </label>
                            <input
                                type="text"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., 1 hour"
                                required
                            />
                        </motion.div>

                        <motion.div variants={itemVariants} className="relative" ref={classDropdownRef}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Class Type *
                            </label>
                            <div
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white flex items-center justify-between cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                            >
                                <div className='flex items-center gap-2'>
                                    <BookOpen className="h-5 w-5 text-gray-400" />
                                    <span>{formData.selectedClass || "Select a class"}</span>
                                </div>
                                <ChevronDown className={`h-5 w-5 text-gray-400 transform transition-transform ${isClassDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                            </div>
                            <AnimatePresence>
                                {isClassDropdownOpen && (
                                    <motion.ul
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        variants={dropdownVariants}
                                        className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                                    >
                                        {availableClasses.map((classItem) => (
                                            <li
                                                key={classItem._id}
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-800"
                                                onClick={() => handleCustomSelectChange('selectedClass', classItem.name)}
                                            >
                                                {classItem.name}
                                            </li>
                                        ))}
                                        {availableClasses.length === 0 && (
                                            <li
                                                className="px-4 py-2 text-gray-500 italic"
                                            >
                                                No classes found.
                                            </li>
                                        )}
                                    </motion.ul>
                                )}
                            </AnimatePresence>
                            {availableClasses.length === 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                    No classes available from backend.
                                </p>
                            )}
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Max Participants
                            </label>
                            <input
                                type="number"
                                name="maxParticipants"
                                value={formData.maxParticipants}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., 10"
                                min="1"
                                max="50"
                            />
                        </motion.div>
                    </motion.div>

                    <motion.div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Describe what this slot includes, any special requirements, or additional information..."
                        />
                    </motion.div>

                    {formData.slotName && formData.selectedDay && formData.slotTime && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.5 }}
                            className="border-t pt-6 overflow-hidden"
                        >
                            <motion.h3
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-lg font-semibold text-gray-800 mb-4"
                            >
                                Preview
                            </motion.h3>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-gray-50 rounded-lg p-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="text-xl font-semibold text-gray-800">{formData.slotName}</h4>
                                        <p className="text-gray-600">{formData.selectedClass || 'Class not selected'}</p>
                                    </div>
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                        Available
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <span>{formData.selectedDay}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <span>{formData.slotTime}</span>
                                    </div>
                                    {formData.duration && (
                                        <div className="flex items-center space-x-2">
                                            <span className="text-gray-500">⏱️</span>
                                            <span>{formData.duration}</span>
                                        </div>
                                    )}
                                    {formData.maxParticipants && (
                                        <div className="flex items-center space-x-2">
                                            <span className="text-gray-500">👥</span>
                                            <span>Max {formData.maxParticipants}</span>
                                        </div>
                                    )}
                                </div>

                                {formData.description && (
                                    <div className="mt-4">
                                        <p className="text-gray-600 text-sm">{formData.description}</p>
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.9 }}
                        className="flex justify-end space-x-4"
                    >
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            onClick={() => setFormData({
                                slotName: '',
                                selectedDay: '',
                                slotTime: '',
                                duration: '',
                                selectedClass: '',
                                maxParticipants: '',
                                description: ''
                            })}
                            disabled={addSlotMutation.isPending}
                        >
                            Reset
                        </motion.button>
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                            disabled={addSlotMutation.isPending}
                        >
                            {addSlotMutation.isPending ? (
                                <>
                                    <span className="animate-spin h-5 w-5 border-t-2 border-r-2 border-white rounded-full"></span>
                                    <span>Adding Slot...</span>
                                </>
                            ) : (
                                <>
                                    <Plus className="h-5 w-5" />
                                    <span>Add Slot</span>
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default AddSlot;
