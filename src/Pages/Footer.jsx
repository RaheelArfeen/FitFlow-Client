import React from 'react';
import { NavLink, Link } from 'react-router'; // Import NavLink
import { Activity, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
    // Helper function for NavLink active styling
    const getNavLinkClass = ({ isActive }) =>
        `transition-colors duration-200 ${isActive ? 'text-blue-400 font-semibold' : 'text-gray-300 hover:text-white'
        }`;

    return (
        <footer className="bg-gray-800 text-white">
            <div className="md:container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Company Info - With Header's Gradient Logo */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-orange-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative bg-gradient-to-r from-blue-700 to-orange-600 p-2 rounded-xl">
                                    <Activity className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-orange-600 bg-clip-text text-transparent">
                                    FitFlow
                                </span>
                                <span className="text-xs text-gray-400 -mt-1">Fitness Platform</span>
                            </div>
                        </Link>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Empowering your fitness journey with innovative technology and personalized training experiences.
                        </p>
                        <div className="flex space-x-4">
                            <Facebook className="h-5 w-5 text-gray-400 hover:text-blue-500 cursor-pointer transition-colors duration-200" />
                            <Twitter className="h-5 w-5 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors duration-200" />
                            <Instagram className="h-5 w-5 text-gray-400 hover:text-pink-500 cursor-pointer transition-colors duration-200" />
                            <Youtube className="h-5 w-5 text-gray-400 hover:text-red-500 cursor-pointer transition-colors duration-200" />
                        </div>
                    </div>

                    {/* Navigation Links - Now with NavLink active styling */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <NavLink to="/" className={getNavLinkClass}>Home</NavLink>
                            </li>
                            <li>
                                <NavLink to="/trainers" className={getNavLinkClass}>Trainers</NavLink>
                            </li>
                            <li>
                                <NavLink to="/classes" className={getNavLinkClass}>Classes</NavLink>
                            </li>
                            <li>
                                <NavLink to="/community" className={getNavLinkClass}>Community</NavLink>
                            </li>
                            <li>
                                {/* Dashboard link might only be visible to logged-in users, but NavLink handles it */}
                                <NavLink to="/dashboard" className={getNavLinkClass}>Dashboard</NavLink>
                            </li>
                        </ul>
                    </div>

                    {/* Account & Support - Now with NavLink active styling */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Account & Support</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <NavLink to="/login" className={getNavLinkClass}>Login</NavLink>
                            </li>
                            <li>
                                <NavLink to="/register" className={getNavLinkClass}>Register</NavLink>
                            </li>
                            <li>
                                {/* Assuming '/profile' is where a user's profile is, similar to the dropdown */}
                                <NavLink to="/profile" className={getNavLinkClass}>Profile</NavLink>
                            </li>
                            <li>
                                <Link to="/be-trainer" className="text-gray-300 hover:text-white transition-colors duration-200">Become a Trainer</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-orange-600" />
                                <span className="text-gray-300">123 Fitness Street, Health City, HC 12345</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-orange-600" />
                                <span className="text-gray-300">+1 (555) 123-4567</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-orange-600" />
                                <span className="text-gray-300">info@fitflow.com</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-300">
                    <p>&copy; 2024 FitFlow. All rights reserved. Designed with ❤️ for your fitness journey.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;