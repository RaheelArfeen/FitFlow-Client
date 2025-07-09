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

const postsPerPage = 6;

const CommunityPage = () => {
    const { user } = useContext(AuthContext);
    const [currentPage, setCurrentPage] = useState(1);
    const [posts, setPosts] = useState([]);
    const [updateTimer, setUpdateTimer] = useState(0);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Fetch posts on mount
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await axios.get('http://localhost:3000/community');
                setPosts(res.data);
            } catch (err) {
                console.error('Failed to fetch posts:', err);
            }
        };
        fetchPosts();
    }, []);

    // Timer to update timestamps every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setUpdateTimer((prev) => prev + 1);
        }, 60000); // every 60 seconds

        return () => clearInterval(interval);
    }, []);

    const handleVote = async (postId, voteType) => {
        if (!user) {
            alert('Please login to vote');
            return;
        }

        setPosts((prevPosts) =>
            prevPosts.map((post) =>
                post._id === postId
                    ? {
                        ...post,
                        likes: voteType === 'like' ? (post.likes || 0) + 1 : post.likes,
                        dislikes:
                            voteType === 'dislike' ? (post.dislikes || 0) + 1 : post.dislikes,
                    }
                    : post
            )
        );

        // Optionally send vote to backend
        // await axios.post(`http://localhost:3000/community/vote`, { postId, voteType }, { withCredentials: true });
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

    // Pagination
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(posts.length / postsPerPage);

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="md:container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-12 px-2 sm:px-0">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-4">
                        Community Forum
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                        Connect with fellow fitness enthusiasts, share experiences, and get
                        motivated together.
                    </p>
                </div>

                {/* Posts Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {currentPosts.map((post) => (
                        <article
                            key={post._id}
                            className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300"
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
                                        {post.authorRole !== 'member' && post.authorRole && (
                                            <div className="flex items-center space-x-1 bg-gray-100 px-2 py-0.5 rounded-full text-xs font-medium text-gray-700 select-none">
                                                {getBadgeIcon(post.authorRole)}
                                                <span>{getBadgeText(post.authorRole)}</span>
                                            </div>
                                        )}
                                        <span className="text-sm text-gray-500 whitespace-nowrap">
                                            {post.createdAt
                                                ? formatDistanceToNowStrict(new Date(post.createdAt), {
                                                    addSuffix: true,
                                                })
                                                : 'just now'}
                                        </span>
                                    </div>
                                    <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mt-1 select-none">
                                        {post.category}
                                    </span>
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-2 hover:text-blue-700 cursor-pointer transition-colors duration-200">
                                <Link
                                    to={`/community/post/${post._id}`}
                                    className="break-words"
                                    title={post.title}
                                >
                                    {post.title}
                                </Link>
                            </h3>

                            <p className="text-gray-600 text-sm mb-6 leading-relaxed line-clamp-5">
                                {post.content.length > 300
                                    ? `${post.content.slice(0, 300)}...`
                                    : post.content}
                            </p>

                            <div className="flex flex-wrap items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100 gap-3">
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => handleVote(post._id, 'like')}
                                        className="flex items-center space-x-1 hover:text-green-600 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 rounded"
                                        aria-label="Like post"
                                        type="button"
                                    >
                                        <ThumbsUp className="h-4 w-4" />
                                        <span>{post.likes || 0}</span>
                                    </button>
                                    <button
                                        onClick={() => handleVote(post._id, 'dislike')}
                                        className="flex items-center space-x-1 hover:text-red-600 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded"
                                        aria-label="Dislike post"
                                        type="button"
                                    >
                                        <ThumbsDown className="h-4 w-4" />
                                        <span>{post.dislikes || 0}</span>
                                    </button>
                                    <div className="flex items-center space-x-1 hover:text-blue-500 transition-colors duration-200 select-none">
                                        <MessageSquare className="h-4 w-4" />
                                        <span>
                                            {Array.isArray(post.comments)
                                                ? post.comments.length
                                                : post.comments || 0}
                                        </span>
                                    </div>
                                </div>
                                <Link
                                    to={`/community/${post._id}`}
                                    className="text-blue-700 hover:text-blue-800 font-medium transition-colors duration-200 whitespace-nowrap"
                                >
                                    Read More
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <nav
                        aria-label="Pagination"
                        className="flex flex-wrap justify-center gap-2 mb-8"
                    >
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-4 py-2 rounded-lg border border-gray-300 transition-colors duration-200 min-w-[44px] text-center
                  ${currentPage === page
                                        ? 'bg-blue-700 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                    }
                `}
                                aria-current={currentPage === page ? 'page' : undefined}
                                aria-label={`Go to page ${page}`}
                                type="button"
                            >
                                {page}
                            </button>
                        ))}
                    </nav>
                )}
            </div>
        </div>
    );
};

export default CommunityPage;
