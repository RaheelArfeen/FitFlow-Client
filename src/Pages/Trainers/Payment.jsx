import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router"; // Changed to react-router-dom
import { motion } from "framer-motion"; // Import motion
import Loading from "../../Pages/Loader";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    CardElement,
    useElements,
    useStripe,
} from "@stripe/react-stripe-js";
import { AuthContext } from "../../Provider/AuthProvider";
import { CreditCard, Lock } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";

// Your Stripe publishable key here
const stripePromise = loadStripe(import.meta.env.VITE_PAYMENT_KEY,);

// Static membershipPackages
const membershipPackages = [
    {
        id: "basic",
        name: "Basic Membership",
        price: 10,
        features: [
            "Access to gym facilities during regular operating hours",
            "Use of cardio and strength training equipment",
            "Access to locker rooms and showers",
        ],
    },
    {
        id: "standard",
        name: "Standard Membership",
        price: 50,
        features: [
            "All benefits of the basic membership",
            "Access to group fitness classes such as yoga, spinning, and Zumba",
            "Use of additional amenities like a sauna or steam room",
        ],
    },
    {
        id: "premium",
        name: "Premium Membership",
        price: 100,
        features: [
            "All benefits of the standard membership",
            "Access to personal training sessions with certified trainers",
            "Discounts on additional services such as massage therapy or nutrition counseling",
        ],
    },
];

const CARD_OPTIONS = {
    style: {
        base: {
            fontSize: "16px",
            color: "#32325d",
            "::placeholder": {
                color: "#a0aec0",
            },
        },
        invalid: {
            color: "#e53e3e",
        },
    },
};

const PaymentForm = () => {
    const { trainerId, slotId, packageId } = useParams(); // Removed slotName as it's not used
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();

    const [trainers, setTrainers] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [clientSecret, setClientSecret] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const selectedPackage = membershipPackages.find((p) => p.id === packageId);
    const trainer = trainers.find((t) => t._id === trainerId);
    const slot = trainer?.slots.find((s) => s.id === slotId);

    // Fetch trainers from backend
    useEffect(() => {
        axios
            .get("http://localhost:3000/trainers")
            .then((res) => {
                setTrainers(res.data);
                setIsLoading(false);
            })
            .catch(() => {
                setFetchError("Failed to fetch trainer data.");
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    // Create payment intent
    useEffect(() => {
        if (selectedPackage?.price) {
            axios
                .post("http://localhost:3000/create-payment-intent", {
                    price: selectedPackage.price,
                })
                .then((res) => setClientSecret(res.data.clientSecret))
                .catch(() =>
                    Swal.fire("Error", "Failed to initiate payment.", "error")
                );
        }
    }, [selectedPackage?.price]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);
        const card = elements.getElement(CardElement);

        const { paymentIntent, error } = await stripe.confirmCardPayment(
            clientSecret,
            {
                payment_method: {
                    card,
                    billing_details: {
                        name: user?.name || "Unknown",
                        email: user?.email || "noemail@example.com",
                    },
                },
            }
        );

        if (error) {
            Swal.fire("Payment Failed", error.message, "error");
            setIsProcessing(false);
        } else if (paymentIntent.status === "succeeded") {
            const bookingData = {
                email: user?.email,
                trainerId,
                slotId,
                slotName: slot.name,
                packageId,
                price: selectedPackage.price,
                transactionId: paymentIntent.id,
                paymentStatus: "paid",
                createdAt: new Date().toISOString(),
            };

            try {
                await axios.post("http://localhost:3000/bookings", bookingData, {
                    withCredentials: true,
                });
                Swal.fire("Payment Successful", "Your booking is confirmed!", "success");
                navigate("/dashboard");
            } catch (err) {
                Swal.fire(
                    "Booking Error",
                    "Payment succeeded, but booking failed. Please contact support.",
                    "warning"
                );
                console.error("Booking error:", err);
            } finally {
                setIsProcessing(false);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-xl font-semibold">
                <Loading />
            </div>
        );
    }

    if (fetchError || !trainer || !slot || !selectedPackage) {
        return (
            <motion.div
                className="min-h-screen bg-gray-50 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-center">
                    <motion.h2
                        className="text-2xl font-bold text-gray-800 mb-4"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        Payment Information Not Found
                    </motion.h2>
                    <motion.button
                        onClick={() => navigate("/trainers")}
                        className="text-blue-700 hover:text-blue-800"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Back to Trainers
                    </motion.button>
                </div>
            </motion.div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    return (
        <motion.div
            className="bg-gray-50 py-12"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-8" variants={containerVariants}>
                    {/* Stripe Form */}
                    <motion.div
                        className="bg-white rounded-xl shadow-lg p-8"
                        variants={itemVariants}
                    >
                        <motion.div className="flex items-center mb-6" variants={itemVariants}>
                            <CreditCard className="h-6 w-6 text-blue-700 mr-2" />
                            <h2 className="text-2xl font-bold text-gray-800">Payment Details</h2>
                        </motion.div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <motion.div variants={itemVariants}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Card Info
                                </label>
                                <div className="border border-gray-300 rounded-lg p-4">
                                    <CardElement options={CARD_OPTIONS} />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={user?.email || ""}
                                    readOnly
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                                />
                            </motion.div>

                            <motion.button
                                type="submit"
                                disabled={!stripe || isProcessing}
                                className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                variants={itemVariants}
                            >
                                <Lock className="h-5 w-5" />
                                <span>{isProcessing ? "Processing..." : `Pay $${selectedPackage.price}`}</span>
                            </motion.button>
                        </form>

                        <motion.div
                            className="mt-6 text-center text-sm text-gray-500"
                            variants={itemVariants}
                        >
                            <p>Your payment is secured with Stripe</p>
                        </motion.div>
                    </motion.div>

                    {/* Order Summary */}
                    <motion.div
                        className="bg-white rounded-xl shadow-lg p-8"
                        variants={itemVariants}
                    >
                        <motion.h2
                            className="text-2xl font-bold text-gray-800 mb-6"
                            variants={itemVariants}
                        >
                            Order Summary
                        </motion.h2>
                        <motion.div className="space-y-4 mb-6" variants={containerVariants}>
                            <motion.div className="flex justify-between" variants={itemVariants}>
                                <span className="text-gray-600">Trainer:</span>
                                <span className="font-medium">{trainer.name}</span>
                            </motion.div>
                            <motion.div className="flex justify-between" variants={itemVariants}>
                                <span className="text-gray-600">Slot:</span>
                                <span className="font-medium">{slot.name}</span>
                            </motion.div>
                            <motion.div className="flex justify-between" variants={itemVariants}>
                                <span className="text-gray-600">Time:</span>
                                <span className="font-medium">{slot.time}</span>
                            </motion.div>
                            <motion.div className="flex justify-between" variants={itemVariants}>
                                <span className="text-gray-600">Day:</span>
                                <span className="font-medium">{slot.day}</span>
                            </motion.div>
                            <motion.div className="flex justify-between" variants={itemVariants}>
                                <span className="text-gray-600">Package:</span>
                                <span className="font-medium">{selectedPackage.name}</span>
                            </motion.div>
                        </motion.div>
                        <motion.div className="border-t pt-4 mb-6" variants={itemVariants}>
                            <div className="flex justify-between text-lg font-semibold">
                                <span>Total:</span>
                                <span className="text-blue-700">${selectedPackage.price}</span>
                            </div>
                        </motion.div>
                        <motion.div
                            className="bg-blue-50 p-4 rounded-lg"
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                        >
                            <h3 className="font-semibold text-blue-800 mb-2">Package Includes:</h3>
                            <ul className="space-y-1">
                                {selectedPackage.features.map((feature, index) => (
                                    <motion.li
                                        key={index}
                                        className="text-sm text-blue-700"
                                        initial={{ x: -10, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        • {feature}
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    );
};

const PaymentPage = () => {
    return (
        <Elements stripe={stripePromise}>
            <PaymentForm />
        </Elements>
    );
};

export default PaymentPage;
