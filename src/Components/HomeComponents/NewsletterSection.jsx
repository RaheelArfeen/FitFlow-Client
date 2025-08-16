import React, { useState } from 'react';
import { Mail, CheckCircle, XCircle } from 'lucide-react'; // Import XCircle for unsubscribe icon
import useAxiosSecure from '../../Provider/UseAxiosSecure'; // Assuming this hook is correctly set up for your API calls

const NewsletterSection = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [formStatus, setFormStatus] = useState(null); // 'subscribed', 'unsubscribed', 'error', null
    const [errorMessage, setErrorMessage] = useState(null);
    const [showUnsubscribeForm, setShowUnsubscribeForm] = useState(false);
    const [unsubscribeEmail, setUnsubscribeEmail] = useState('');

    const axiosSecure = useAxiosSecure(); // Your custom axios instance

    // Handles the newsletter subscription
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormStatus(null); // Clear previous status
        setErrorMessage(null); // Clear previous error

        try {
            const res = await axiosSecure.post('/newsletter/subscribe', { name, email });

            if (res.status === 201 || res.status === 200) { // 200 for re-subscription
                setFormStatus('subscribed');
                setTimeout(() => {
                    setFormStatus(null);
                    setEmail('');
                    setName('');
                }, 3000); // Clear message after 3 seconds
            }
        } catch (err) {
            if (err.response?.status === 409) {
                setErrorMessage('You are already subscribed.');
            } else {
                setErrorMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
            }
            setFormStatus('error'); // Set status to error
        }
    };

    // Handles the newsletter unsubscription
    const handleUnsubscribe = async (e) => {
        e.preventDefault();
        setFormStatus(null); // Clear previous status
        setErrorMessage(null); // Clear previous error

        try {
            const res = await axiosSecure.post('/newsletter/unsubscribe', { email: unsubscribeEmail });

            if (res.status === 200) {
                setFormStatus('unsubscribed');
                setTimeout(() => {
                    setFormStatus(null);
                    setUnsubscribeEmail('');
                    setShowUnsubscribeForm(false); // Hide the form after successful unsubscribe
                }, 3000); // Clear message after 3 seconds
            }
        } catch (err) {
            if (err.response?.status === 404) {
                setErrorMessage('Email not found. You might not be subscribed.');
            } else {
                setErrorMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
            }
            setFormStatus('error'); // Set status to error
        }
    };

    const renderFormContent = () => {
        if (formStatus === 'subscribed') {
            return (
                <div className="text-center py-10">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold mb-2">Subscribed!</h3>
                    <p className="text-blue-100">
                        You've successfully subscribed to FitFlow. Welcome!
                    </p>
                </div>
            );
        }

        if (formStatus === 'unsubscribed') {
            return (
                <div className="text-center py-10">
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" /> {/* Or a specific unsubscribe icon */}
                    <h3 className="text-2xl font-semibold mb-2">Unsubscribed!</h3>
                    <p className="text-blue-100">
                        You have successfully unsubscribed from FitFlow newsletters.
                    </p>
                </div>
            );
        }

        if (showUnsubscribeForm) {
            return (
                <form onSubmit={handleUnsubscribe} className="space-y-5">
                    <h3 className="text-2xl font-semibold mb-4 text-center text-white">Unsubscribe</h3>
                    <input
                        type="email"
                        placeholder="Your Email Address to Unsubscribe"
                        value={unsubscribeEmail}
                        onChange={(e) => setUnsubscribeEmail(e.target.value)}
                        required
                        className="w-full px-5 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    {errorMessage && (
                        <p className="text-sm text-red-200 text-center -mt-2">{errorMessage}</p>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-red-500 hover:bg-red-600 transition duration-200 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
                    >
                        <XCircle className="w-5 h-5" />
                        <span>Unsubscribe Now</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setShowUnsubscribeForm(false);
                            setErrorMessage(null); // Clear error when canceling
                            setFormStatus(null); // Clear any pending status
                        }}
                        className="w-full mt-2 text-sm text-blue-100 hover:underline"
                    >
                        Cancel
                    </button>
                </form>
            );
        }

        return (
            <form onSubmit={handleSubmit} className="space-y-5">
                <input
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-5 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <input
                    type="email"
                    placeholder="Your Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-5 py-3 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                {errorMessage && (
                    <p className="text-sm text-red-200 text-center -mt-2">{errorMessage}</p>
                )}
                <button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 transition duration-200 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
                >
                    <Mail className="w-5 h-5" />
                    <span>Subscribe Now</span>
                </button>
            </form>
        );
    };

    return (
        <section className="py-20 bg-gradient-to-br from-blue-700 to-orange-600 text-white">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-4">
                        Stay Updated with <span className="text-orange-300">FitFlow</span>
                    </h2>
                    <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                        Get the latest fitness tips, workout plans, and exclusive content delivered straight to your inbox.
                    </p>
                </div>

                <div className="max-w-xl mx-auto bg-white/10 p-8 rounded-2xl shadow-lg backdrop-blur">
                    {renderFormContent()}
                    <p className="text-sm text-blue-100 text-center mt-6">
                        We respect your privacy.
                        {!showUnsubscribeForm && formStatus !== 'subscribed' && formStatus !== 'unsubscribed' && (
                            <>
                                {' '}
                                <button
                                    onClick={() => {
                                        setShowUnsubscribeForm(true);
                                        setErrorMessage(null); // Clear any previous errors when showing unsubscribe form
                                        setFormStatus(null); // Clear any success/error message
                                    }}
                                    className="text-orange-300 hover:underline font-bold"
                                >
                                    Unsubscribe here.
                                </button>
                            </>
                        )}
                    </p>
                </div>

                {/* Newsletter Perks */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-center">
                    {[
                        {
                            icon: <Mail className="h-8 w-8 text-white" />,
                            title: 'Weekly Tips',
                            desc: 'Get expert fitness and nutrition advice every week.',
                        },
                        {
                            icon: <CheckCircle className="h-8 w-8 text-white" />,
                            title: 'Exclusive Content',
                            desc: 'Access subscriber-only workouts and challenges.',
                        },
                        {
                            icon: <Mail className="h-8 w-8 text-white" />,
                            title: 'Special Offers',
                            desc: 'Be the first to know about discounts and promotions.',
                        },
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center bg-white/10 p-6 rounded-xl shadow-md">
                            <div className="bg-white/20 p-4 rounded-full mb-4">
                                {item.icon}
                            </div>
                            <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                            <p className="text-sm text-blue-100">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default NewsletterSection;