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
    MoreVertical,
    Trash2,
} from 'lucide-react';
import { AuthContext } from '../../Provider/AuthProvider';
import { differenceInSeconds, formatDistanceToNowStrict } from 'date-fns';
import Loader from '../Loader';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import useAxiosSecure from '../../Provider/UseAxiosSecure';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Import TanStack Query hooks

const CommunityDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient(); // Get the query client instance

    const [newComment, setNewComment] = useState('');
    const [openCommentMenuId, setOpenCommentMenuId] = useState(null);

    // Initial scroll to top on component mount
    useEffect(() => {
        const timer = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    // Effect to update comment timestamps every minute (still needed for UI re-render)
    useEffect(() => {
        const interval = setInterval(() => {
            // This will trigger a re-render of comments without refetching data from server
            // as formatDistanceToNowStrict relies on current time.
            queryClient.invalidateQueries(['postDetails', id]);
            // You could also do setComments(prev => [...prev]) if comments state was standalone
        }, 60000);
        return () => clearInterval(interval);
    }, [queryClient, id]);

    // --- TanStack Query for fetching post details ---
    const { data: post, isLoading, isError, error } = useQuery({
        queryKey: ['postDetails', id], // Key includes ID to make it unique per post
        queryFn: async () => {
            const res = await axiosSecure.get(`/community/${id}`);
            const fetchedPost = res.data;

            // Sort comments by creation date (newest first)
            fetchedPost.comments = (fetchedPost.comments || []).sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            return fetchedPost;
        },
        enabled: !!id, // Only run the query if 'id' is available
        staleTime: 1000 * 60, // Consider data fresh for 1 minute
        onError: (err) => {
            console.error('Failed to fetch post details:', err);
            toast.error('Failed to load post details.');
        },
    });

    // Determine current user's vote status for the post
    // This derived state will re-calculate whenever `post` or `user` changes
    const userVote = post?.votes?.find((v) => v.email === user?.email)?.type || null;

    // --- TanStack Query for handling votes ---
    const voteMutation = useMutation({
        mutationFn: async ({ postId, voteType }) => {
            await axiosSecure.post('/community/vote', { postId, voteType });
        },
        onSuccess: (data, variables) => {
            // Invalidate and refetch the post details query to show updated vote counts
            queryClient.invalidateQueries(['postDetails', id]);
            toast.success(
                variables.voteType
                    ? `You ${variables.voteType === "like" ? "liked" : "disliked"} this post.`
                    : "Your vote was removed."
            );
        },
        onError: (err) => {
            console.error("Vote failed:", err);
            toast.error("Failed to submit vote.");
        },
    });

    const handleVote = (voteType) => {
        if (!user) {
            toast.warning("Please login to vote.");
            return;
        }
        const newVoteType = userVote === voteType ? null : voteType;
        voteMutation.mutate({ postId: post._id, voteType: newVoteType });
    };

    // --- TanStack Query for handling comments ---
    const addCommentMutation = useMutation({
        mutationFn: async (commentData) => {
            const res = await axiosSecure.post(`/community/${post._id}/comments`, commentData);
            return res.data.comment; // Return the newly created comment
        },
        onSuccess: (newCommentData) => {
            // Optimistically update the cache to show the new comment instantly
            queryClient.setQueryData(['postDetails', id], (oldData) => {
                if (!oldData) return oldData;
                const updatedComments = [newCommentData, ...(oldData.comments || [])];
                return { ...oldData, comments: updatedComments };
            });
            setNewComment(""); // Clear the input field
            toast.success("Comment posted!");
        },
        onError: (err) => {
            console.error("Failed to post comment:", err);
            toast.error("Failed to post comment. Please try again.");
        },
    });

    const handleCommentSubmit = (e) => {
        e.preventDefault();

        if (!user) {
            toast.warning("Please login to comment.");
            return;
        }

        if (!newComment.trim()) {
            toast.error("Comment cannot be empty.");
            return;
        }

        addCommentMutation.mutate({ commentText: newComment.trim() });
    };

    // --- TanStack Query for deleting comments ---
    const deleteCommentMutation = useMutation({
        mutationFn: async (commentId) => {
            await axiosSecure.delete(`/community/${post._id}/comments/${commentId}`);
        },
        onSuccess: (data, commentId) => {
            // Optimistically update the cache by removing the deleted comment
            queryClient.setQueryData(['postDetails', id], (oldData) => {
                if (!oldData) return oldData;
                const updatedComments = (oldData.comments || []).filter(
                    (comment) => comment._id !== commentId
                );
                return { ...oldData, comments: updatedComments };
            });
            setOpenCommentMenuId(null);
            Swal.fire({
                title: "Deleted!",
                text: "Your comment has been deleted.",
                icon: "success",
                showConfirmButton: true,
            });
        },
        onError: (err) => {
            console.error("Failed to delete comment:", err);
            Swal.fire({
                icon: 'error',
                title: 'Failed!',
                text: 'Failed to delete comment. Please try again.',
            });
        },
    });

    const handleDeleteComment = async (commentId) => {
        if (!user) {
            Swal.fire({
                icon: 'warning',
                title: 'Not Logged In',
                text: 'You must be logged in to delete a comment.',
            });
            return;
        }

        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        });

        if (result.isConfirmed) {
            deleteCommentMutation.mutate(commentId);
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
        if (!post) return; // Ensure post data is available

        const shareData = {
            title: post.title,
            text: post.content.substring(0, Math.min(post.content.length, 100)) + '...', // Use Math.min for safety
            url: window.location.href,
        };

        if (navigator.share) {
            navigator.share(shareData)
                .then(() => toast.success('Post shared!'))
                .catch((error) => console.error('Share failed', error));
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.info('Link copied to clipboard!');
        }
    };

    // Derived state for `isAuthor`
    const isAuthor = user && post && (user.uid === post.authorId || user.email === post.email);

    if (isLoading) return <Loader />;
    if (isError) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-red-600 text-lg">Error loading post: {error.message}</p>
        </div>
    );
    if (!post) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-gray-600 text-lg">No post found.</p>
        </div>
    );

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
                    whileHover={{ x: -5 }}
                    whileTap={{ scale: 0.95 }}
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
                                disabled={voteMutation.isPending} // Disable button while mutation is running
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
                                disabled={voteMutation.isPending} // Disable button while mutation is running
                            >
                                <ThumbsDown className="h-5 w-5" />
                                <span>{post.dislikes || 0}</span>
                            </motion.button>

                            <div className="flex items-center space-x-2 text-gray-500 select-none">
                                <MessageSquare className="h-5 w-5" />
                                <span>{(post.comments || []).length}</span>
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
                        user.email === post.email ? (
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
                                    {user.photoURL ? (
                                        <img
                                            src={user.photoURL}
                                            alt={user.displayName}
                                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                                            {user.displayName?.charAt(0).toUpperCase() || "U"}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Share your thoughts..."
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none resize-none"
                                            disabled={addCommentMutation.isPending} // Disable while commenting
                                        />
                                        <div className="flex justify-end mt-3">
                                            <motion.button
                                                type="submit"
                                                disabled={!newComment.trim() || addCommentMutation.isPending}
                                                className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {addCommentMutation.isPending ? (
                                                    <span className="loading loading-spinner loading-sm"></span>
                                                ) : (
                                                    <Send className="h-4 w-4" />
                                                )}
                                                <span>{addCommentMutation.isPending ? 'Posting...' : 'Post Comment'}</span>
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
                                <Link
                                    to="/login"
                                    className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        </motion.div>
                    )}

                    <motion.div
                        className="space-y-6"
                        variants={containerVariants}
                    >
                        {(post.comments || []).map((comment) => (
                            <motion.div
                                key={comment._id}
                                className="border-b border-gray-200 pb-6 px-6 relative"
                                variants={commentItemVariants}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                                    {comment.authorPhoto || comment.avatar ? (
                                        <motion.img
                                            src={comment.authorPhoto || comment.avatar}
                                            alt={comment.author}
                                            className="w-10 h-10 rounded-full object-cover"
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    ) : (
                                        <motion.div
                                            className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg"
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {comment.author?.charAt(0).toUpperCase() || "U"}
                                        </motion.div>
                                    )}
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
                                                {comment.createdAt && differenceInSeconds(new Date(), new Date(comment.createdAt)) < 60
                                                    ? "just now"
                                                    : formatDistanceToNowStrict(new Date(comment.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 whitespace-pre-line">
                                            {comment.text || comment.content}
                                        </p>
                                    </div>

                                    {/* Three-dot menu for comments */}
                                    {user && user.email === comment.email && (
                                        <div className="relative z-10">
                                            <motion.button
                                                onClick={() => setOpenCommentMenuId(openCommentMenuId === comment._id ? null : comment._id)}
                                                className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <MoreVertical className="h-5 w-5 text-gray-500" />
                                            </motion.button>

                                            {openCommentMenuId === comment._id && (
                                                <motion.div
                                                    className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg overflow-hidden"
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <button
                                                        onClick={() => handleDeleteComment(comment._id)}
                                                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        disabled={deleteCommentMutation.isPending} // Disable while deleting
                                                    >
                                                        {deleteCommentMutation.isPending ? (
                                                            <span className="loading loading-spinner loading-xs mr-2"></span>
                                                        ) : (
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                        )}
                                                        {deleteCommentMutation.isPending ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </motion.div>
                                            )}
                                        </div>
                                    )}
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