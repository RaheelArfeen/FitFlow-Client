import React from 'react';
import { CheckCircle, Award, Users, Globe } from 'lucide-react';

const AboutSection = () => {
    return (
        <section className="py-20 bg-white dark:bg-gray-800">
            <div className="md:container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Content */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-6">
                                Revolutionizing Fitness
                                <span className="block text-orange-600 dark:text-orange-500">One Journey at a Time</span>
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                                At FitFlow, we believe fitness is more than just exercise—it's a lifestyle transformation.
                                Our platform combines cutting-edge technology with a personalized human touch to create
                                an experience that adapts to your unique needs and goals.
                            </p>
                            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                                Founded by fitness enthusiasts and tech innovators, we're committed to making
                                professional fitness guidance accessible to everyone, everywhere.
                            </p>
                        </div>

                        {/* Features List */}
                        <div className="space-y-4">
                            {[
                                'Certified trainers with 5+ years experience',
                                'AI-powered personalized workout recommendations',
                                '24/7 community support and motivation',
                                'Comprehensive progress tracking and analytics'
                            ].map((feature, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500 flex-shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                </div>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 pt-8">
                            <div className="text-center">
                                <Award className="h-8 w-8 text-orange-600 dark:text-orange-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-gray-800 dark:text-white">ISO</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Certified</div>
                            </div>
                            <div className="text-center">
                                <Users className="h-8 w-8 text-orange-600 dark:text-orange-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-gray-800 dark:text-white">50K+</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Success Stories</div>
                            </div>
                            <div className="text-center">
                                <Globe className="h-8 w-8 text-orange-600 dark:text-orange-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-gray-800 dark:text-white">30+</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Countries</div>
                            </div>
                        </div>
                    </div>

                    {/* Image */}
                    <div className="relative">
                        <div className="aspect-square bg-gradient-to-br from-blue-100 to-orange-100 dark:from-blue-900 dark:to-orange-900 rounded-full absolute -top-4 -right-4 w-72 h-72 opacity-50"></div>
                        <div className="relative">
                            <img
                                src="https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=600"
                                alt="About Us"
                                className="rounded-2xl w-full h-96 object-cover shadow-2xl"
                            />
                            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl">
                                <div className="text-3xl font-bold text-blue-700 dark:text-blue-500">5+</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Years Experience</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;