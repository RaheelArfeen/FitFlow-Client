import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
    MessageSquare,
    ThumbsUp,
    ThumbsDown,
    Award,
    Shield,
} from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../Provider/AuthProvider';
import { formatDistanceToNowStrict } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Loader from '../Loader';

const postsPerPage = 6;

const Community = () => {
    const { user } = useContext(AuthContext);
    const [currentPage, setCurrentPage] = useState(1);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updateTimer, setUpdateTimer] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:3000/community');
            setPosts(res.data);
        } catch (err) {
            console.error('Failed to fetch posts:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setUpdateTimer((prev) => prev + 1);
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const getUserVote = (post) => {
        if (!user || !post.votes) return null;
        const vote = post.votes.find((v) => v.email === user.email);
        return vote ? vote.type : null;
    };

    const handleVote = async (postId, voteType) => {
        if (!user) {
            toast('Please login to vote');
            return;
        }

        const post = posts.find((p) => p._id === postId);
        const currentVote = getUserVote(post);
        const newVoteType = currentVote === voteType ? null : voteType;

        try {
            await axios.post(
                'http://localhost:3000/community/vote',
                { postId, voteType: newVoteType },
                { withCredentials: true }
            );
            await fetchPosts();
        } catch (error) {
            console.error('Failed to vote:', error.response?.data?.message || error.message);
        }
    };

    const getBadgeIcon = (role) => {
        switch (role) {
            case 'admin':
                return <Shield className="h-4 w-4 text-red-600" />;
            case 'trainer':
                return <Award className="h-4 w-4 text-blue-600" />;
            default:
                return null;
        }
    };

    const getBadgeText = (role) => {
        switch (role) {
            case 'admin':
                return 'Admin';
            case 'trainer':
                return 'Trainer';
            default:
                return '';
        }
    };

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(posts.length / postsPerPage);

    if (loading) return <Loader message="Loading Community Posts..." />;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <motion.div
                className="md:container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl"
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="text-center mb-12 px-2 sm:px-0">
                    <motion.h1
                        className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-4"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        Community Forum
                    </motion.h1>
                    <motion.p
                        className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        Connect with fellow fitness enthusiasts, share experiences, and get motivated together.
                    </motion.p>
                </div>

                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: {
                            transition: {
                                staggerChildren: 0.15
                            }
                        }
                    }}
                >
                    {currentPosts.map((post, idx) => {
                        const userVote = getUserVote(post);
                        return (
                            <motion.article
                                key={post._id}
                                className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: idx * 0.1 }}
                            >
                                <div className="flex items-center mb-4 space-x-4 min-w-0">
                                    <img
                                        src={post.authorPhoto || '/default-avatar.png'}
                                        alt={post.author}
                                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                        loading="lazy"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                            <h4 className="font-semibold text-gray-800 text-sm truncate">
                                                {post.author}
                                            </h4>
                                            {post.authorRole !== 'member' && (
                                                <div className="flex items-center space-x-1 bg-gray-100 px-2 py-0.5 rounded-full text-xs font-medium text-gray-700">
                                                    {getBadgeIcon(post.authorRole)}
                                                    <span>{getBadgeText(post.authorRole)}</span>
                                                </div>
                                            )}
                                            <span className="text-sm text-gray-500 whitespace-nowrap">
                                                {formatDistanceToNowStrict(new Date(post.createdAt), {
                                                    addSuffix: true,
                                                })}
                                            </span>
                                        </div>
                                        <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mt-1">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-2 hover:text-blue-700 cursor-pointer transition-colors duration-200">
                                    <Link to={`/community/post/${post._id}`}>
                                        {post.title}
                                    </Link>
                                </h3>

                                <p className="text-gray-600 text-sm mb-6 leading-relaxed line-clamp-5">
                                    {post.content.length > 300 ? `${post.content.slice(0, 300)}...` : post.content}
                                </p>

                                <div className="flex flex-wrap items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100 gap-3">
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => handleVote(post._id, userVote === 'like' ? null : 'like')}
                                            className={`flex items-center space-x-1 focus:outline-none transition-colors
                                                ${userVote === 'like' ? 'text-green-600' : 'hover:text-green-600'}`}
                                        >
                                            <ThumbsUp className="h-4 w-4" />
                                            <span>{post.likes || 0}</span>
                                        </button>
                                        <button
                                            onClick={() => handleVote(post._id, userVote === 'dislike' ? null : 'dislike')}
                                            className={`flex items-center space-x-1 focus:outline-none transition-colors
                                                ${userVote === 'dislike' ? 'text-red-600' : 'hover:text-red-600'}`}
                                        >
                                            <ThumbsDown className="h-4 w-4" />
                                            <span>{post.dislikes || 0}</span>
                                        </button>
                                        <div className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                                            <MessageSquare className="h-4 w-4" />
                                            <span>
                                                {Array.isArray(post.comments) ? post.comments.length : post.comments || 0}
                                            </span>
                                        </div>
                                    </div>
                                    <Link
                                        to={`/community/${post._id}`}
                                        className="text-blue-700 hover:text-blue-800 font-medium"
                                    >
                                        Read More
                                    </Link>
                                </div>
                            </motion.article>
                        );
                    })}
                </motion.div>

                {totalPages > 1 && (
                    <motion.nav
                        aria-label="Pagination"
                        className="flex flex-wrap justify-center gap-2 mb-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-4 py-2 rounded-lg border border-gray-300 min-w-[44px] transition-colors duration-200
                                    ${currentPage === page
                                        ? 'bg-blue-700 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </motion.nav>
                )}
            </motion.div>
        </div>
    );
};

export default Community;
