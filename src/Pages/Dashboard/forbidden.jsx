import React from 'react';
import { Link } from 'react-router';
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion'; // For animations

const Forbidden = () => {
    // Framer Motion variants
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 10,
                when: 'beforeChildren',
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <motion.div
            className="flex items-center justify-center min-h-[calc(100vh-100px)] py-10 px-4 sm:px-6 lg:px-8 bg-gray-50"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="max-w-md w-full p-8 rounded-xl  text-center">
                <motion.div variants={itemVariants}>
                    <Lock className="mx-auto h-20 w-20 text-red-500 mb-6 animate-pulse" />
                </motion.div>
                <motion.h2 className="mt-6 text-4xl font-extrabold text-gray-900" variants={itemVariants}>
                    403 - Access Denied
                </motion.h2>
                <motion.p className="mt-2 text-lg text-gray-600" variants={itemVariants}>
                    You don't have the necessary permissions to view this page.
                </motion.p>
                <motion.p className="mt-2 text-sm text-gray-500" variants={itemVariants}>
                    Please contact an administrator if you believe this is an error.
                </motion.p>
                <motion.div className="mt-8" variants={itemVariants}>
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                        Go to Dashboard Overview
                    </Link>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Forbidden;