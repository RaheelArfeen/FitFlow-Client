import React from 'react';
import { ArrowRight } from 'lucide-react';
import bannerImg from '../../assets/banner.jpeg';
import { Link } from 'react-router';
import { motion } from 'framer-motion';

const Banner = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 10,
            },
        },
    };

    const imageVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                type: 'spring',
                stiffness: 50,
                damping: 10,
                delay: 0.5,
            },
        },
    };

    const floatingVariants = {
        animate: {
            y: [0, -10, 0],
            x: [0, 5, 0],
            transition: {
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                repeatType: "reverse",
            },
        },
    };

    const pulseVariants = {
        animate: {
            scale: [1, 1.05, 1],
            transition: {
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                repeatType: "reverse",
            },
        },
    };

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-orange-600 text-white">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative md:container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    {/* Content */}
                    <div className="space-y-8">
                        <motion.div className="space-y-4" variants={itemVariants}>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                                Transform Your
                                <span className="block text-orange-300">Fitness Journey</span>
                            </h1>
                            <p className="text-xl text-blue-100 max-w-xl">
                                Connect with expert trainers, join engaging classes, and track your progress in a supportive community designed for your success.
                            </p>
                        </motion.div>

                        <motion.div className="flex flex-col sm:flex-row gap-4" variants={itemVariants}>
                            <Link to={'/classes'}>
                                <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-200 transform hover:scale-105">
                                    <span>Explore Classes</span>
                                    <ArrowRight className="h-5 w-5" />
                                </button>
                            </Link>

                            <Link to={'/dashboard'}>
                                <button className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-200 border border-white/30">
                                    <span>Go to Dashboard</span>
                                </button>
                            </Link>
                        </motion.div>

                        {/* Stats */}
                        <motion.div className="grid grid-cols-3 gap-8 pt-8" variants={itemVariants}>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-orange-300">10K+</div>
                                <div className="text-sm text-blue-100">Active Members</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-orange-300">500+</div>
                                <div className="text-sm text-blue-100">Expert Trainers</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-orange-300">50+</div>
                                <div className="text-sm text-blue-100">Class Types</div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Image/Visual */}
                    <motion.div className="relative" variants={imageVariants}>
                        <motion.div
                            className="aspect-square bg-gradient-to-br from-orange-400 to-orange-600 rounded-full opacity-20 absolute -top-4 -right-4 w-72 h-72"
                            variants={floatingVariants}
                            animate="animate"
                        ></motion.div>
                        <motion.div
                            className="aspect-square bg-gradient-to-br from-green-400 to-green-600 rounded-full opacity-20 absolute -bottom-4 -left-4 w-48 h-48"
                            variants={floatingVariants}
                            animate="animate"
                            transition={{ ...floatingVariants.animate.transition, delay: 0.5 }}
                        ></motion.div>
                        <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                            <img
                                src={bannerImg}
                                alt="Fitness Training"
                                className="rounded-lg w-full h-[450px] object-cover"
                            />
                            <motion.div
                                className="absolute bottom-2.5 right-2.5 bg-green-600 text-white py-2 px-6 rounded-full"
                                initial={{ opacity: 0, x: 50 }}
                                animate={["visible", "animate"]}
                                variants={{
                                    visible: { opacity: 1, x: 0, transition: { delay: 1, type: 'spring', stiffness: 100, damping: 10 } },
                                    animate: pulseVariants.animate
                                }}
                            >
                                <div className="text-xl font-bold">98% Success Rate</div>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default Banner;