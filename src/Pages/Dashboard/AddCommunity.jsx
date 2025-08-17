import React, { useContext, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    FileText,
    Tag,
    Crown,
    Trophy,
} from 'lucide-react';
import { AuthContext } from '../../Provider/AuthProvider';
import useAxiosSecure from '../../Provider/UseAxiosSecure';
import Swal from 'sweetalert2';

const AddCommunity = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: '',
        tags: '',
    });

    const [categoryOpen, setCategoryOpen] = useState(false);
    const dropdownRef = useRef(null);

    const categories = [
        'Wellness',
        'Success Stories',
        'Nutrition',
        'Training Tips',
        'Mental Health',
        'Equipment',
        'Motivation',
        'General Discussion',
    ];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const postData = {
            ...formData,
            tags: formData.tags.split(',').map(tag => tag.trim()),
            author: user?.displayName || "Anonymous",
            authorPhoto: user?.photoURL || "",
            authorRole: user?.role || "member",
            email: user?.email,
            createdAt: new Date().toISOString(),
            comments: [],
            like: 0,
            dislike: 0,
        };

        try {
            const res = await axiosSecure.post('/community', postData);
            if (res.data.insertedId) {
                Swal.fire('Success', 'Forum post created successfully!', 'success');
                setFormData({
                    title: '',
                    content: '',
                    category: '',
                    tags: '',
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Failed to post. Try again.', 'error');
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setCategoryOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 120,
                damping: 18,
                when: "beforeChildren",
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 150, damping: 20 } }
    };

    const inputVariants = {
        hidden: { opacity: 0, x: -15 },
        visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 150, damping: 20 } }
    };

    const dropdownItemVariants = {
        hidden: { opacity: 0, y: -5 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.08 } }
    };

    return (
        <motion.div
            className="pb-10 p-6 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div className="mb-8" variants={itemVariants}>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Add New Forum Post</h1>
                <p className="text-gray-600 dark:text-gray-400">Share knowledge and engage with the community.</p>
            </motion.div>

            <motion.div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700" variants={itemVariants}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <motion.div variants={inputVariants}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Post Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter an engaging title for your post..."
                            required
                        />
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div ref={dropdownRef} className="relative" variants={inputVariants}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category *</label>
                            <motion.button
                                type="button"
                                onClick={() => setCategoryOpen(!categoryOpen)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-left flex justify-between items-center focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <span>{formData.category || 'Select a category'}</span>
                                <motion.svg
                                    className="h-5 w-5 text-gray-500 dark:text-gray-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    animate={{ rotate: categoryOpen ? 180 : 0 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 12a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 9.586l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 12z"
                                        clipRule="evenodd"
                                    />
                                </motion.svg>
                            </motion.button>

                            {categoryOpen && (
                                <motion.ul
                                    className="absolute z-10 mt-1 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 max-h-60 border border-gray-200 dark:border-gray-600"
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    {categories.map((category) => (
                                        <li
                                            key={category}
                                            onClick={() => {
                                                setFormData({ ...formData, category });
                                                setCategoryOpen(false);
                                            }}
                                            className={`cursor-pointer select-none flex py-2 pl-4 pr-4 hover:bg-blue-100 dark:hover:bg-blue-900 ${formData.category === category ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100 scrollbarHidden'}`}
                                            variants={dropdownItemVariants}
                                            whileHover={{ x: 5 }}
                                        >
                                            {formData.category === category && (
                                                <span className="flex items-center pr-3 text-blue-600 dark:text-blue-400">
                                                    ✓
                                                </span>
                                            )}
                                            {category}
                                        </li>
                                    ))}
                                </motion.ul>
                            )}
                        </motion.div>

                        <motion.div variants={inputVariants}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags (comma separated)</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
                                    placeholder="fitness, motivation, tips"
                                />
                            </div>
                        </motion.div>
                    </div>

                    <motion.div variants={inputVariants}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Post Content *</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                rows={8}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
                                placeholder="Write your post content here..."
                                required
                            />
                        </div>
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-500">Minimum 50 characters. Markdown supported.</div>
                    </motion.div>

                    <motion.div className="flex justify-end space-x-4" variants={itemVariants}>
                        <motion.button
                            type="button"
                            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                            onClick={() =>
                                setFormData({
                                    title: '',
                                    content: '',
                                    category: '',
                                    tags: '',
                                })
                            }
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Reset
                        </motion.button>
                        <motion.button
                            type="submit"
                            className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg transition"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Plus className="h-5 w-5" />
                            <span>Publish Post</span>
                        </motion.button>
                    </motion.div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default AddCommunity;