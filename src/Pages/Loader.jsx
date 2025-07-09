import React from 'react';
import { Activity, Zap, Sparkles } from 'lucide-react';

const Loader = ({ message = 'Loading...', size = 'medium' }) => {
    const sizeClasses = {
        small: 'w-8 h-8',
        medium: 'w-12 h-12',
        large: 'w-16 h-16',
    };

    const containerClasses = {
        small: 'p-4',
        medium: 'p-8',
        large: 'p-12',
    };

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center bg-[#f9fafb] absolute inset-0 top-0 z-50 ${containerClasses[size]}`}>
            {/* Animated Logo */}
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-orange-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-gradient-to-r from-blue-700 to-orange-600 p-2 rounded-xl">
                    <Activity className="h-8 w-8 text-white" />
                </div>
            </div>

            {/* Loading Dots */}
            <div className="flex space-x-2 mb-4">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>

            {/* Loading Text */}
            <p
                className={`text-gray-600 font-medium ${size === 'small' ? 'text-sm' : size === 'medium' ? 'text-base' : 'text-lg'
                    } animate-pulse`}
            >
                {message}
            </p>

            {/* Progress Bar */}
            <div className="w-32 h-1 bg-gray-200 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-orange-600 rounded-full animate-pulse"></div>
            </div>
        </div>
    );
};

export default Loader;
