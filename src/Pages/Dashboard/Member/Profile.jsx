import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router';
import { User, Mail, Calendar, Camera, Save } from 'lucide-react';
import { AuthContext } from '../../../Provider/AuthProvider';
import { getAuth, updateProfile } from 'firebase/auth';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../../Provider/UseAxiosSecure';

const Profile = () => {
    const { user, updateUser } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        avatar: '',
        bio: '',
        location: '',
        fitnessGoals: '',
    });

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.displayName || '',
                avatar: user.photoURL || '',
            }));

            // Fetch additional data from backend
            const fetchData = async () => {
                try {
                    const res = await axiosSecure.get(`/users/${user.email}`);
                    const { bio, location, fitnessGoals } = res.data || {};
                    setFormData(prev => ({
                        ...prev,
                        bio: bio || '',
                        location: location || '',
                        fitnessGoals: fitnessGoals || '',
                    }));
                } catch (err) {
                    console.error('Backend data fetch error:', err);
                }
            };

            fetchData();
        }
    }, [user, axiosSecure]);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const auth = getAuth();
            const firebaseUser = auth.currentUser;

            // 1. Update Firebase profile
            await updateProfile(firebaseUser, {
                displayName: formData.name,
                photoURL: formData.avatar,
            });

            // 2. Update backend
            const token = localStorage.getItem('FitFlow-token');

            const updatedUser = {
                name: formData.name,
                avatar: formData.avatar,
                bio: formData.bio,
                location: formData.location,
                fitnessGoals: formData.fitnessGoals,
            };

            await axiosSecure.post('/users', {
                email: firebaseUser.email,
                displayName: updatedUser.name,
                photoURL: updatedUser.avatar,
                bio: updatedUser.bio,
                location: updatedUser.location,
                fitnessGoals: updatedUser.fitnessGoals,
                lastSignInTime: new Date().toISOString(),
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // 3. Update context state
            updateUser({
                displayName: formData.name,
                photoURL: formData.avatar,
            });

            Swal.fire('Success!', 'Successfully updated your profile.', 'success');
            setIsEditing(false);
        } catch (error) {
            console.error(error);
            Swal.fire('Error', error.message, 'error');
        }
    };

    const handleCancel = () => {
        if (!user) return;
        setFormData({
            name: user.displayName || '',
            avatar: user.photoURL || '',
            bio: '',
            location: '',
            fitnessGoals: '',
        });
        setIsEditing(false);
    };

    return (
        <div className='p-6 md:p-8'>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
                <p className="text-gray-600">Manage your account information and preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                        <div className="relative inline-block">
                            {formData.avatar ? (
                                <img
                                    src={formData.avatar}
                                    alt={formData.name}
                                    className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
                                />
                            ) : (
                                <div className="w-32 h-32 flex items-center justify-center mx-auto rounded-full bg-gradient-to-r from-blue-400 to-orange-400 text-white text-4xl font-bold border-4 border-white shadow-lg">
                                    {formData.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            )}
                            {isEditing && (
                                <button className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
                                    <Camera className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 mt-4">{formData.name}</h2>
                        <p className="text-gray-600 capitalize">{user?.role || 'member'}</p>

                        <div className="mt-6 space-y-3 text-sm text-gray-600">
                            <div className="flex justify-center items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <span>{user?.email}</span>
                            </div>
                            <div className="flex justify-center items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>Last login: {user?.lastSignInTime ? new Date(user.lastSignInTime).toLocaleDateString() : 'Today'}</span>
                            </div>
                        </div>

                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="mt-6 w-full bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                {/* Profile Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Profile Information</h3>
                            {isEditing && (
                                <div className="space-x-3 flex">
                                    <button
                                        onClick={handleSubmit}
                                        className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg"
                                    >
                                        <Save className="h-4 w-4" />
                                        <span>Save Changes</span>
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={user?.email}
                                        disabled
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                                    />
                                </div>

                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture URL</label>
                                <input
                                    type="url"
                                    name="avatar"
                                    value={formData.avatar}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    rows={3}
                                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fitness Goals</label>
                                <textarea
                                    name="fitnessGoals"
                                    value={formData.fitnessGoals}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    rows={3}
                                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg ${!isEditing ? 'bg-gray-50 text-gray-600' : ''}`}
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {user?.role === 'member' && (
                <div className="mt-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl p-8 text-white text-center">
                    <h2 className="text-2xl font-bold mb-4">Ready to Take the Next Step?</h2>
                    <p className="text-lg mb-6 text-orange-100">
                        Share your fitness expertise and help others while earning extra income as a certified trainer.
                    </p>
                    <Link
                        to="/be-trainer"
                        className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50"
                    >
                        Apply to Become a Trainer
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Profile;