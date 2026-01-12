import { useParams, Link, useNavigate } from 'react-router-dom';
import { Mail, MapPin, ArrowLeft, Heart, Share2, MessageSquare, Send, CornerDownRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function ItemDetails() {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState(null); // id of comment being replied to
    const [replyText, setReplyText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const itemRes = await api.get(`/items/${id}`);
                setItem(itemRes.data);

                const commentsRes = await api.get(`/items/${id}/comments`);
                setComments(commentsRes.data);
            } catch (err) {
                console.error("Error fetching details", err);
                setError('Item not found or error loading details');
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id]);

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('Please login to comment');
            return;
        }
        if (!newComment.trim()) return;

        setSubmittingComment(true);
        try {
            const { data } = await api.post('/api/comments', {
                item_id: id,
                comment_text: newComment
            });
            setComments(prev => [...prev, data]);
            setNewComment('');
        } catch (err) {
            console.error('Error posting comment:', err);
            alert('Failed to post comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handlePostReply = async (parentId) => {
        if (!user) {
            alert('Please login to reply');
            return;
        }
        if (!replyText.trim()) return;

        setSubmittingComment(true);
        try {
            const { data } = await api.post('/api/comments', {
                item_id: id,
                comment_text: replyText,
                parent_comment_id: parentId
            });
            setComments(prev => [...prev, data]);
            setReplyText('');
            setReplyTo(null);
        } catch (err) {
            console.error('Error posting reply:', err);
            alert('Failed to post reply');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleBuy = async () => {
        if (!user) {
            alert('Please login to purchase items');
            navigate('/login', { state: { from: `/items/${id}` } });
            return;
        }

        if (window.confirm('Are you sure you want to buy this item?')) {
            setBuying(true);
            try {
                const { data } = await api.post(`/items/${id}/buy`);
                alert(data.message || 'Purchase successful!');
                // Update local item state to reflect sold status
                setItem(prev => ({ ...prev, status: 'sold' }));
            } catch (err) {
                console.error('Buy error:', err);
                alert(err.response?.data?.error || 'Failed to purchase item');
            } finally {
                setBuying(false);
            }
        }
    };

    if (loading) return <div className="p-8 text-center">Loading details...</div>;
    if (error || !item) return <div className="p-8 text-center text-red-500">{error || 'Item not found'}</div>;

    return (
        <div className="max-w-5xl mx-auto">
            <Link to="/marketplace" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6 transition">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Marketplace
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">

                    {/* Left: Images - Handling single image for MVP */}
                    <div className="bg-gray-100 p-2">
                        <div className="aspect-w-4 aspect-h-3 rounded-xl overflow-hidden mb-2">
                            <img
                                src={item.image_url || "https://placehold.co/800x600/e2e8f0/1e293b?text=No+Image"}
                                alt={item.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Thumbnails placeholder if we had multiple images */}
                    </div>

                    {/* Right: Details */}
                    <div className="p-8 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold mb-2">
                                    {item.category}
                                </span>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
                                <div className="flex items-center text-gray-500 text-sm">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {/* Location mock as it's not in DB schema yet */}
                                    Kathmandu University
                                    <span className="mx-2">•</span>
                                    {new Date(item.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-500">
                                    <Heart className="h-6 w-6" />
                                </button>
                                <button className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-blue-600">
                                    <Share2 className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <span className="text-4xl font-bold text-blue-600">Rs {item.price}</span>
                        </div>

                        <div className="prose prose-blue text-gray-600 mb-8 max-w-none">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                            <p>{item.description}</p>
                        </div>

                        {/* Seller Card */}
                        <div className="mt-auto bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <div className="flex items-center mb-4">
                                <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl">
                                    {item.seller_name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="ml-4">
                                    <h4 className="text-lg font-bold text-gray-900">{item.seller_name}</h4>
                                    <p className="text-sm text-gray-500">{item.seller_email}</p>
                                </div>
                            </div>


                            {item.status?.toLowerCase() === 'sold' ? (
                                <div className="w-full py-3 bg-gray-300 text-gray-700 rounded-lg font-medium text-center">
                                    Sold Out
                                </div>
                            ) : user && user.id === item.user_id ? (
                                <div className="w-full py-3 bg-blue-100 text-blue-700 rounded-lg font-medium text-center">
                                    Your Item
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <button
                                        onClick={handleBuy}
                                        disabled={buying}
                                        className="flex items-center justify-center w-full py-3 bg-green-600 hover:bg-green-700 active:scale-95 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {buying ? 'Processing...' : 'Buy Now'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!user) {
                                                alert('Please login to contact the seller');
                                                navigate('/login', { state: { from: `/items/${id}` } });
                                            } else {
                                                window.location.href = `mailto:${item.seller_email}`;
                                            }
                                        }}
                                        className="flex items-center justify-center w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg font-medium transition-all duration-200"
                                    >
                                        <Mail className="h-5 w-5 mr-2" /> Email Seller
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Comments Section */}
            <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8">
                    <div className="flex items-center mb-6">
                        <MessageSquare className="h-6 w-6 text-blue-600 mr-2" />
                        <h2 className="text-2xl font-bold text-gray-900">Comments</h2>
                    </div>

                    {/* New Comment Input */}
                    <form onSubmit={handlePostComment} className="mb-8">
                        <div className="flex items-start space-x-4">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                {user?.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="flex-1">
                                <textarea
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                                    placeholder={user ? "Ask a question about this item..." : "Please login to ask a question"}
                                    rows="3"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    disabled={!user || submittingComment}
                                ></textarea>
                                <div className="mt-3 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={!user || !newComment.trim() || submittingComment}
                                        className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        {submittingComment ? 'Posting...' : 'Post Comment'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-6">
                        {comments.filter(c => !c.parent_comment_id).length === 0 ? (
                            <p className="text-center text-gray-500 py-4">No comments yet. Be the first to ask!</p>
                        ) : (
                            comments
                                .filter(c => !c.parent_comment_id)
                                .map(comment => (
                                    <div key={comment.id} className="space-y-4">
                                        {/* Main Comment */}
                                        <div className="flex space-x-4">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold overflow-hidden">
                                                {comment.user_picture ? (
                                                    <img src={comment.user_picture} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    comment.user_name?.[0]?.toUpperCase() || 'U'
                                                )}
                                            </div>
                                            <div className="flex-1 bg-gray-50 p-4 rounded-2xl">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-gray-900">{comment.user_name}</span>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(comment.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700">{comment.comment_text}</p>
                                                <div className="mt-2">
                                                    <button
                                                        onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                                                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                                    >
                                                        Reply
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Replies */}
                                        <div className="ml-14 space-y-4 border-l-2 border-gray-100 pl-6">
                                            {comments
                                                .filter(r => r.parent_comment_id === comment.id)
                                                .map(reply => (
                                                    <div key={reply.id} className="flex space-x-3">
                                                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-bold overflow-hidden">
                                                            {reply.user_picture ? (
                                                                <img src={reply.user_picture} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                reply.user_name?.[0]?.toUpperCase() || 'U'
                                                            )}
                                                        </div>
                                                        <div className="flex-1 bg-blue-50/50 p-3 rounded-xl">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="font-bold text-gray-900 text-sm">{reply.user_name}</span>
                                                                <span className="text-[10px] text-gray-400">
                                                                    {new Date(reply.created_at).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-700">{reply.comment_text}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            }

                                            {/* Reply Form */}
                                            {replyTo === comment.id && (
                                                <div className="flex space-x-3 items-start mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                                    <CornerDownRight className="h-5 w-5 text-gray-300 mt-2" />
                                                    <div className="flex-1">
                                                        <textarea
                                                            className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                                                            placeholder="Write a reply..."
                                                            rows="2"
                                                            value={replyText}
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                            autoFocus
                                                        ></textarea>
                                                        <div className="mt-2 flex justify-end space-x-2">
                                                            <button
                                                                onClick={() => setReplyTo(null)}
                                                                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                disabled={!replyText.trim() || submittingComment}
                                                                onClick={() => handlePostReply(comment.id)}
                                                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                                            >
                                                                Reply
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
