import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import Loader from './Loader';
import { motion, AnimatePresence } from 'framer-motion';
import useAxiosSecure from '../Provider/UseAxiosSecure';
import { AuthContext } from '../Provider/AuthProvider';
import Select from 'react-select';

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
        'Yoga & Mindfulness',
        'Pilates',
        'HIIT',
        'Strength Training',
        'Cardio',
        'Boxing',
        'Dance Fitness',
        'Crossfit',
        'Meditation',
        'Nutrition Coaching',
    ];

    const dayOptions = [
        { value: 'Sunday', label: 'Sunday' },
        { value: 'Monday', label: 'Monday' },
        { value: 'Tuesday', label: 'Tuesday' },
        { value: 'Wednesday', label: 'Wednesday' },
        { value: 'Thursday', label: 'Thursday' },
        { value: 'Friday', label: 'Friday' },
        { value: 'Saturday', label: 'Saturday' },
    ];

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        specialization: '',
        experience: '',
        image: '',
        rating: 0.0,
        age: '',
        sessions: 0,
        certifications: [],
        bio: '',
        availableSlots: [],
        availableDays: [],
        social: {
            instagram: '',
            twitter: '',
            linkedin: '',
        },
        slots: [],
    });

    const [newSlot, setNewSlot] = useState({ id: '', name: '', time: '', day: '' });
    const [isSlotDayOpen, setIsSlotDayOpen] = useState(false);
    const slotDayRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (slotDayRef.current && !slotDayRef.current.contains(event.target)) {
                setIsSlotDayOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const addSlot = () => {
        if (!newSlot.name.trim() || !newSlot.time || !newSlot.day) {
            toast.error('Please fill in all slot details.');
            return;
        }
        const id = Date.now().toString();
        const slotToAdd = { ...newSlot, id };
        setFormData((prev) => ({ ...prev, slots: [...prev.slots, slotToAdd] }));
        setNewSlot({ id: '', name: '', time: '', day: '' });
    };

    const removeSlot = (idToRemove) => {
        setFormData((prev) => ({
            ...prev,
            slots: prev.slots.filter((slot) => slot.id !== idToRemove),
        }));
    };

    const specRef = useRef(null);
    const [isSpecOpen, setIsSpecOpen] = useState(false);

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
        const handleClickOutside = (event) => {
            if (specRef.current && !specRef.current.contains(event.target)) setIsSpecOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedDays = dayOptions.filter((day) => formData.availableDays.includes(day.value));

    const handleDaysChange = (selected) => {
        setFormData((prev) => ({
            ...prev,
            availableDays: selected ? selected.map((option) => option.value) : [],
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

    const toggleSlot = (slot) => {
        setFormData((prev) => ({
            ...prev,
            availableSlots: prev.availableSlots.includes(slot)
                ? prev.availableSlots.filter((s) => s !== slot)
                : [...prev.availableSlots, slot],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (
            !formData.name.trim() ||
            !formData.email.trim() ||
            !formData.specialization.trim() ||
            !formData.experience.trim() ||
            !formData.age ||
            !formData.bio.trim()
        ) {
            toast.error('Please fill in all required fields.');
            return;
        }
        if (parseInt(formData.age) < 18) {
            toast.error('You must be at least 18 years old to apply as a trainer.');
            return;
        }
        const payload = {
            email: formData.email,
            name: formData.name,
            age: formData.age,
            experience: formData.experience,
            photoURL: formData.image,
            specialization: formData.specialization,
            description: formData.bio,
            certifications: formData.certifications || [],
            availableSlots: formData.availableSlots || [],
            availableDays: formData.availableDays || [],
            sessions: formData.sessions || 0,
            social: formData.social || {},
            rating: formData.rating || 0,
            comments: formData.comments || [],
            slots: formData.slots || [],
            ratings: formData.ratings || [],
        };
        try {
            const res = await axiosSecure.post('/applications/trainer', payload);
            if (res.data?.insertedId || res.data?.acknowledged) {
                toast.success('Trainer application submitted! Please wait for admin approval.');
                navigate('/');
            } else {
                toast.error('Failed to submit trainer application.');
            }
        } catch (err) {
            if (err.response?.status === 409) {
                toast.error('You have already submitted an application.');
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                    min={0}
                                    whileFocus={{ scale: 1.03, borderColor: '#2563EB' }}
                                />
                            </motion.div>

                            {/* Specialization dropdown */}
                            <motion.div ref={specRef} variants={childVariants} className="relative">
                                <label className="block text-sm font-medium mb-2">Specialization</label>
                                <motion.button
                                    type="button"
                                    onClick={() => setIsSpecOpen((open) => !open)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left bg-white flex justify-between items-center"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    aria-haspopup="listbox"
                                    aria-expanded={isSpecOpen}
                                >
                                    {formData.specialization || 'Select Specialization'}
                                    <svg
                                        className={`w-5 h-5 ml-2 transition-transform ${isSpecOpen ? 'rotate-180' : ''
                                            }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </motion.button>
                                <AnimatePresence>
                                    {isSpecOpen && (
                                        <motion.ul
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md text-base border border-gray-200 overflow-auto focus:outline-none scrollbarHidden"
                                            role="listbox"
                                        >
                                            {specializationOptions.map((spec) => (
                                                <motion.li
                                                    key={spec}
                                                    onClick={() => {
                                                        setFormData((prev) => ({ ...prev, specialization: spec }));
                                                        setIsSpecOpen(false);
                                                    }}
                                                    className={`cursor-pointer select-none relative py-2 px-3  ${formData.specialization === spec
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-gray-900'
                                                        }`}
                                                    whileHover={{ backgroundColor: '#bfdbfe', scale: 1.02 }}
                                                    role="option"
                                                >
                                                    {spec}
                                                </motion.li>
                                            ))}
                                        </motion.ul>
                                    )}
                                </AnimatePresence>
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

                        {/* Available Slots */}
                        <motion.div variants={childVariants}>
                            <label className="block text-sm font-medium mb-2">Available Slots</label>
                            <motion.div className="flex gap-4 flex-wrap">
                                {['Morning', 'Noon', 'After-noon', 'Evening', 'Night'].map((slot) => {
                                    const selected = formData.availableSlots.includes(slot);
                                    return (
                                        <motion.button
                                            key={slot}
                                            type="button"
                                            onClick={() => toggleSlot(slot)}
                                            className={`px-4 py-2 border rounded-lg text-sm font-medium transition
                                            ${selected
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-blue-100'
                                                }`}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {slot}
                                        </motion.button>
                                    );
                                })}
                            </motion.div>
                        </motion.div>

                        {/* Available Days (React Select) */}
                        <motion.div variants={childVariants}>
                            <label className="block text-sm font-medium mb-2">Available Days</label>
                            <Select
                                isMulti
                                options={dayOptions}
                                value={selectedDays}
                                onChange={handleDaysChange}
                                placeholder="Select available days"
                                classNamePrefix="react-select"
                                closeMenuOnSelect={false}
                                isSearchable={false}
                            />
                        </motion.div>

                        <motion.div variants={fadeSlideUp}>
                            <p className="font-semibold mb-2 text-lg">Add Available Slots</p>
                            <div className="flex flex-col md:flex-row md:gap-4 items-center">
                                <motion.input
                                    type="text"
                                    placeholder="Slot Name (e.g. Morning Yoga)"
                                    value={newSlot.name}
                                    onChange={(e) => setNewSlot({ ...newSlot, name: e.target.value })}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg mb-3 md:mb-0"
                                    whileFocus={{ scale: 1.03, borderColor: '#2563EB' }}
                                />
                                <motion.input
                                    type="time"
                                    value={newSlot.time}
                                    onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                                    className="px-4 py-3 border border-gray-300 rounded-lg mb-3 md:mb-0"
                                    whileFocus={{ scale: 1.03, borderColor: '#2563EB' }}
                                />
                                <motion.div className="relative w-48" ref={slotDayRef}>
                                    <motion.button
                                        type="button"
                                        onClick={() => setIsSlotDayOpen((open) => !open)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left bg-white flex justify-between items-center"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        aria-haspopup="listbox"
                                        aria-expanded={isSlotDayOpen}
                                    >
                                        {dayOptions.find(d => d.value === newSlot.day)?.label || 'Select Day'}
                                        <svg
                                            className={`w-5 h-5 ml-2 transition-transform ${isSlotDayOpen ? 'rotate-180' : ''
                                                }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M19 9l-7 7-7-7"
                                            ></path>
                                        </svg>
                                    </motion.button>
                                    <AnimatePresence>
                                        {isSlotDayOpen && (
                                            <motion.ul
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute z-10 mt-1 w-full bg-white shadow-lg h-fit rounded-md text-base overflow-auto focus:outline-none scrollbarHidden"
                                                role="listbox"
                                            >
                                                {dayOptions.map((day) => (
                                                    <motion.li
                                                        key={day.value}
                                                        onClick={() => {
                                                            setNewSlot((prev) => ({ ...prev, day: day.value }));
                                                            setIsSlotDayOpen(false);
                                                        }}
                                                        className="cursor-pointer py-2 px-3"
                                                        whileHover={{ backgroundColor: '#bfdbfe', scale: 1.02 }}
                                                        role="option"
                                                    >
                                                        {day.label}
                                                    </motion.li>
                                                ))}
                                            </motion.ul>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                                <motion.button
                                    type="button"
                                    onClick={addSlot}
                                    className="mt-3 md:mt-0 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Add Slot
                                </motion.button>
                            </div>

                            {/* Slots list */}
                            <motion.ul className="mt-4 space-y-2">
                                <AnimatePresence>
                                    {formData.slots.map(({ id, name, time, day }) => (
                                        <motion.li
                                            key={id}
                                            initial={{ opacity: 0, x: 50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -50 }}
                                            layout
                                            className="flex justify-between items-center bg-gray-100 rounded-lg px-4 py-2"
                                        >
                                            <div>
                                                <p className="font-semibold text-gray-800">{name}</p>
                                                <p className="text-sm text-gray-600">
                                                    {day} | {time}
                                                </p>
                                            </div>
                                            <motion.button
                                                onClick={() => removeSlot(id)}
                                                className="text-red-600 hover:text-red-800 font-bold"
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.9 }}
                                                aria-label={`Remove slot ${name}`}
                                            >
                                                &times;
                                            </motion.button>
                                        </motion.li>
                                    ))}
                                </AnimatePresence>
                            </motion.ul>
                        </motion.div>

                        {/* Social Links */}
                        <motion.div variants={childVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Instagram</label>
                                <motion.input
                                    type="url"
                                    value={formData.social.instagram}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            social: { ...prev.social, instagram: e.target.value },
                                        }))
                                    }
                                    placeholder="https://instagram.com/yourprofile"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                    whileFocus={{ scale: 1.03, borderColor: '#2563EB' }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Twitter</label>
                                <motion.input
                                    type="url"
                                    value={formData.social.twitter}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            social: { ...prev.social, twitter: e.target.value },
                                        }))
                                    }
                                    placeholder="https://twitter.com/yourprofile"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                    whileFocus={{ scale: 1.03, borderColor: '#2563EB' }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">LinkedIn</label>
                                <motion.input
                                    type="url"
                                    value={formData.social.linkedin}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            social: { ...prev.social, linkedin: e.target.value },
                                        }))
                                    }
                                    placeholder="https://linkedin.com/in/yourprofile"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                    whileFocus={{ scale: 1.03, borderColor: '#2563EB' }}
                                />
                            </div>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.div variants={childVariants} className="text-center pt-4">
                            <motion.button
                                type="submit"
                                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-blue-700"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Submit Application
                            </motion.button>
                        </motion.div>
                    </form>
                </motion.div>
            </div >
        </motion.div >
    );
};

export default BeTrainer;