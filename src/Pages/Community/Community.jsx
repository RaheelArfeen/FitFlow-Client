import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
    MessageSquare,
    ThumbsUp,
    ThumbsDown,
    Award,
    Shield,
    ChevronRight,
    ChevronLeft,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthContext } from '../../Provider/AuthProvider';
import { formatDistanceToNowStrict } from 'date-fns';
import { toast } from 'sonner';
import useAxiosSecure from '../../Provider/UseAxiosSecure';
import { useQuery } from '@tanstack/react-query';
import { Title } from 'react-head';
import Loader from '../../Pages/Loader';

const postsPerPage = 6;
const MAX_VISIBLE_PAGES = 5; // Define how many page numbers to show before ellipsis

const Community = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();

    const [currentPage, setCurrentPage] = useState(1);
    const [updateTimer, setUpdateTimer] = useState(0);

    useEffect(() => {
        window.scrollTo(0, 0);
    });

    // Use Tanstack Query to fetch paginated posts
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['communityPosts', currentPage],
        queryFn: async () => {
            const res = await axiosSecure.get(`/community/pagination?page=${currentPage}&limit=${postsPerPage}`);
            return res.data;
        },
        keepPreviousData: true,
        staleTime: 1000 * 60 * 5,
        onError: (err) => {
            console.error('Failed to fetch posts:', err);
            toast.error('Failed to fetch posts.');
        },
    });

    const posts = data?.posts || [];
    const totalPages = data?.totalPages || 1;

    useEffect(() => {
        const interval = setInterval(() => {
            setUpdateTimer((prev) => prev + 1);
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const getUserVote = (post) => {
        if (!user || !post.votes) return null;
        const vote = post.votes.find(v => v.email === user.email);
        return vote ? vote.type : null;
    };

    const handleVote = async (postId, voteType) => {
        if (!user) {
            toast.warning("Please login to vote.");
            return;
        }

        const post = posts.find((p) => p._id === postId);
        const currentVote = getUserVote(post);
        const newVoteType = currentVote === voteType ? null : voteType;

        try {
            await axiosSecure.post('/community/vote', {
                postId,
                voteType: newVoteType,
            });

            await refetch();
            toast.success(
                newVoteType
                    ? `You ${newVoteType === "like" ? "liked" : "disliked"} this post."`
                    : "Your vote was removed."
            );
        } catch (error) {
            console.error("Voting error:", error);
            toast.error("Failed to submit vote.");
        }
    };

    const getBadgeIcon = (role) => {
        switch (role) {
            case 'admin': return <Shield className="h-4 w-4 text-red-600" />;
            case 'trainer': return <Award className="h-4 w-4 text-blue-600" />;
            default: return null;
        }
    };

    const getBadgeText = (role) => {
        switch (role) {
            case 'admin': return 'Admin';
            case 'trainer': return 'Trainer';
            default: return '';
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    };

    const buttonVariants = {
        rest: { scale: 1 },
        hover: { scale: 1.1 },
        tap: { scale: 0.9 },
    };

    // Logic for visible page numbers with ellipsis
    const getVisiblePageNumbers = () => {
        const pages = [];
        if (totalPages <= MAX_VISIBLE_PAGES) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            const startPage = Math.max(1, currentPage - Math.floor(MAX_VISIBLE_PAGES / 2));
            const endPage = Math.min(totalPages, startPage + MAX_VISIBLE_PAGES - 1);

            if (startPage > 1) {
                pages.push(1);
                if (startPage > 2) {
                    pages.push('...');
                }
            }

            for (let i = startPage; i => endPage; i++) {
                pages.push(i);
            }

            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    pages.push('...');
                }
                pages.push(totalPages);
            }
        }
        return pages;
    };


    if (isLoading) {
        return (
            <Loader/>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-red-600 text-lg">Error loading posts: {error.message}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <Title>Community | FitFlow</Title>
            <div className="md:container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="text-center mb-12 px-2 sm:px-0">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-4"
                    >
                        Community Forum
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                        className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto"
                    >
                        Connect with fellow fitness enthusiasts, share experiences, and get
                        motivated together.
                    </motion.p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
                >
                    {posts.map((post) => {
                        const userVote = getUserVote(post);

                        return (
                            <motion.article
                                key={post._id}
                                variants={itemVariants}
                                whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                                transition={{ duration: 0.2 }}
                                className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300"
                            >
                                <div className="flex items-center mb-4 space-x-4 min-w-0">
                                    <motion.img
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.2, duration: 0.4 }}
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
                                            {post.authorRole !== 'member' && post.authorRole && (
                                                <div className="flex items-center space-x-1 bg-gray-100 px-2 py-0.5 rounded-full text-xs font-medium text-gray-700 select-none">
                                                    {getBadgeIcon(post.authorRole)}
                                                    <span>{getBadgeText(post.authorRole)}</span>
                                                </div>
                                            )}
                                            <span className="text-sm text-gray-500 whitespace-nowrap">
                                                {post.createdAt
                                                    ? formatDistanceToNowStrict(new Date(post.createdAt), { addSuffix: true })
                                                    : 'just now'}
                                            </span>
                                        </div>
                                        <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mt-1 select-none">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-2 hover:text-blue-700 cursor-pointer transition-colors duration-200">
                                    <Link to={`/community/post/${post._id}`} title={post.title}>
                                        {post.title}
                                    </Link>
                                </h3>

                                <p className="text-gray-600 text-sm mb-6 leading-relaxed line-clamp-5">
                                    {post.content.length > 300 ? `${post.content.slice(0, 300)}...` : post.content}
                                </p>

                                <div className="flex flex-wrap items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100 gap-3">
                                    <div className="flex items-center space-x-4">
                                        <motion.button
                                            onClick={() => handleVote(post._id, userVote === 'like' ? null : 'like')}
                                            variants={buttonVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                            className={`flex items-center space-x-1 transition-colors duration-200 focus:outline-none focus-visible:ring-2 rounded cursor-pointer
                                                ${userVote === 'like'
                                                    ? 'text-green-600 ring-green-400'
                                                    : 'hover:text-green-600 focus-visible:ring-green-400'
                                                }`}
                                        >
                                            <ThumbsUp className="h-4 w-4" />
                                            <span>{post.likes || 0}</span>
                                        </motion.button>
                                        <motion.button
                                            onClick={() => handleVote(post._id, userVote === 'dislike' ? null : 'dislike')}
                                            variants={buttonVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                            className={`flex items-center space-x-1 transition-colors duration-200 focus:outline-none focus-visible:ring-2 rounded cursor-pointer
                                                ${userVote === 'dislike'
                                                    ? 'text-red-600 ring-red-400'
                                                    : 'hover:text-red-600 focus-visible:ring-red-400'
                                                }`}
                                        >
                                            <ThumbsDown className="h-4 w-4" />
                                            <span>{post.dislikes || 0}</span>
                                        </motion.button>
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="flex items-center space-x-1 hover:text-blue-500 transition-colors duration-200 select-none cursor-pointer"
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                            <span>{Array.isArray(post.comments) ? post.comments.length : post.comments || 0}</span>
                                        </motion.div>
                                    </div>
                                    <Link to={`/community/${post._id}`} className="text-blue-700 hover:text-blue-800 font-medium transition-colors duration-200 whitespace-nowrap">
                                        Read More
                                    </Link>
                                </div>
                            </motion.article>
                        );
                    })}
                </motion.div>

                {totalPages > 1 && (
                    <nav className="flex flex-wrap justify-between gap-2 mb-8 items-center" aria-label="Pagination">
                        {/* Previous Button */}
                        <motion.button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={currentPage === 1}
                            className={`px-2 py-2 rounded-lg border transition-colors duration-200 text-center font-medium ${currentPage === 1
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                }`}
                        >
                            <ChevronLeft />
                        </motion.button>

                        {/* Page Numbers with Ellipsis Logic */}
                        <div className='flex items-center gap-2'>
                            {getVisiblePageNumbers().map((page, index) => (
                                page === '...' ? (
                                    <span key={`ellipsis-${index}`} className="px-4 py-2 text-gray-700">
                                        ...
                                    </span>
                                ) : (
                                    <motion.button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`px-4 py-2 rounded-lg border transition-colors duration-200 min-w-[44px] text-center
                                            ${currentPage === page
                                                ? 'bg-blue-600 text-white border-blue-600' // Active page styles
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100' // Inactive page styles
                                            }`}
                                    >
                                        {page}
                                    </motion.button>
                                )
                            ))}
                        </div>

                        {/* Next Button */}
                        <motion.button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={currentPage === totalPages}
                            className={`px-2 py-2 rounded-lg border transition-colors duration-200 text-center font-medium ${currentPage === totalPages
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                }`}
                        >
                            <ChevronRight />
                        </motion.button>
                    </nav>
                )}
            </div>
        </div>
    );
};

export default Community;