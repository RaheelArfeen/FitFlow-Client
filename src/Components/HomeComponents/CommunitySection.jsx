import React, { useContext } from 'react';
import { Link } from 'react-router';
import { MessageSquare, ThumbsUp, ThumbsDown, Award, Shield, } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthContext } from '../../Provider/AuthProvider';
import { formatDistanceToNowStrict } from 'date-fns';
import { toast } from 'sonner';
import useAxiosSecure from '../../Provider/UseAxiosSecure';
import { useQuery } from '@tanstack/react-query';

const Community = () => {
    const { user } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['communityPosts-latest'],
        queryFn: async () => {
            const res = await axiosSecure.get('/community');
            return res.data?.slice(0, 6);
        },
        staleTime: 1000 * 60 * 5,
        onError: (err) => {
            console.error('Failed to fetch posts:', err);
            toast.error('Failed to fetch posts.');
        },
    });

    const posts = data || [];

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

        const post = posts.find(p => p._id === postId);
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
                    ? `You ${newVoteType === "like" ? "liked" : "disliked"} this post.`
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
        show: {
            opacity: 1, y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        },
    };

    const buttonVariants = {
        rest: { scale: 1 },
        hover: { scale: 1.1 },
        tap: { scale: 0.9 },
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner text-blue-600 loading-lg" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-600 text-lg">Error loading posts: {error.message}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="md:container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl font-bold text-gray-800"
                    >
                        Community Forum
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg text-gray-600 mt-2"
                    >
                        See what people are talking about in our fitness community.
                    </motion.p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {posts.map((post) => {
                        const userVote = getUserVote(post);

                        return (
                            <motion.article
                                key={post._id}
                                variants={itemVariants}
                                className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col justify-between shadow hover:shadow-md transition"
                            >
                                <div className="flex items-center mb-4 space-x-4 min-w-0">
                                    <motion.img
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.2, duration: 0.4 }}
                                        src={post.authorPhoto || '/default-avatar.png'}
                                        alt={post.author}
                                        className="w-10 h-10 rounded-full object-cover"
                                        loading="lazy"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                            <h4 className="font-semibold text-sm text-gray-800 truncate">{post.author}</h4>
                                            {post.authorRole !== 'member' && post.authorRole && (
                                                <div className="flex items-center space-x-1 bg-gray-100 px-2 py-0.5 rounded-full text-xs text-gray-700">
                                                    {getBadgeIcon(post.authorRole)}
                                                    <span>{getBadgeText(post.authorRole)}</span>
                                                </div>
                                            )}
                                            <span className="text-xs text-gray-500 whitespace-nowrap">
                                                {post.createdAt
                                                    ? formatDistanceToNowStrict(new Date(post.createdAt), { addSuffix: true })
                                                    : 'just now'}
                                            </span>
                                        </div>
                                        <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mt-1">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-2 hover:text-blue-700 transition">
                                    <Link to={`/community/post/${post._id}`} title={post.title}>
                                        {post.title}
                                    </Link>
                                </h3>

                                <p className="text-gray-600 text-sm mb-6 leading-relaxed line-clamp-5">
                                    {post.content.length > 300 ? `${post.content.slice(0, 300)}...` : post.content}
                                </p>

                                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200 gap-3">
                                    <div className="flex items-center space-x-4">
                                        <motion.button
                                            onClick={() => handleVote(post._id, userVote === 'like' ? null : 'like')}
                                            variants={buttonVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                            className={`flex items-center space-x-1 transition-colors focus:outline-none cursor-pointer
                                                ${userVote === 'like'
                                                    ? 'text-green-600'
                                                    : 'hover:text-green-600'
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
                                            className={`flex items-center space-x-1 transition-colors focus:outline-none cursor-pointer
                                                ${userVote === 'dislike'
                                                    ? 'text-red-600'
                                                    : 'hover:text-red-600'
                                                }`}
                                        >
                                            <ThumbsDown className="h-4 w-4" />
                                            <span>{post.dislikes || 0}</span>
                                        </motion.button>
                                        <div className="flex items-center space-x-1 hover:text-blue-500 transition-colors select-none cursor-pointer">
                                            <MessageSquare className="h-4 w-4" />
                                            <span>{Array.isArray(post.comments) ? post.comments.length : 0}</span>
                                        </div>
                                    </div>
                                    <Link
                                        to={`/community/${post._id}`}
                                        className="text-blue-700 hover:text-blue-800 font-medium transition whitespace-nowrap"
                                    >
                                        Read More
                                    </Link>
                                </div>
                            </motion.article>
                        );
                    })}
                </motion.div>
            </div>
        </div>
    );
};

export default Community;
