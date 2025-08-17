import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Clock, Trophy, Heart, Zap } from 'lucide-react';

const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            delay: i * 0.15,
            duration: 0.5,
            ease: "easeOut"
        }
    })
};

const FeaturedSection = () => {
    const features = [
        {
            icon: Target,
            title: "Personalized Training",
            description: "Receive fully customized workout programs tailored specifically to your unique fitness goals, body type, and current fitness level, ensuring optimal results."
        },
        {
            icon: Users,
            title: "Expert Trainers",
            description: "Train with certified fitness professionals who offer personalized guidance, motivation, and accountability throughout every stage of your fitness journey."
        },
        {
            icon: Clock,
            title: "Flexible Scheduling",
            description: "Easily book sessions that work around your daily routine with our seamless and user-friendly scheduling system, perfect for busy lifestyles."
        },
        {
            icon: Trophy,
            title: "Track Progress",
            description: "Stay motivated by tracking your fitness achievements with real-time analytics, milestone badges, and detailed performance insights over time."
        },
        {
            icon: Heart,
            title: "Community Support",
            description: "Become part of a vibrant and encouraging community of like-minded fitness enthusiasts who share tips, support each other, and grow together."
        },
        {
            icon: Zap,
            title: "Diverse Classes",
            description: "Access an extensive range of fitness classes—from high-intensity interval training and strength training to yoga and mindfulness—all in one place."
        }
    ];

    return (
        <section className="py-24 bg-gray-50 dark:bg-gray-900">
            <div className="md:container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="text-center mb-20"
                    initial={{ opacity: 0, y: -30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-4xl sm:text-5xl font-bold text-gray-800 dark:text-white mb-5">
                        Why Choose FitFlow?
                    </h2>
                    <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        Experience the future of fitness with our comprehensive platform designed to support your wellness journey.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl group hover:shadow-2xl transition-shadow duration-300"
                            custom={index}
                            variants={cardVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <motion.div
                                className="flex items-center mb-6"
                                initial={false}
                                animate={{}}
                            >
                                <div className="bg-gradient-to-r from-blue-600 to-orange-600 p-4 rounded-xl transform transition-transform duration-300 group-hover:scale-110">
                                    <feature.icon className="h-8 w-8 text-white" />
                                </div>
                            </motion.div>
                            <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedSection;