import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "framer-motion";
import Loading from "../Loader";
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    CardElement,
    useElements,
    useStripe,
} from "@stripe/react-stripe-js";
import { AuthContext } from "../../Provider/AuthProvider";
import { CreditCard, Lock } from "lucide-react"; // <-- CORRECTED: Lock is now explicitly imported
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import useAxiosSecure from '../../Provider/UseAxiosSecure'
import { Title } from "react-head";

// Load Stripe outside of component render
const stripePromise = loadStripe(import.meta.env.VITE_PAYMENT_KEY);

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
            "::placeholder": { color: "#a0aec0" },
        },
        invalid: { color: "#e53e3e" },
    },
};

const PaymentForm = () => {
    const { trainerId, slotId, packageId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    const [clientSecret, setClientSecret] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const selectedPackage = membershipPackages.find((p) => p.id === packageId);

    const {
        data: trainers = [],
        isLoading,
        error: fetchError,
        refetch,
    } = useQuery({
        queryKey: ["trainers"],
        queryFn: async () => {
            const res = await axiosSecure.get("/trainers");
            return res.data;
        },
        enabled: !!trainerId,
    });

    const trainer = trainers.find((t) => t._id === trainerId);
    const slot = trainer?.slots?.find((s) => s.id === slotId);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        if (!selectedPackage?.price) {
            return;
        }

        const fetchClientSecret = async () => {
            try {
                const res = await axiosSecure.post("/create-payment-intent", {
                    amount: selectedPackage.price,
                });
                setClientSecret(res.data.clientSecret);
            } catch (error) {
                console.error("Payment intent error:", error);
                Swal.fire("Error", "Failed to initiate payment. Please try again.", "error");
                navigate(-1);
            }
        };

        fetchClientSecret();
    }, [selectedPackage?.price, axiosSecure, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements || !clientSecret || isProcessing) {
            return;
        }

        setIsProcessing(true);
        const card = elements.getElement(CardElement);

        try {
            const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card,
                    billing_details: {
                        name: user?.displayName || "Unknown",
                        email: user?.email || "noemail@example.com",
                    },
                },
            });

            if (error) {
                Swal.fire("Payment Failed", error.message, "error");
            } else if (paymentIntent.status === "succeeded") {
                const bookingData = {
                    email: user?.email,
                    trainerId,
                    slotId,
                    slotName: slot?.slotName || "",
                    slotDay: slot?.days || [],
                    slotDuration: slot?.duration || "",
                    slotTime: slot?.slotTime || "",
                    packageId,
                    packageName: selectedPackage?.name || "",
                    packagePrice: selectedPackage?.price || 0,
                    sessionType: selectedPackage?.name?.toLowerCase().includes("personal") ? "personal" : "group",
                    price: selectedPackage.price,
                    transactionId: paymentIntent.id,
                    paymentStatus: "Completed",
                    createdAt: new Date().toISOString(),
                    memberInfo: {
                        name: user?.displayName,
                        email: user?.email,
                        phone: user?.phoneNumber || "N/A",
                        package: selectedPackage?.name,
                    },
                };

                const bookingResponse = await axiosSecure.post("/bookings", bookingData);

                if (bookingResponse.data.message === 'Booking successful and slot booking count updated!') {
                    Swal.fire("Payment Successful", "Your booking is confirmed!", "success");
                    queryClient.invalidateQueries(['trainerData', trainer?.email]);
                    queryClient.invalidateQueries(['trainers']);
                    navigate("/trainers");
                } else {
                    Swal.fire(
                        "Booking Issue",
                        bookingResponse.data.message || "Payment succeeded, but there was an issue confirming your booking.",
                        "warning"
                    );
                }

            } else {
                Swal.fire("Payment Status", "Payment did not succeed. Please try again.", "info");
            }
        } catch (err) {
            console.error("Payment or Booking submission error:", err);
            Swal.fire(
                "Error",
                err.response?.data?.message || "An unexpected error occurred during booking. Please try again.",
                "error"
            );
        } finally {
            setIsProcessing(false);
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
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h2 className="text-xl font-semibold text-red-600 mb-4">
                    Error loading booking details.
                </h2>
                <p className="text-gray-700 mb-4">
                    Trainer, slot, or package information could not be found.
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <motion.div className="bg-gray-50 py-12" initial="hidden" animate="visible">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Payment Form */}
                    <motion.div className="bg-white rounded-xl shadow-lg p-8">
                        <div className="flex items-center mb-6">
                            <CreditCard className="h-6 w-6 text-blue-700 mr-2" />
                            <h2 className="text-2xl font-bold text-gray-800">Payment Details</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Card Info</label>
                                <div className="border border-gray-300 rounded-lg p-4">
                                    <CardElement options={CARD_OPTIONS} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Email</label>
                                <input
                                    type="email"
                                    readOnly
                                    value={user?.email || ""}
                                    className="w-full px-4 py-3 border rounded-lg bg-gray-100"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!stripe || isProcessing || !clientSecret}
                                className={`w-full py-3 rounded-lg font-semibold ${!stripe || isProcessing || !clientSecret
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-blue-700 text-white hover:bg-blue-800"
                                    }`}
                            >
                                {isProcessing ? "Processing..." : `Pay $${selectedPackage.price}`}
                            </button>
                        </form>
                        <p className="mt-4 text-center text-sm text-gray-500">
                            <Lock className="inline-block h-4 w-4 mr-1 mb-1 text-gray-400" /> {/* This is where <Lock> is used */}
                            Your payment is secured with Stripe.
                        </p>
                    </motion.div>

                    {/* Order Summary */}
                    <motion.div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between"><span>Trainer:</span><span>{trainer.name}</span></div>
                            <div className="flex justify-between"><span>Slot:</span><span>{slot.slotName}</span></div>
                            <div className="flex justify-between"><span>Time:</span><span>{slot.slotTime}</span></div>
                            <div className="flex justify-between"><span>Duration:</span><span>{slot.duration}</span></div>
                            <div className="flex justify-between"><span>Day:</span><span>{Array.isArray(slot.days) ? slot.days.join(', ') : slot.days}</span></div>
                            <div className="flex justify-between"><span>Package:</span><span>{selectedPackage.name}</span></div>
                        </div>
                        <div className="flex justify-between text-lg font-semibold border-t pt-4">
                            <span>Total:</span>
                            <span className="text-blue-700">${selectedPackage.price}</span>
                        </div>
                        <div className="bg-blue-50 mt-6 p-4 rounded-lg">
                            <h3 className="font-semibold mb-2 text-blue-800">Package Includes:</h3>
                            <ul className="list-disc list-inside text-blue-700 text-sm">
                                {selectedPackage.features.map((f, i) => (
                                    <li key={i}>{f}</li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

const Payment = () => (
    <Elements stripe={stripePromise}>
        <Title>Payment | FitFlow</Title>

        <PaymentForm />
    </Elements>
);

export default Payment;