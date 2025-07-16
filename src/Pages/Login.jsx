import React, { useContext, useEffect, useState } from 'react';
import { Eye, EyeOff, Activity, Mail, Lock } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router';
import { motion } from 'framer-motion'; // Import motion
import {
    deleteUser,
    GoogleAuthProvider,
    sendPasswordResetEmail, // Not used in this component, but kept from original
    signInWithEmailAndPassword,
    signInWithPopup,
} from 'firebase/auth';
import { auth } from '../Firebase/firebase.init';
import { toast } from 'sonner';
import axios from 'axios';
import { AuthContext } from '../Provider/AuthProvider';

const Login = ({ onRegister }) => { // onRegister prop is not used in this component
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(''); // single error string
    const [isLoading, setIsLoading] = useState(false);
    const [role, setRole] = useState('member'); // store role if needed
    const { user } = useContext(AuthContext)

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    useEffect(() => {
        const timer = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    const validateForm = () => {
        if (!email) {
            setError('Email is required');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Email is invalid');
            return false;
        }
        if (!password) {
            setError('Password is required');
            return false;
        }
        setError('');
        return true;
    };

    const sendUserToBackend = async (user) => {
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            lastSignInTime: user.metadata?.lastSignInTime || '',
            role: 'member',
        };
        try {
            const existingUser = await axios.get(`http://localhost:3000/users/${user.email}`);
            if (existingUser.status === 200 && existingUser.data?.email === user.email) return true;
        } catch {
            try {
                const res = await axios.post('http://localhost:3000/users', userData);
                if (res.status === 200 || res.status === 201) return true;
                throw new Error('Backend rejected user');
            } catch {
                if (user && typeof deleteUser === 'function') { // Check if deleteUser is available
                    await deleteUser(user);
                }
                throw new Error('Something went wrong while setting up your account. Please try again.');
            }
        }
    };

    const backendLoginAndFetchRole = async (email) => {
        try {
            await axios.post(
                'http://localhost:3000/login',
                { email },
                { withCredentials: true }
            );

            const roleRes = await axios.get(`http://localhost:3000/role/${email}`);
            const fetchedRole = roleRes.data.role || 'member';
            setRole(fetchedRole);
        } catch (error) {
            console.error('Backend login or role fetch failed:', error);
            setRole('member');
        }
    };

    const handleSocialLogin = async (providerName) => {
        setIsLoading(true);
        try {
            if (providerName === 'google') {
                const provider = new GoogleAuthProvider();
                const result = await signInWithPopup(auth, provider);
                const user = result.user;

                await sendUserToBackend(user);
                await backendLoginAndFetchRole(user.email);

                toast.success('Successfully logged in with Google');
                navigate(from, { replace: true });
            } else if (providerName === 'facebook') {
                toast.error('Facebook login not implemented yet.');
            }
        } catch (err) {
            toast.error(err.message || 'Social login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            const user = result.user;

            await sendUserToBackend(user);

            await axios.patch('http://localhost:3000/users', {
                email,
                lastSignInTime: user.metadata?.lastSignInTime,
            });

            await backendLoginAndFetchRole(email);

            toast.success('Successfully logged in.');
            navigate(from, { replace: true });
        } catch (error) {
            if (error.code === 'auth/user-not-found') { // Corrected Firebase error code
                setError('No member found with this email');
                toast.error('No member found with this email');
            } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') { // Added invalid-credential for general incorrect password/email
                setError('Incorrect email or password');
                toast.error('Incorrect email or password');
            } else {
                setError(error.message || 'Failed to sign in. Please try again.');
                toast.error(error.message || 'Failed to sign in. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-orange-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
            <motion.div
                className="max-w-md w-full space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div className="bg-white rounded-2xl shadow-2xl p-8" variants={itemVariants}>
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            className="flex items-center justify-center space-x-2 mb-4"
                            variants={itemVariants}
                        >
                            <Activity className="h-10 w-10 text-blue-700" />
                            <span className="text-3xl font-bold text-gray-800">FitFlow</span>
                        </motion.div>
                        <motion.h2 className="text-2xl font-bold text-gray-800" variants={itemVariants}>
                            Welcome Back
                        </motion.h2>
                        <motion.p className="text-gray-600 mt-2" variants={itemVariants}>
                            Sign in to continue your fitness journey
                        </motion.p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <p className="text-red-700 text-sm">{error}</p>
                        </motion.div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <motion.div variants={itemVariants}>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </motion.div>

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            variants={itemVariants}
                        >
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </motion.button>
                    </form>

                    {/* Social Login */}
                    <motion.div className="mt-6" variants={itemVariants}>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <motion.button
                                onClick={() => handleSocialLogin('google')}
                                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill="#1C71FF" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC04" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span className="ml-2">Google</span>
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Register Link */}
                    <motion.div className="mt-6 text-center" variants={itemVariants}>
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-medium text-blue-700 hover:text-blue-800">
                                Sign up here
                            </Link>
                        </p>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;