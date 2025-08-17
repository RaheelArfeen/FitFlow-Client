import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { AlertTriangle, Home, ArrowLeft, RefreshCw, Activity } from 'lucide-react';
import { Title } from 'react-head';

// A custom hook to manage and retrieve the theme from localStorage
const useTheme = () => {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const localTheme = localStorage.getItem('fitTheme');
        if (localTheme) {
            setTheme(localTheme);
        }
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    return [theme, setTheme];
};

const ErrorPage = ({
    title = "Oops! Something went wrong",
    message = "We're sorry, but something unexpected happened. Please try again or contact support if the problem persists.",
    showBackButton = true,
    showHomeButton = true,
    showRefreshButton = true
}) => {
    const navigate = useNavigate();
    const [theme] = useTheme(); // Get the current theme from the custom hook

    const handleRefresh = () => {
        window.location.reload();
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 dark:from-gray-950 dark:to-gray-700 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <Title>Not Found | FitFlow</Title>

                {/* Error Icon and Message */}
                <div className="mb-8">
                    <div className="mx-auto w-24 h-24 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-6">
                        <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-300" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">{title}</h1>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">{message}</p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                    {showHomeButton && (
                        <Link
                            to="/"
                            className="w-full bg-blue-700 dark:bg-blue-800 hover:bg-blue-800 dark:hover:bg-blue-900 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                            <Home className="h-5 w-5" />
                            <span>Go to Homepage</span>
                        </Link>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {showBackButton && (
                            <button
                                onClick={handleGoBack}
                                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                <span>Go Back</span>
                            </button>
                        )}

                        {showRefreshButton && (
                            <button
                                onClick={handleRefresh}
                                className="bg-orange-600 dark:bg-orange-800 hover:bg-orange-700 dark:hover:bg-orange-900 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                            >
                                <RefreshCw className="h-5 w-5" />
                                <span>Refresh</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Help Section */}
                <div className="mt-8 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Need help? Contact our support team at{' '}
                        <a href="mailto:support@fitflow.com" className="text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-500 font-medium">
                            support@fitflow.com
                        </a>
                    </p>
                </div>

                {/* Error Code */}
                <div className="mt-6">
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                        Error Code: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;