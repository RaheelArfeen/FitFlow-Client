import React, { useContext, useState, useEffect, useRef } from 'react';
import {
    Plus,
    FileText,
    Tag,
    Crown,
    Trophy,
    ThumbsUp,
    ThumbsDown,
    MessageCircle,
    Eye,
} from 'lucide-react';
import { AuthContext } from '../../Provider/AuthProvider';

const AddCommunity = () => {
    const { user } = useContext(AuthContext);
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

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Adding new forum post:', {
            ...formData,
            author: user?.displayName,
            authorRole: user?.role,
            createdAt: new Date().toISOString(),
        });
        alert('Forum post created successfully!');
        setFormData({
            title: '',
            content: '',
            category: '',
            tags: '',
        });
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setCategoryOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div>
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent flex justify-between items-center"
                                aria-haspopup="listbox"
                                aria-expanded={categoryOpen}
                            >
                                <span>{formData.category || 'Select a category'}</span>
                                <svg
                                    className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${categoryOpen ? 'transform rotate-180' : ''
                                        }`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 12a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 9.586l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 12z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>

                            {categoryOpen && (
                                <ul
                                    tabIndex={-1}
                                    role="listbox"
                                    className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                                >
                                    {categories.map((category) => (
                                        <li
                                            key={category}
                                            role="option"
                                            aria-selected={formData.category === category}
                                            onClick={() => {
                                                setFormData({ ...formData, category });
                                                setCategoryOpen(false);
                                            }}
                                            className={`cursor-pointer select-none relative py-2 pl-10 pr-4 hover:bg-blue-100 ${formData.category === category ? 'font-semibold text-blue-600' : 'text-gray-900'
                                                }`}
                                        >
                                            {category}
                                            {formData.category === category && (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                                    <svg
                                                        className="h-5 w-5"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                        aria-hidden="true"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Tags Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Write your post content here. Share your knowledge, experiences, or ask questions to engage with the community..."
                                required
                            />
                        </div>
                        <div className="mt-2 text-sm text-gray-500">Minimum 50 characters. You can use markdown formatting.</div>
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

                    {/* Preview Section */}
                    {formData.title && formData.content && (
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Preview</h3>
                            <div className="bg-gray-50 rounded-lg p-6">
                                <div className="flex items-center mb-4">
                                    <img src={user?.photoURL} alt={user?.displayName} className="w-10 h-10 rounded-full object-cover mr-3" />
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                            <h4 className="font-semibold text-gray-800 text-sm">{user?.displayName}</h4>
                                            {user?.role !== 'member' && (
                                                <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
                                                    {user?.role === 'admin' && <Crown size={14} className="text-yellow-500" />}
                                                    {user?.role === 'trainer' && <Trophy size={14} className="text-blue-500" />}
                                                    <span className="text-xs font-medium text-gray-700 capitalize">{user?.role}</span>
                                                </div>
                                            )}
                                            <span className="text-xs text-gray-500">• just now</span>
                                        </div>
                                        {formData.category && (
                                            <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mt-1">
                                                {formData.category}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-800 mb-3">{formData.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                    {formData.content.substring(0, 200)}
                                    {formData.content.length > 200 && '...'}
                                </p>

                                {formData.tags && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {formData.tags.split(',').map((tag, index) => (
                                            <span key={index} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                                                #{tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span className="flex items-center space-x-1">
                                        <ThumbsUp size={16} /> <span>0</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                        <ThumbsDown size={16} /> <span>0</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                        <MessageCircle size={16} /> <span>0</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                        <Eye size={16} /> <span>0</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
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
                            className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg transition-colors duration-200"
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