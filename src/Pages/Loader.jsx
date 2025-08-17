import React, { useEffect } from 'react';
import { Activity } from 'lucide-react';
import { Title } from 'react-head';

const Loader = ({ message = 'Loading...', size = 'large' }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center bg-[#f9fafb] dark:bg-gray-900 fixed top-0 left-0 z-50 min-h-screen h-full w-full">
            <Title>FitFlow</Title>
            <div className="relative mb-10 scale-125">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-orange-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-gradient-to-r from-blue-700 to-orange-600 p-4 rounded-2xl">
                    <Activity className="h-12 w-12 text-white" />
                </div>
            </div>

            <div className="flex space-x-4 mb-6">
                <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-4 h-4 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-4 h-4 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>

            <p className="text-gray-700 font-semibold text-xl animate-pulse dark:text-gray-300">
                {message}
            </p>

            <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-6 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-orange-600 rounded-full animate-pulse"></div>
            </div>
        </div>
    );
};

export default Loader;