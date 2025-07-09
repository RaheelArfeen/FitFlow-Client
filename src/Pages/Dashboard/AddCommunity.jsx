import React, { useContext, useState, useEffect, useRef } from 'react';
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
            likes: 0,
            dislikes: 0,
            views: 0,
            comments: [],
        };

        try {
            const res = await axiosSecure.post('/community', postData, { withCredentials: true });
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

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Add New Forum Post</h1>
                <p className="text-gray-600">Share knowledge and engage with the community.</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Post Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter an engaging title for your post..."
                            required
                        />
                    </div>

                    {/* Category & Tags */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Custom Dropdown */}
                        <div ref={dropdownRef} className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                            <button
                                type="button"
                                onClick={() => setCategoryOpen(!categoryOpen)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left flex justify-between items-center focus:ring-2 focus:ring-blue-500"
                            >
                                <span>{formData.category || 'Select a category'}</span>
                                <svg
                                    className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${categoryOpen ? 'rotate-180' : ''}`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 12a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 9.586l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 12z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>

                            {categoryOpen && (
                                <ul className="absolute z-10 mt-1 h-fit w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5">
                                    {categories.map((category) => (
                                        <li
                                            key={category}
                                            onClick={() => {
                                                setFormData({ ...formData, category });
                                                setCategoryOpen(false);
                                            }}
                                            className={`cursor-pointer select-none py-2 pl-10 pr-4 hover:bg-blue-100 ${formData.category === category ? 'font-semibold text-blue-600' : 'text-gray-900'}`}
                                        >
                                            {category}
                                            {formData.category === category && (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                    ✓
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="fitness, motivation, tips"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Post Content *</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                rows={8}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Write your post content here..."
                                required
                            />
                        </div>
                        <div className="mt-2 text-sm text-gray-500">Minimum 50 characters. Markdown supported.</div>
                    </div>

                    {/* Author Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Author Information</h3>
                        <div className="flex items-center space-x-3">
                            <img src={user?.photoURL} alt={user?.displayName} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                                <div className="font-medium text-gray-800">{user?.displayName}</div>
                                <div className="text-sm text-gray-500 capitalize flex items-center space-x-1">
                                    <span>{user?.role}</span>
                                    {user?.role === 'admin' && <Crown size={15} className="text-yellow-500" />}
                                    {user?.role === 'trainer' && <Trophy size={15} className="text-blue-500" />}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            onClick={() =>
                                setFormData({
                                    title: '',
                                    content: '',
                                    category: '',
                                    tags: '',
                                })
                            }
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg transition"
                        >
                            <Plus className="h-5 w-5" />
                            <span>Publish Post</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCommunity;
