import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    ThumbsUp,
    ThumbsDown,
    MessageSquare,
    Share2,
    Flag,
    Award,
    Shield,
    Send,
} from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../Provider/AuthProvider';
import { formatDistanceToNowStrict } from 'date-fns';
import Loader from '../Loader';
import { toast } from 'sonner';

const CommunityDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [userVote, setUserVote] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 300);
        fetchPost();
        return () => clearTimeout(timer);
    }, [id]);

    useEffect(() => {
        const interval = setInterval(() => {
            setUpdateTimer((prev) => prev + 1);
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchPost = async () => {
        try {
            const res = await axios.get(`http://localhost:3000/community/${id}`);
            const fetchedPost = res.data;
            setPost(fetchedPost);
            setComments(fetchedPost.comments || []);

            if (user && Array.isArray(fetchedPost.votes)) {
                const vote = fetchedPost.votes.find((v) => v.email === user.email);
                setUserVote(vote?.type || null);
            } else {
                setUserVote(null);
            }
        } catch (error) {
            console.error('Failed to fetch post:', error);
            toast.error('Failed to load post details.'); // Added toast for user feedback
        }
    };

    const handleVote = async (type) => {
        if (!user) {
            toast.error('Please login to vote.');
            return;
        }

        const newVoteType = userVote === type ? null : type;

        try {
            // Optimistic UI update
            const originalUserVote = userVote;
            const originalPost = { ...post };

            // Update local state immediately
            setUserVote(newVoteType);
            setPost(prevPost => {
                if (!prevPost) return prevPost;
                const newLikes = newVoteType === 'like' ? (originalUserVote === 'like' ? prevPost.likes - 1 : prevPost.likes + (originalUserVote === 'dislike' ? 1 : 0)) : prevPost.likes;
                const newDislikes = newVoteType === 'dislike' ? (originalUserVote === 'dislike' ? prevPost.dislikes - 1 : prevPost.dislikes + (originalUserVote === 'like' ? 1 : 0)) : prevPost.dislikes;

                return {
                    ...prevPost,
                    likes: newLikes < 0 ? 0 : newLikes,
                    dislikes: newDislikes < 0 ? 0 : newDislikes
                };
            });


            await axios.post(
                'http://localhost:3000/community/vote',
                { postId: id, voteType: newVoteType },
                { withCredentials: true }
            );
            // Re-fetch to ensure data consistency after server update
            fetchPost();
            toast.success('Vote updated successfully!');
        } catch (error) {
            console.error('Vote failed:', error.response?.data?.message || error.message);
            toast.error('Failed to cast vote.');
            // Revert optimistic update on error
            setUserVote(originalUserVote);
            setPost(originalPost);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!user || !newComment.trim()) {
            toast.error('Please write a comment before submitting.');
            return;
        }

        try {
            const res = await axios.post(
                `http://localhost:3000/community/${id}/comments`,
                { commentText: newComment },
                { withCredentials: true }
            );

            if (res.status === 201 || res.status === 200) {
                // Add the new comment from the response to the state
                setComments((prev) => [res.data.comment, ...prev]); // Prepend new comment for better visibility
                setNewComment('');
                toast.success('Comment posted successfully!');
            }
        } catch (error) {
            console.error('Failed to post comment:', error);
            toast.error('Failed to post comment.');
        }
    };

    const getBadgeIcon = (role) => {
        if (role === 'admin') return <Shield className="h-4 w-4 text-red-600" />;
        if (role === 'trainer') return <Award className="h-4 w-4 text-blue-600" />;
        return null;
    };

    const getBadgeText = (role) => {
        if (role === 'admin') return 'Admin';
        if (role === 'trainer') return 'Trainer';
        return '';
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: post.title,
                text: post.content.substring(0, 100) + '...',
                url: window.location.href,
            })
                .then(() => toast.success('Post shared!'))
                .catch((error) => console.error('Share failed', error));
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.info('Link copied to clipboard!');
        }
    };

    const isAuthor =
        user && post && (user.uid === post.authorId || user.displayName === post.author);

    if (!post) return <Loader />;

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                when: "beforeChildren",
                staggerChildren: 0.1,
                duration: 0.5
            }
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.4,
                ease: "easeOut"
            }
        },
    };

    const commentItemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        },
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <motion.div
                className="md:container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.button
                    onClick={() => navigate('/community')}
                    className="flex items-center space-x-2 text-blue-700 hover:text-blue-800 mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                    whileHover={{ x: -5 }} // Subtle slide left on hover
                    whileTap={{ scale: 0.95 }} // Slight shrink on click
                    variants={itemVariants}
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="text-base sm:text-lg font-medium">Back to Community</span>
                </motion.button>

                <motion.article
                    className="bg-white rounded-xl shadow-lg overflow-hidden mb-8"
                    variants={itemVariants}
                >
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center mb-4 space-y-3 sm:space-y-0 sm:space-x-4">
                            <motion.img
                                src={post.authorPhoto}
                                alt={post.author}
                                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-800">
                                    <h4 className="font-semibold text-lg truncate">{post.author}</h4>
                                    {post.authorRole !== 'member' && (
                                        <motion.div
                                            className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full text-xs font-medium text-gray-700 select-none"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            {getBadgeIcon(post.authorRole)}
                                            <span>{getBadgeText(post.authorRole)}</span>
                                        </motion.div>
                                    )}
                                    <span className="text-sm text-gray-500">•</span>
                                    <span className="text-sm text-gray-500 whitespace-nowrap">
                                        {post.createdAt
                                            ? formatDistanceToNowStrict(new Date(post.createdAt), { addSuffix: true })
                                            : 'just now'}
                                    </span>
                                </div>
                                <motion.span
                                    className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm mt-1 select-none"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {post.category}
                                </motion.span>
                            </div>

                            <div className="flex items-center space-x-2 mt-3 sm:mt-0">
                                <motion.button
                                    onClick={handleShare}
                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Share2 className="h-5 w-5" />
                                </motion.button>
                                <motion.button
                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Flag className="h-5 w-5" />
                                </motion.button>
                            </div>
                        </div>

                        <motion.h1
                            className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 break-words"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            {post.title}
                        </motion.h1>
                    </div>

                    <div className="p-6">
                        <div className="prose max-w-none text-gray-700 leading-relaxed">
                            {post.content.split('\n').map((paragraph, index) => {
                                if (paragraph.startsWith('## ')) {
                                    return (
                                        <motion.h2
                                            key={index}
                                            className="text-xl font-semibold mt-6 mb-3"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * index }}
                                        >
                                            {paragraph.replace('## ', '')}
                                        </motion.h2>
                                    );
                                }
                                if (paragraph.trim() === '') return <br key={index} />;
                                return (
                                    <motion.p
                                        key={index}
                                        className="mb-4"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 * index }}
                                    >
                                        {paragraph}
                                    </motion.p>
                                );
                            })}
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex flex-wrap items-center space-x-6">
                            <motion.button
                                onClick={() => handleVote('like')}
                                className={`flex items-center space-x-2 ${userVote === 'like' ? 'text-green-600 ring-green-400' : 'text-gray-500 hover:text-green-600'
                                    } focus:outline-none focus-visible:ring-2 rounded`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <ThumbsUp className="h-5 w-5" />
                                <span>{post.likes || 0}</span>
                            </motion.button>

                            <motion.button
                                onClick={() => handleVote('dislike')}
                                className={`flex items-center space-x-2 ${userVote === 'dislike' ? 'text-red-600 ring-red-400' : 'text-gray-500 hover:text-red-600'
                                    } focus:outline-none focus-visible:ring-2 rounded`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <ThumbsDown className="h-5 w-5" />
                                <span>{post.dislikes || 0}</span>
                            </motion.button>

                            <div className="flex items-center space-x-2 text-gray-500 select-none">
                                <MessageSquare className="h-5 w-5" />
                                <span>{comments.length}</span>
                            </div>
                        </div>
                    </div>
                </motion.article>

                {/* Comments Section */}
                <motion.section
                    className="bg-white rounded-xl shadow-lg p-6"
                    variants={itemVariants}
                >
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Comments</h2>

                    {user ? (
                        isAuthor ? (
                            <motion.div
                                className="mb-8 p-4 bg-yellow-50 border border-yellow-300 rounded-lg text-center text-yellow-800"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                You cannot comment on your own post.
                            </motion.div>
                        ) : (
                            <motion.form
                                onSubmit={handleCommentSubmit}
                                className="mb-8"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                                    <img
                                        src={user.photoURL}
                                        alt={user.displayName}
                                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Share your thoughts..."
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                                        />
                                        <div className="flex justify-end mt-3">
                                            <motion.button
                                                type="submit"
                                                disabled={!newComment.trim()}
                                                className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Send className="h-4 w-4" />
                                                <span>Post Comment</span>
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </motion.form>
                        )
                    ) : (
                        <motion.div
                            className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <p className="text-blue-800 mb-3">Join the conversation!</p>
                            <div className="space-x-3 flex justify-center">
                                <motion.customLink
                                    to="/login"
                                    className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Login
                                </motion.customLink>
                                <motion.customLink
                                    to="/register"
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Sign Up
                                </motion.customLink>
                            </div>
                        </motion.div>
                    )}

                    <motion.div
                        className="space-y-6"
                        variants={containerVariants} // Use container variants for comments list
                    >
                        {comments.map((comment) => (
                            <motion.div
                                key={comment._id || comment.id}
                                className="border-b border-gray-200 pb-6"
                                variants={commentItemVariants} // Apply comment specific variants
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                                    <motion.img
                                        src={comment.authorPhoto || comment.avatar}
                                        alt={comment.author}
                                        className="w-10 h-10 rounded-full object-cover"
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2 text-gray-800">
                                            <h4 className="font-semibold truncate">{comment.author}</h4>
                                            {comment.authorRole !== 'member' && (
                                                <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                                                    {getBadgeIcon(comment.authorRole)}
                                                    <span>{getBadgeText(comment.authorRole)}</span>
                                                </div>
                                            )}
                                            <span className="text-sm text-gray-500">•</span>
                                            <span className="text-sm text-gray-500 whitespace-nowrap">
                                                {comment.createdAt
                                                    ? formatDistanceToNowStrict(new Date(comment.createdAt), { addSuffix: true })
                                                    : 'just now'}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 whitespace-pre-line">
                                            {comment.text || comment.content}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.section>
            </motion.div>
        </div>
    );
};

export default CommunityDetails;