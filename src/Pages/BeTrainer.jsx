import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import Loader from './Loader';
import { motion, AnimatePresence } from 'framer-motion';
import useAxiosSecure from '../Provider/UseAxiosSecure';
import { AuthContext } from '../Provider/AuthProvider';
import Select from 'react-select';
import { Title } from 'react-head';

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.12,
        },
    },
};

const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const fadeSlideUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

const BeTrainer = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();

    const certificationOptions = [
        'RYT-200',
        'RYT-500',
        'Mindfulness Coach',
        'CPR Certified',
        'Nutrition Coach',
    ];

    const specializationOptions = [
        { value: 'Yoga & Mindfulness', label: 'Yoga & Mindfulness' },
        { value: 'Pilates', label: 'Pilates' },
        { value: 'HIIT', label: 'HIIT' },
        { value: 'Strength Training', label: 'Strength Training' },
        { value: 'Cardio', label: 'Cardio' },
        { value: 'Boxing', label: 'Boxing' },
        { value: 'Dance Fitness', label: 'Dance Fitness' },
        { value: 'Crossfit', label: 'Crossfit' },
        { value: 'Meditation', label: 'Meditation' },
        { value: 'Nutrition Coaching', label: 'Nutrition Coaching' },
    ];

    const availableDayOptions = [
        { value: 'Sunday', label: 'Sunday' },
        { value: 'Monday', label: 'Monday' },
        { value: 'Tuesday', label: 'Tuesday' },
        { value: 'Wednesday', label: 'Wednesday' },
        { value: 'Thursday', label: 'Thursday' },
        { value: 'Friday', label: 'Friday' },
        { value: 'Saturday', label: 'Saturday' },
    ];

    const slotDayOptions = availableDayOptions;

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        specialization: [],
        experience: '',
        image: '',
        age: '',
        sessions: '',
        certifications: [],
        bio: '',
        slots: [],
    });

    const [newSlot, setNewSlot] = useState({
        id: '',
        slotName: '',
        slotTime: '',
        duration: '',
        selectedDays: [],
        maxParticipants: 1,
        description: ''
    });

    // ✅ Set name & email from user
    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                name: user.displayName || '',
                email: user.email || '',
            }));
        }
    }, [user]);

    useEffect(() => {
        const timer = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    const addSlot = () => {
        if (
            !newSlot.slotName.trim() ||
            !newSlot.slotTime.trim() ||
            !newSlot.duration.trim() ||
            newSlot.selectedDays.length === 0 ||
            newSlot.maxParticipants < 1
        ) {
            toast.error('Please fill in all required fields for the new slot (Name, Time, Duration, Days, Participants).');
            return;
        }

        const id = Date.now().toString();
        const slotToAdd = {
            id,
            slotName: newSlot.slotName,
            slotTime: newSlot.slotTime,
            duration: newSlot.duration,
            days: newSlot.selectedDays.map(day => day.value),
            maxParticipants: newSlot.maxParticipants,
            description: newSlot.description.trim(),
            bookingCount: 0,
            bookedMembers: [],
        };

        setFormData((prev) => ({ ...prev, slots: [...prev.slots, slotToAdd] }));
        setNewSlot({
            id: '',
            slotName: '',
            slotTime: '',
            duration: '',
            selectedDays: [],
            maxParticipants: 1,
            description: ''
        });
    };

    const removeSlot = (idToRemove) => {
        setFormData((prev) => ({
            ...prev,
            slots: prev.slots.filter((slot) => slot.id !== idToRemove),
        }));
    };

    const toggleCertification = (cert) => {
        setFormData((prev) => ({
            ...prev,
            certifications: prev.certifications.includes(cert)
                ? prev.certifications.filter((c) => c !== cert)
                : [...prev.certifications, cert],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !formData.name.trim() ||
            !formData.email.trim() ||
            formData.specialization.length === 0 ||
            !formData.experience.trim() ||
            !formData.age ||
            !formData.bio.trim() ||
            formData.slots.length === 0
        ) {
            toast.error('Please fill in all required fields, including your general availability and at least one specific training slot.');
            return;
        }
        if (parseInt(formData.age) < 18) {
            toast.error('You must be at least 18 years old to apply as a trainer.');
            return;
        }

        const selectedSpecializationValues = formData.specialization.map(spec => spec.value);
        let formattedSpecialization;

        if (selectedSpecializationValues.length === 1) {
            formattedSpecialization = selectedSpecializationValues[0];
        } else if (selectedSpecializationValues.length === 2) {
            formattedSpecialization = selectedSpecializationValues.join(' & ');
        } else if (selectedSpecializationValues.length >= 3) {
            const lastSpecialization = selectedSpecializationValues.pop();
            formattedSpecialization = selectedSpecializationValues.join(', ') + ' & ' + lastSpecialization;
        } else {
            formattedSpecialization = '';
        }

        const payload = {
            email: user?.email,
            name: formData.name,
            age: formData.age,
            experience: formData.experience,
            photoURL: formData.image || user?.photoURL || '',
            specialization: formattedSpecialization,
            description: formData.bio,
            certifications: formData.certifications || [],
            sessions: formData.sessions,
            slots: formData.slots || [],
        };

        try {
            const res = await axiosSecure.post('/trainers', payload);
            if (res.data?.insertedId || res.data?.acknowledged) {
                toast.success('Trainer application submitted! It is under review.');
                navigate('/');
            } else {
                toast.error('Failed to submit trainer application.');
            }
        } catch (err) {
            if (err.response?.status === 409) {
                toast.error('A trainer profile (or application) already exists for this email.');
            } else {
                toast.error('Something went wrong. Please try again.');
            }
            console.error(err);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-700">
                <Loader />
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="min-h-screen py-12"
        >
            <Title>Be A Trainer | FitFlow</Title>
            <div className="md:container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div variants={childVariants} className="bg-white rounded-xl shadow-lg p-8">
                    <motion.div variants={childVariants} className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">Become a Trainer</h1>
                        <p className="text-xl text-gray-600">
                            Join our team of expert trainers and help others achieve their fitness goals.
                        </p>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name and Email */}
                        <motion.div variants={childVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div variants={childVariants}>
                                <label className="block text-sm font-medium mb-2">Full Name</label>
                                <motion.input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                    required
                                    whileFocus={{ scale: 1.03, borderColor: '#2563EB' }}
                                />
                            </motion.div>

                            <motion.div variants={childVariants}>
                                <label className="block text-sm font-medium mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    readOnly
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
                                />
                            </motion.div>

                            <motion.div variants={childVariants}>
                                <label className="block text-sm font-medium mb-2">Age</label>
                                <motion.input
                                    type="number"
                                    value={formData.age}
                                    onChange={(e) =>
                                        setFormData({ ...formData, age: Number(e.target.value) })
                                    }
                                    placeholder="Your Age"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0 [-moz-appearance:textfield]"
                                    required
                                    min={18}
                                    whileFocus={{ scale: 1.03, borderColor: '#2563EB' }}
                                />
                            </motion.div>

                            <motion.div variants={childVariants}>
                                <label className="block text-sm font-medium mb-2">Sessions Completed</label>
                                <motion.input
                                    type="number"
                                    value={formData.sessions}
                                    onChange={(e) =>
                                        setFormData({ ...formData, sessions: Number(e.target.value) })
                                    }
                                    placeholder="e.g., 10"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0 [-moz-appearance:textfield]"
                                    required
                                    min={0}
                                    whileFocus={{ scale: 1.03, borderColor: '#2563EB' }}
                                />
                            </motion.div>

                            {/* React Select for Specialization (Multi-select) */}
                            <motion.div variants={childVariants}>
                                <label className="block text-sm font-medium mb-2">Specializations</label>
                                <Select
                                    options={specializationOptions}
                                    value={formData.specialization}
                                    onChange={(selectedOptions) =>
                                        setFormData({ ...formData, specialization: selectedOptions || [] })
                                    }
                                    placeholder="Select Specializations"
                                    isMulti
                                    isClearable={true}
                                    isSearchable={true}
                                    classNames={{
                                        control: (state) =>
                                            `!min-h-[48px] !px-2 !py-1 !border !border-gray-300 !rounded-lg !shadow-none ${state.isFocused ? '!border-blue-600 !ring-0' : ''}`,
                                        placeholder: () => '!text-gray-500',
                                        multiValue: () => '!bg-blue-100 !rounded-md',
                                        multiValueLabel: () => '!text-blue-800 !py-1 !px-2',
                                        multiValueRemove: () => '!text-blue-500 hover:!bg-blue-200 !rounded-r-md',
                                        indicatorSeparator: () => '!hidden',
                                        dropdownIndicator: () => '!text-gray-500',
                                        menu: () => '!border !border-gray-200 !rounded-lg !shadow-lg !mt-1 !overflow-hidden',
                                        option: (state) =>
                                            `!px-4 !py-3 !cursor-pointer ${state.isSelected
                                                ? '!bg-blue-600 !text-white'
                                                : state.isFocused
                                                    ? '!bg-blue-100 !text-gray-900'
                                                    : '!bg-white !text-gray-900'
                                            }`,
                                    }}
                                />
                            </motion.div>

                            <motion.div variants={childVariants}>
                                <label className="block text-sm font-medium mb-2">Experience</label>
                                <motion.input
                                    type="text"
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                    placeholder="e.g., 5 years"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                    required
                                    whileFocus={{ scale: 1.03, borderColor: '#2563EB' }}
                                />
                            </motion.div>
                        </motion.div>

                        {/* Profile Image */}
                        <motion.div variants={childVariants}>
                            <label className="block text-sm font-medium mb-2">Profile Image URL</label>
                            <motion.input
                                type="url"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                placeholder="https://example.com/image.jpg"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                whileFocus={{ scale: 1.03, borderColor: '#2563EB' }}
                            />
                            {formData.image && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="relative mt-3 w-32 h-32 rounded-lg overflow-hidden border"
                                >
                                    <img
                                        src={formData.image}
                                        alt="Profile Preview"
                                        className="object-cover w-full h-full"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                                        className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                        aria-label="Remove image"
                                    >
                                        &times;
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Bio */}
                        <motion.div variants={childVariants}>
                            <label className="block text-sm font-medium mb-2">Bio</label>
                            <motion.textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                placeholder="Tell us about yourself"
                                required
                                whileFocus={{ scale: 1.03, borderColor: '#2563EB' }}
                            />
                        </motion.div>

                        {/* Certifications */}
                        <motion.div variants={childVariants}>
                            <label className="block text-sm font-medium mb-2">Certifications</label>
                            <motion.div className="flex flex-wrap gap-2">
                                {certificationOptions.map((cert) => {
                                    const selected = formData.certifications.includes(cert);
                                    return (
                                        <motion.button
                                            key={cert}
                                            type="button"
                                            onClick={() => toggleCertification(cert)}
                                            className={`px-4 py-2 border rounded-lg text-sm font-medium transition
                                                ${selected
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-blue-100'
                                                }`}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {cert}
                                        </motion.button>
                                    );
                                })}
                            </motion.div>
                        </motion.div>

                        {/* --- Add New Specific Slot Section --- */}
                        <motion.div variants={fadeSlideUp} className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                            <h2 className="text-2xl font-semibold text-blue-800 mb-4">Add Specific Training Slots</h2>
                            <p className="text-base text-gray-600 mb-4">Define individual session times and details.</p>

                            <div className="grid gap-4 items-center">
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    {/* Slot Name */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Slot Name</label>
                                        <motion.input
                                            type="text"
                                            placeholder="Ex: Morning Yoga"
                                            value={newSlot.slotName}
                                            onChange={(e) => setNewSlot({ ...newSlot, slotName: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg"
                                            whileFocus={{ scale: 1.03, borderColor: '#2563EB' }}
                                        />
                                    </div>

                                    {/* Slot Time (Specific Time) */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Slot Time</label>
                                        <motion.input
                                            type="text"
                                            placeholder="Ex: 9:00 AM - 10:00 AM"
                                            value={newSlot.slotTime}
                                            onChange={(e) => setNewSlot({ ...newSlot, slotTime: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg"
                                            whileFocus={{ scale: 1.03, borderColor: '#2563EB' }}
                                        />
                                    </div>

                                    {/* Duration */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Duration</label>
                                        <motion.input
                                            type="text"
                                            placeholder="Ex: 1 hour, 45 minutes"
                                            value={newSlot.duration}
                                            onChange={(e) => setNewSlot({ ...newSlot, duration: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg"
                                            whileFocus={{ scale: 1.03, borderColor: '#2563EB' }}
                                        />
                                    </div>


                                    {/* Max Participants */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Max Participants</label>
                                        <motion.input
                                            type="number"
                                            placeholder="Ex: 10"
                                            value={newSlot.maxParticipants}
                                            onChange={(e) => setNewSlot({ ...newSlot, maxParticipants: Math.max(1, Number(e.target.value)) })}
                                            className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0 [-moz-appearance:textfield]"
                                            min={1}
                                            whileFocus={{ scale: 1.03, borderColor: '#2563EB' }}
                                        />
                                    </div>
                                </div>
                                {/* Select Days for this Slot */}
                                <div>
                                    <label className="block w-full text-sm font-medium mb-1">Days for this Slot</label>
                                    <Select
                                        options={slotDayOptions}
                                        value={newSlot.selectedDays}
                                        onChange={(selectedOptions) => setNewSlot({ ...newSlot, selectedDays: selectedOptions || [] })}
                                        placeholder="Select Day(s)"
                                        isMulti
                                        isClearable
                                        classNames={{
                                            control: (state) =>
                                                `!min-h-[48px] !px-2 !py-1 !border !border-gray-300 !rounded-lg !shadow-none ${state.isFocused ? '!border-blue-600 !ring-0' : ''}`,
                                            placeholder: () => '!text-gray-500',
                                            multiValue: () => '!bg-blue-100 !rounded-md',
                                            multiValueLabel: () => '!text-blue-800 !py-1 !px-2',
                                            multiValueRemove: () => '!text-blue-500 hover:!bg-blue-200 !rounded-r-md',
                                            indicatorSeparator: () => '!hidden',
                                            dropdownIndicator: () => '!text-gray-500',
                                            menu: () => '!border !border-gray-200 !rounded-lg !shadow-lg !mt-1 !overflow-hidden',
                                            option: (state) =>
                                                `!px-4 !py-3 !cursor-pointer ${state.isSelected
                                                    ? '!bg-blue-600 !text-white'
                                                    : state.isFocused
                                                        ? '!bg-blue-100 !text-gray-900'
                                                        : '!bg-white !text-gray-900'
                                                }`,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Slot Description (New Field) */}
                            <motion.div className="mt-4"> {/* Use mt-4 for spacing */}
                                <label className="block text-sm font-medium mb-1">Slot Description (Optional)</label>
                                <motion.textarea
                                    value={newSlot.description}
                                    onChange={(e) => setNewSlot({ ...newSlot, description: e.target.value })}
                                    rows={6}
                                    className="w-full px-4 py-3 border border-gray-300 bg-white rounded-lg"
                                    placeholder="Provide details about this specific slot, e.g., 'Focuses on core strength and flexibility.'"
                                    whileFocus={{ scale: 1.01, borderColor: '#2563EB' }}
                                />
                            </motion.div>

                            <motion.button
                                type="button"
                                onClick={addSlot}
                                className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Add Slot
                            </motion.button>

                            <h3 className="text-xl font-semibold text-gray-700 mt-6 mb-3">Added Slots</h3>
                            <motion.ul className="space-y-2">
                                <AnimatePresence>
                                    {formData.slots.map((slot) => (
                                        <motion.li
                                            key={slot.id}
                                            initial={{ opacity: 0, x: 50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -50 }}
                                            layout
                                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-100 rounded-lg px-4 py-3 shadow-sm border border-gray-200"
                                        >
                                            <div>
                                                <p className="font-semibold text-gray-800">{slot.slotName}</p>
                                                <p className="text-sm text-gray-600">
                                                    {slot.days?.join(', ')} | {slot.slotTime} ({slot.duration}) | Max: {slot.maxParticipants}
                                                </p>
                                                {slot.description && <p className="text-xs text-gray-500 mt-1">Description: {slot.description}</p>}
                                            </div>
                                            <motion.button
                                                onClick={() => removeSlot(slot.id)}
                                                className="mt-2 sm:mt-0 text-red-600 hover:text-red-800 font-bold text-lg"
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.9 }}
                                                aria-label={`Remove slot ${slot.slotName}`}
                                            >
                                                &times;
                                            </motion.button>
                                        </motion.li>
                                    ))}
                                </AnimatePresence>
                            </motion.ul>
                        </motion.div>
                        {/* --- End Add New Specific Slot Section --- */}

                        {/* Submit Button */}
                        <motion.div variants={childVariants} className="text-center mt-8">
                            <motion.button
                                type="submit"
                                className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Submit Application
                            </motion.button>
                        </motion.div>
                    </form>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default BeTrainer;
