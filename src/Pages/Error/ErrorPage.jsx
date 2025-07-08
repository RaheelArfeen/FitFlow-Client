import React from 'react';
import { Link, useNavigate } from 'react-router';
import { AlertTriangle, Home, ArrowLeft, RefreshCw, Activity } from 'lucide-react';

const ErrorPage = ({
    title = "Oops! Something went wrong",
    message = "We're sorry, but something unexpected happened. Please try again or contact support if the problem persists.",
    showBackButton = true,
    showHomeButton = true,
    showRefreshButton = true
}) => {
    const navigate = useNavigate();

    const handleRefresh = () => {
        window.location.reload();
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">

                {/* Error Icon and Message */}
                <div className="mb-8">
                    <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                        <AlertTriangle className="h-12 w-12 text-red-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
                    <p className="text-gray-600 leading-relaxed mb-8">{message}</p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                    {showHomeButton && (
                        <Link
                            to="/"
                            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                            <Home className="h-5 w-5" />
                            <span>Go to Homepage</span>
                        </Link>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {showBackButton && (
                            <button
                                onClick={handleGoBack}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                <span>Go Back</span>
                            </button>
                        )}

                        {showRefreshButton && (
                            <button
                                onClick={handleRefresh}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                            >
                                <RefreshCw className="h-5 w-5" />
                                <span>Refresh</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Help Section */}
                <div className="mt-8 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                    <p className="text-sm text-gray-600">
                        Need help? Contact our support team at{' '}
                        <a href="mailto:support@fitflow.com" className="text-blue-700 hover:text-blue-800 font-medium">
                            support@fitflow.com
                        </a>
                    </p>
                </div>

                {/* Error Code */}
                <div className="mt-6">
                    <p className="text-xs text-gray-400">
                        Error Code: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ErrorPage;
