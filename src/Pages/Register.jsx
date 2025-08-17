import React, { useContext, useEffect, useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Image, Activity, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import {  toast } from 'sonner';
import { AuthContext } from '../Provider/AuthProvider';
import { useNavigate } from 'react-router';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        photoURL: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const { register, loading: isLoading } = useContext(AuthContext);
    const navigate = useNavigate()

    useEffect(() => {
        const timer = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // This function is mocked for demonstration purposes. In a real app,
    // you would call your backend API here.
    const sendUserToBackend = async (user) => {
        console.log(`Mock: Sending user data to backend for user: ${user.email}`);
        return new Promise(resolve => {
            setTimeout(() => {
                console.log("Mock: Backend successfully processed user.");
                resolve(true);
            }, 500);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        if (formData.password.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }

        try {
            const user = await register(
                formData.name,
                formData.email,
                formData.password,
                formData.photoURL
            );

            // Mocking token and backend call
            const token = await user.getIdToken();
            console.log(`Mock: Received token: ${token}`);
            await sendUserToBackend(user);

            toast.success('Account created successfully!');
            // You can replace 'dashboard' with your desired route/page name
            navigate('/');
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Registration failed. Please try again.');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut", staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-600 to-blue-600 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <motion.div className="max-w-md w-full space-y-8" variants={containerVariants} initial="hidden" animate="visible">
                <motion.div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8" variants={itemVariants}>
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div className="flex items-center justify-center space-x-2 mb-4" variants={itemVariants}>
                            <Activity className="h-10 w-10 text-blue-700 dark:text-blue-500" />
                            <span className="text-3xl font-bold text-gray-800 dark:text-white">FitFlow</span>
                        </motion.div>
                        <motion.h2 className="text-2xl font-bold text-gray-800 dark:text-white" variants={itemVariants}>
                            Create Account
                        </motion.h2>
                        <motion.p className="text-gray-600 dark:text-gray-400 mt-2" variants={itemVariants}>
                            Join our fitness community today
                        </motion.p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div role="alert" className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4"
                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}>
                            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                        </motion.div>
                    )}

                    {/* Register Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <motion.div variants={itemVariants}>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <input id="name" name="name" type="text" value={formData.name} onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    placeholder="Enter your full name" required />
                            </div>
                        </motion.div>

                        {/* Email */}
                        <motion.div variants={itemVariants}>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    placeholder="Enter your email" required />
                            </div>
                        </motion.div>

                        {/* Photo URL */}
                        <motion.div variants={itemVariants}>
                            <label htmlFor="photoURL" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Photo URL (Optional)</label>
                            <div className="relative">
                                <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <input id="photoURL" name="photoURL" type="url" value={formData.photoURL} onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    placeholder="Enter photo URL" />
                            </div>
                        </motion.div>

                        {/* Password */}
                        <motion.div variants={itemVariants}>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <input id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    placeholder="Enter your password" required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400">
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </motion.div>

                        {/* Confirm Password */}
                        <motion.div variants={itemVariants}>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    placeholder="Confirm your password" required />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400">
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-700 dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 flex justify-center items-center"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            variants={itemVariants}
                        >
                            {isLoading && <Loader2 className="animate-spin mr-2 h-5 w-5" />}
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </motion.button>
                    </form>

                    {/* Login Link */}
                    <motion.div className="mt-6 text-center" variants={itemVariants}>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Already have an account?{' '}
                            <button onClick={() => navigate('/login')} className="font-medium text-blue-700 dark:text-blue-500 hover:text-blue-800 dark:hover:text-blue-600">
                                Sign in here
                            </button>
                        </p>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Register;
