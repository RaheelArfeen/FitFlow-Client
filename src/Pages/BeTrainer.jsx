import React, { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { AuthContext } from '../Provider/AuthProvider';
import { X } from 'lucide-react';
import { toast } from 'sonner';

const BeTrainerPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [imageInputMode, setImageInputMode] = useState('url');

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        age: '',
        profileImage: null,
        profileImageUrl: '',
        skills: [],
        availableDays: [],
        availableTime: '',
        experience: '',
        bio: ''
    });

    // Initialize formData with user info once user is loaded
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                fullName: user.displayName || '',
                email: user.email || '',
            }));
        }
    }, [user]);

    const skillOptions = [
        'Yoga', 'Pilates', 'HIIT', 'Strength Training', 'Cardio', 'Boxing',
        'Dance Fitness', 'Crossfit', 'Meditation', 'Nutrition Coaching'
    ];

    const dayOptions = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];

    const toggleSkill = (skill) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter(s => s !== skill)
                : [...prev.skills, skill]
        }));
    };

    const toggleDay = (day) => {
        setFormData(prev => ({
            ...prev,
            availableDays: prev.availableDays.includes(day)
                ? prev.availableDays.filter(d => d !== day)
                : [...prev.availableDays, day]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        toast.success('Application submitted successfully! Your status is now pending review.');
        navigate('/dashboard');
    };

    const fileInputRef = useRef(null);

    // Show loading or redirect if user not loaded yet
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-700">
                Loading user data...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="md:container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">Become a Trainer</h1>
                        <p className="text-xl text-gray-600">
                            Join our team of expert trainers and help others achieve their fitness goals.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name, email, age, experience */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    readOnly
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                                <input
                                    type="number"
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                                <input
                                    type="text"
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                    placeholder="e.g., 5 years"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        {/* Toggle Buttons for Image Input Mode */}
                        <div className="flex space-x-4 mb-4">
                            <button
                                type="button"
                                onClick={() => setImageInputMode('url')}
                                className={`px-4 py-2 rounded-lg border font-medium transition
                  ${imageInputMode === 'url'
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-blue-100'
                                    }`}
                            >
                                Use Image URL
                            </button>
                            <button
                                type="button"
                                onClick={() => setImageInputMode('file')}
                                className={`px-4 py-2 rounded-lg border font-medium transition
                  ${imageInputMode === 'file'
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-blue-100'
                                    }`}
                            >
                                Upload Image File
                            </button>
                        </div>

                        {/* Conditionally render URL or File input */}

                        {/* URL input and preview with remove button */}
                        {imageInputMode === 'url' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image URL</label>
                                <input
                                    type="url"
                                    value={formData.profileImageUrl}
                                    onChange={(e) => setFormData({ ...formData, profileImageUrl: e.target.value })}
                                    placeholder="https://example.com/photo.jpg"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                                {formData.profileImageUrl && (
                                    <div className="relative inline-block mt-3 w-32 h-32 rounded-lg border border-gray-300 overflow-hidden">
                                        <img
                                            src={formData.profileImageUrl}
                                            alt="Profile Preview"
                                            className="object-cover w-full h-full"
                                            onError={e => e.currentTarget.style.display = 'none'}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, profileImageUrl: '' }))}
                                            className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-opacity-75 transition"
                                            aria-label="Remove image"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* File input and preview with remove button */}
                        {imageInputMode === 'file' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Profile Image</label>

                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setFormData(prev => ({ ...prev, profileImage: file }));
                                        }
                                    }}
                                />

                                {/* Custom button to trigger file select */}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                >
                                    Choose File
                                </button>

                                {/* Show file name */}
                                {formData.profileImage && (
                                    <p className="mt-2 text-gray-700">{formData.profileImage.name}</p>
                                )}

                                {/* Preview image with remove button */}
                                {formData.profileImage && typeof formData.profileImage !== 'string' && (
                                    <div className="relative inline-block mt-3 w-32 h-32 rounded-lg border border-gray-300">
                                        <img
                                            src={URL.createObjectURL(formData.profileImage)}
                                            alt="Profile Preview"
                                            className="object-cover w-full h-full rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, profileImage: null }))}
                                            className="absolute -top-2 -right-2 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition"
                                            aria-label="Remove image"
                                        >
                                            <X size={15} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Tell us about yourself..."
                                required
                            />
                        </div>

                        {/* Skills */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Skills</label>
                            <div className="flex flex-wrap gap-2">
                                {skillOptions.map((skill) => {
                                    const selected = formData.skills.includes(skill);
                                    return (
                                        <button
                                            type="button"
                                            key={skill}
                                            onClick={() => toggleSkill(skill)}
                                            className={`px-4 py-2 rounded-lg border text-sm font-medium select-none
                        ${selected
                                                    ? 'bg-blue-600 border-blue-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-blue-100'
                                                }
                        transition`}
                                        >
                                            {skill}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Available Days */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">Available Days</label>
                            <div className="flex flex-wrap gap-2">
                                {dayOptions.map((day) => {
                                    const selected = formData.availableDays.includes(day);
                                    return (
                                        <button
                                            type="button"
                                            key={day}
                                            onClick={() => toggleDay(day)}
                                            className={`px-4 py-2 rounded-lg border text-sm font-medium select-none
                        ${selected
                                                    ? 'bg-blue-600 border-blue-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-blue-100'
                                                }
                        transition`}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Available Time */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Available Time in a Day
                            </label>
                            <input
                                type="text"
                                value={formData.availableTime}
                                onChange={(e) => setFormData({ ...formData, availableTime: e.target.value })}
                                placeholder="e.g., 9:00 AM - 5:00 PM"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

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

export default BeTrainerPage;