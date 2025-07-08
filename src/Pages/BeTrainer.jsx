import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { AuthContext } from '../Provider/AuthProvider';
import { toast } from 'sonner';
import Loader from './Loader';

const BeTrainer = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const certificationOptions = [
        'RYT-200', 'RYT-500', 'Mindfulness Coach', 'CPR Certified', 'Nutrition Coach',
    ];

    const specializationOptions = [
        'Yoga & Mindfulness', 'Pilates', 'HIIT', 'Strength Training', 'Cardio',
        'Boxing', 'Dance Fitness', 'Crossfit', 'Meditation', 'Nutrition Coaching',
    ];

    const dayOptions = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        specialization: '',
        experience: '',
        image: '',
        rating: 5.0,
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

    const [newSlot, setNewSlot] = useState({ name: '', time: '', day: '' });

    const [isSpecOpen, setIsSpecOpen] = useState(false);
    const specRef = useRef(null);

    const [isSlotDayOpen, setIsSlotDayOpen] = useState(false);
    const slotDayRef = useRef(null);

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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (slotDayRef.current && !slotDayRef.current.contains(event.target)) setIsSlotDayOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleCertification = (cert) => {
        setFormData((prev) => ({
            ...prev,
            certifications: prev.certifications.includes(cert)
                ? prev.certifications.filter((c) => c !== cert)
                : [...prev.certifications, cert],
        }));
    };

    const toggleDay = (day) => {
        setFormData((prev) => ({
            ...prev,
            availableDays: prev.availableDays.includes(day)
                ? prev.availableDays.filter((d) => d !== day)
                : [...prev.availableDays, day],
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

    const addSlot = () => {
        if (!newSlot.name || !newSlot.time || !newSlot.day) {
            toast.error('Please fill all slot fields before adding.');
            return;
        }
        setFormData((prev) => ({
            ...prev,
            slots: [
                ...prev.slots,
                {
                    id: Date.now().toString(),
                    name: newSlot.name,
                    time: newSlot.time,
                    day: newSlot.day,
                    isBooked: false,
                },
            ],
        }));
        setNewSlot({ name: '', time: '', day: '' });
    };

    const removeSlot = (id) => {
        setFormData((prev) => ({
            ...prev,
            slots: prev.slots.filter((slot) => slot.id !== id),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email) {
            toast.error('Name and email are required.');
            return;
        }

        if (parseInt(formData.age) < 18) {
            toast.error('You must be at least 18 years old to apply as a trainer.');
            return;
        }

        const trainerData = {
            ...formData,
            status: 'pending',
        };

        try {
            const res = await fetch('http://localhost:3000/trainers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(trainerData),
            });

            if (res.ok) {
                // Update role to trainer
                const roleRes = await fetch(`http://localhost:3000/users`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: formData.email,
                        role: 'trainer',
                    }),
                });

                if (roleRes.ok) {
                    toast.success('Application submitted and role updated!');
                    navigate('/');
                } else {
                    toast.warning('Trainer added but failed to update role.');
                }
            } else {
                toast.error('Trainer submission failed.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error submitting application.');
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-700">
                <Loader/>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12">
            <div className="md:container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">Become a Trainer</h1>
                        <p className="text-xl text-gray-600">
                            Join our team of expert trainers and help others achieve their fitness goals.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name and Email */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    readOnly
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Age</label>
                                <input
                                    type="text"
                                    value={formData.age}
                                    onChange={(e) =>
                                        setFormData({ ...formData, age: Number(e.target.value) })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                    placeholder="Your Age"
                                />
                            </div>

                            {/* Sessions input */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Sessions Completed</label>
                                <input
                                    type="number"
                                    value={formData.sessions}
                                    onChange={(e) =>
                                        setFormData({ ...formData, sessions: Number(e.target.value) })
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                    placeholder="e.g., 10"
                                    min="0"
                                />
                            </div>

                            {/* Specialization dropdown */}
                            <div ref={specRef} className="relative">
                                <label className="block text-sm font-medium mb-2">Specialization</label>
                                <button
                                    type="button"
                                    onClick={() => setIsSpecOpen((open) => !open)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left bg-white flex justify-between items-center"
                                >
                                    {formData.specialization || 'Select Specialization'}
                                    <svg className={`w-5 h-5 ml-2 transition-transform ${isSpecOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </button>
                                {isSpecOpen && (
                                    <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg h-fit rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto">
                                        {specializationOptions.map((spec) => (
                                            <li
                                                key={spec}
                                                onClick={() => {
                                                    setFormData((prev) => ({ ...prev, specialization: spec }));
                                                    setIsSpecOpen(false);
                                                }}
                                                className={`cursor-pointer py-2 px-3 hover:bg-blue-100 ${formData.specialization === spec ? 'bg-blue-600 text-white' : ''}`}
                                            >
                                                {spec}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Experience</label>
                                <input
                                    type="text"
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                    placeholder="e.g., 5 years"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                    required
                                />
                            </div>
                        </div>

                        {/* Profile Image */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Profile Image URL</label>
                            <input
                                type="url"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                placeholder="https://example.com/image.jpg"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                            />
                            {formData.image && (
                                <div className="relative mt-3 w-32 h-32 rounded-lg overflow-hidden border">
                                    <img
                                        src={formData.image}
                                        alt="Profile Preview"
                                        className="object-cover w-full h-full"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                                        className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                    >
                                        &times;
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Bio</label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                placeholder="Tell us about yourself"
                                required
                            />
                        </div>

                        {/* Certifications */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Certifications</label>
                            <div className="flex flex-wrap gap-2">
                                {certificationOptions.map((cert) => {
                                    const selected = formData.certifications.includes(cert);
                                    return (
                                        <button
                                            key={cert}
                                            type="button"
                                            onClick={() => toggleCertification(cert)}
                                            className={`px-4 py-2 border rounded-lg text-sm font-medium transition
                      ${selected ? 'bg-blue-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-blue-100'}`}
                                        >
                                            {cert}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Available Slots */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Available Slots</label>
                            <div className="flex gap-4">
                                {['Morning', 'Evening'].map((slot) => {
                                    const selected = formData.availableSlots.includes(slot);
                                    return (
                                        <button
                                            key={slot}
                                            type="button"
                                            onClick={() => toggleSlot(slot)}
                                            className={`px-4 py-2 border rounded-lg text-sm font-medium transition
                      ${selected ? 'bg-blue-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-blue-100'}`}
                                        >
                                            {slot}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Available Days */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Available Days</label>
                            <div className="flex flex-wrap gap-2">
                                {dayOptions.map((day) => {
                                    const selected = formData.availableDays.includes(day);
                                    return (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => toggleDay(day)}
                                            className={`px-4 py-2 border rounded-lg text-sm font-medium transition
                      ${selected ? 'bg-blue-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-blue-100'}`}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Instagram</label>
                                <input
                                    type="text"
                                    value={formData.social.instagram}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            social: { ...prev.social, instagram: e.target.value },
                                        }))
                                    }
                                    placeholder="@instagram_handle"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Twitter</label>
                                <input
                                    type="text"
                                    value={formData.social.twitter}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            social: { ...prev.social, twitter: e.target.value },
                                        }))
                                    }
                                    placeholder="@twitter_handle"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">LinkedIn</label>
                                <input
                                    type="text"
                                    value={formData.social.linkedin}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            social: { ...prev.social, linkedin: e.target.value },
                                        }))
                                    }
                                    placeholder="linkedin_username"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>

                        {/* Add Available Slots Section */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Add Available Slots</label>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <input
                                    type="text"
                                    placeholder="Slot Name (e.g., Morning Yoga)"
                                    value={newSlot.name}
                                    onChange={(e) => setNewSlot({ ...newSlot, name: e.target.value })}
                                    className="px-4 py-3 border border-gray-300 rounded-lg"
                                />
                                <input
                                    type="text"
                                    placeholder="Time (e.g., 7:00 AM - 8:00 AM)"
                                    value={newSlot.time}
                                    onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                                    className="px-4 py-3 border border-gray-300 rounded-lg"
                                />

                                {/* Custom day dropdown */}
                                <div ref={slotDayRef} className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsSlotDayOpen((open) => !open)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left bg-white flex justify-between items-center"
                                        aria-haspopup="listbox"
                                        aria-expanded={isSlotDayOpen}
                                    >
                                        {newSlot.day || 'Select Day'}
                                        <svg
                                            className={`w-5 h-5 ml-2 transition-transform ${isSlotDayOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </button>
                                    {isSlotDayOpen && (
                                        <ul
                                            role="listbox"
                                            className="absolute z-10 mt-1 w-full bg-white shadow-lg h-fit rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none"
                                        >
                                            {dayOptions.map((day) => (
                                                <li
                                                    key={day}
                                                    role="option"
                                                    onClick={() => {
                                                        setNewSlot((prev) => ({ ...prev, day }));
                                                        setIsSlotDayOpen(false);
                                                    }}
                                                    className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${newSlot.day === day ? 'bg-blue-600 text-white' : 'text-gray-900'
                                                        } hover:bg-blue-100`}
                                                >
                                                    {day}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={addSlot}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold"
                                >
                                    Add Slot
                                </button>
                            </div>

                            {/* Display slots */}
                            {formData.slots.length > 0 && (
                                <ul className="space-y-2">
                                    {formData.slots.map((slot) => (
                                        <li
                                            key={slot.id}
                                            className="flex justify-between items-center border rounded-lg p-3 bg-gray-50"
                                        >
                                            <div>
                                                <strong>{slot.name}</strong> - {slot.time} on {slot.day}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeSlot(slot.id)}
                                                className="text-red-600 hover:text-red-800 font-semibold"
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Submit */}
                        <div>
                            <button
                                type="submit"
                                className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold transition"
                            >
                                Submit Application
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BeTrainer;
