import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
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

const CommunityDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [postLikes, setPostLikes] = useState(0);
    const [postDislikes, setPostDislikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [hasDisliked, setHasDisliked] = useState(false);

    const [updateTimer, setUpdateTimer] = useState(0);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchPost();
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
            setPostLikes(fetchedPost.likes || 0);
            setPostDislikes(fetchedPost.dislikes || 0);
            setComments(fetchedPost.comments || []);
        } catch (error) {
            console.error('Failed to fetch post:', error);
        }
    };

    const handleVote = (type) => {
        if (!user) return alert('Please login to vote');
        if (type === 'like') {
            if (hasLiked) {
                setPostLikes((p) => p - 1);
                setHasLiked(false);
            } else {
                setPostLikes((p) => p + 1);
                setHasLiked(true);
                if (hasDisliked) {
                    setPostDislikes((p) => p - 1);
                    setHasDisliked(false);
                }
            }
        } else {
            if (hasDisliked) {
                setPostDislikes((p) => p - 1);
                setHasDisliked(false);
            } else {
                setPostDislikes((p) => p + 1);
                setHasDisliked(true);
                if (hasLiked) {
                    setPostLikes((p) => p - 1);
                    setHasLiked(false);
                }
            }
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!user || !newComment.trim()) return;

        try {
            const res = await axios.post(
                `http://localhost:3000/community/${id}/comments`,
                { commentText: newComment },
                { withCredentials: true }
            );

            if (res.status === 201 || res.status === 200) {
                setComments((prev) => [...prev, res.data.comment]);
                setNewComment('');
            }
        } catch (error) {
            console.error('Failed to post comment:', error);
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
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    // Prevent post author from commenting
    // Adjust property names if you use different field names for author and user ID
    const isAuthor = user && post && (user.uid === post.authorId || user.displayName === post.author);

    // Loading Spinner while fetching post or user not ready
    if (!post || !user) {
        return <Loader />;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="md:container mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => navigate('/community')}
                    className="flex items-center space-x-2 text-blue-700 hover:text-blue-800 mb-6"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Back to Community</span>
                </button>

                {/* Post Card */}
                <article className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center mb-4">
                            <img
                                src={post.authorPhoto}
                                alt={post.author}
                                className="w-12 h-12 rounded-full object-cover mr-4"
                            />
                            <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                    <h4 className="font-semibold text-gray-800">{post.author}</h4>
                                    {post.authorRole !== 'member' && (
                                        <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
                                            {getBadgeIcon(post.authorRole)}
                                            <span className="text-xs font-medium text-gray-700">
                                                {getBadgeText(post.authorRole)}
                                            </span>
                                        </div>
                                    )}
                                    <span className="text-sm text-gray-500">•</span>
                                    <span className="text-sm text-gray-500">
                                        {post.createdAt
                                            ? formatDistanceToNowStrict(new Date(post.createdAt), { addSuffix: true })
                                            : 'just now'}
                                    </span>
                                </div>
                                <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm mt-1">
                                    {post.category}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handleShare}
                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                >
                                    <Share2 className="h-5 w-5" />
                                </button>
                                <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                    <Flag className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold text-gray-800 mb-4">{post.title}</h1>
                    </div>

                    <div className="p-6">
                        <div className="prose max-w-none text-gray-700 leading-relaxed">
                            {post.content.split('\n').map((paragraph, index) => {
                                if (paragraph.startsWith('## ')) {
                                    return (
                                        <h2 key={index} className="text-xl font-semibold text-gray-800 mt-6 mb-3">
                                            {paragraph.replace('## ', '')}
                                        </h2>
                                    );
                                }
                                if (paragraph.trim() === '') return <br key={index} />;
                                return (
                                    <p key={index} className="mb-4">
                                        {paragraph}
                                    </p>
                                );
                            })}
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex items-center space-x-6">
                            <button
                                onClick={() => handleVote('like')}
                                className={`flex items-center space-x-2 ${hasLiked ? 'text-green-600' : 'text-gray-500 hover:text-green-600'
                                    }`}
                            >
                                <ThumbsUp className="h-5 w-5" />
                                <span>{postLikes}</span>
                            </button>
                            <button
                                onClick={() => handleVote('dislike')}
                                className={`flex items-center space-x-2 ${hasDisliked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                                    }`}
                            >
                                <ThumbsDown className="h-5 w-5" />
                                <span>{postDislikes}</span>
                            </button>
                            <div className="flex items-center space-x-2 text-gray-500">
                                <MessageSquare className="h-5 w-5" />
                                <span>{comments.length}</span>
                            </div>
                        </div>
                    </div>
                </article>

                {/* Comments Section */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Comments</h2>

                    {user ? (
                        isAuthor ? (
                            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-300 rounded-lg text-center text-yellow-800">
                                You cannot comment on your own post.
                            </div>
                        ) : (
                            <form onSubmit={handleCommentSubmit} className="mb-8">
                                <div className="flex items-start space-x-4">
                                    <img
                                        src={user.photoURL}
                                        alt={user.displayName}
                                        className="w-10 h-10 rounded-full object-cover"
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
                                            <button
                                                type="submit"
                                                disabled={!newComment.trim()}
                                                className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
                                            >
                                                <Send className="h-4 w-4" />
                                                <span>Post Comment</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        )
                    ) : (
                        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                            <p className="text-blue-800 mb-3">Join the conversation!</p>
                            <div className="space-x-3">
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
                        </div>
                    )}

                    <div className="space-y-6">
                        {comments.map((comment) => (
                            <div key={comment._id || comment.id} className="border-b border-gray-200 pb-6">
                                <div className="flex items-start space-x-4">
                                    <img
                                        src={comment.authorPhoto || comment.avatar}
                                        alt={comment.author}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <h4 className="font-semibold text-gray-800">{comment.author}</h4>
                                            {comment.authorRole !== 'member' && (
                                                <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
                                                    {getBadgeIcon(comment.authorRole)}
                                                    <span className="text-xs font-medium text-gray-700">
                                                        {getBadgeText(comment.authorRole)}
                                                    </span>
                                                </div>
                                            )}
                                            <span className="text-sm text-gray-500">•</span>
                                            <span className="text-sm text-gray-500">
                                                {comment.createdAt
                                                    ? formatDistanceToNowStrict(new Date(comment.createdAt), { addSuffix: true })
                                                    : 'just now'}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 mb-3">{comment.text || comment.content}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityDetails;