import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, ArrowLeft, MessageSquare, Send, CornerDownRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import ConfirmModal from '../components/ConfirmModal';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

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
    const [reserving, setReserving] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        price: '',
        category: ''
    });
    const [newImageFile, setNewImageFile] = useState(null);
    const [newImagePreview, setNewImagePreview] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        variant: 'blue',
        onConfirm: () => { }
    });
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const itemRes = await api.get(`/items/${id}`);
                setItem(itemRes.data);

                // Auto-open edit if query param is present and user is owner
                const searchParams = new URLSearchParams(location.search);
                if (searchParams.get('edit') === 'true' && user && user.id === itemRes.data.uploaded_by) {
                    setEditForm({
                        title: itemRes.data.title,
                        description: itemRes.data.description,
                        price: itemRes.data.price,
                        category: itemRes.data.category
                    });
                    setIsEditing(true);
                }

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
    }, [id, location.search, user]);

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!user) {
            showToast('Please login to comment', 'warning');
            return;
        }
        if (!newComment.trim()) return;

        setSubmittingComment(true);
        try {
            const { data } = await api.post('/comments', {
                item_id: id,
                comment_text: newComment
            });
            setComments(prev => [...prev, data]);
            setNewComment('');
        } catch (err) {
            console.error('Error posting comment:', err);
            showToast('Failed to post comment', 'error');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handlePostReply = async (parentId) => {
        if (!user) {
            showToast('Please login to reply', 'warning');
            return;
        }
        if (!replyText.trim()) return;

        setSubmittingComment(true);
        try {
            const { data } = await api.post('/comments', {
                item_id: id,
                comment_text: replyText,
                parent_comment_id: parentId
            });
            setComments(prev => [...prev, data]);
            setReplyText('');
            setReplyTo(null);
        } catch (err) {
            console.error('Error posting reply:', err);
            showToast('Failed to post reply', 'error');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleConfirmSale = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Confirm Sale',
            message: 'Are you sure you want to mark this item as sold?',
            confirmText: 'Mark as Sold',
            variant: 'green',
            onConfirm: async () => {
                setConfirming(true);
                try {
                    if (item.status?.toLowerCase() === 'reserved') {
                        await api.post(`/bookings/${item.booking_id}/confirm`);
                    } else {
                        await api.post(`/items/${id}/sold`);
                    }
                    showToast('Item marked as sold successfully!', 'success');
                    setItem(prev => ({ ...prev, status: 'sold' }));
                } catch (err) {
                    console.error('Confirm error:', err);
                    showToast(err.response?.data?.error || 'Failed to mark item as sold', 'error');
                } finally {
                    setConfirming(false);
                }
            }
        });
    };

    const handleReserve = () => {
        if (!user) {
            showToast('Please login to reserve items', 'warning');
            navigate('/login', { state: { from: `/items/${id}` } });
            return;
        }

        setConfirmModal({
            isOpen: true,
            title: 'Reserve Item',
            message: 'Are you sure you want to reserve this item?',
            confirmText: 'Reserve Now',
            variant: 'blue',
            onConfirm: async () => {
                setReserving(true);
                try {
                    const { data } = await api.post(`/items/${id}/reserve`);
                    showToast(data.message || 'Reservation successful!', 'success');
                    const itemRes = await api.get(`/items/${id}`);
                    setItem(itemRes.data);
                } catch (err) {
                    console.error('Reserve error:', err);
                    showToast(err.response?.data?.error || 'Failed to reserve item', 'error');
                } finally {
                    setReserving(false);
                }
            }
        });
    };

    const handleCancel = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Cancel Booking',
            message: 'Are you sure you want to cancel this booking? The item will be available for others again.',
            confirmText: 'Yes, Cancel',
            variant: 'red',
            onConfirm: async () => {
                try {
                    await api.post(`/bookings/${item.booking_id}/cancel`);
                    showToast('Booking cancelled successfully', 'success');
                    setItem(prev => ({ ...prev, status: 'available', booking_id: null, buyer_id: null, booking_status: null }));
                } catch (err) {
                    console.error('Cancel error:', err);
                    showToast(err.response?.data?.error || 'Failed to cancel booking', 'error');
                }
            }
        });
    };

    const handleAccept = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Accept Reservation',
            message: 'Accept this reservation request?',
            confirmText: 'Accept',
            variant: 'green',
            onConfirm: async () => {
                try {
                    await api.post(`/bookings/${item.booking_id}/accept`);
                    showToast('Reservation accepted!', 'success');
                    setItem(prev => ({ ...prev, status: 'reserved', booking_status: 'reserved' }));
                } catch (err) {
                    console.error('Accept error:', err);
                    showToast(err.response?.data?.error || 'Failed to accept reservation', 'error');
                }
            }
        });
    };

    const handleReject = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Reject Reservation',
            message: 'Reject this reservation request? The item will become available for others.',
            confirmText: 'Reject',
            variant: 'red',
            onConfirm: async () => {
                try {
                    await api.post(`/bookings/${item.booking_id}/reject`);
                    showToast('Reservation rejected', 'info');
                    setItem(prev => ({ ...prev, status: 'available', booking_id: null, buyer_id: null, booking_status: null }));
                } catch (err) {
                    console.error('Reject error:', err);
                    showToast(err.response?.data?.error || 'Failed to reject reservation', 'error');
                }
            }
        });
    };

    const handleEditItem = (e) => {
        e.preventDefault();
        setEditForm({
            title: item.title,
            description: item.description,
            price: item.price,
            category: item.category
        });
        setNewImageFile(null);
        setNewImagePreview(null);
        setIsEditing(true);
    };

    const handleNewImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewImageFile(file);
            setNewImagePreview(URL.createObjectURL(file));
        }
    };

    const handleUpdateItem = async (e) => {
        e.preventDefault();
        try {
            if (parseFloat(editForm.price) <= 0) {
                showToast('Price must be a positive number', 'error');
                return;
            }
            const formData = new FormData();
            formData.append('title', editForm.title);
            formData.append('description', editForm.description);
            formData.append('price', editForm.price);
            formData.append('category', editForm.category);

            if (newImageFile) {
                formData.append('images', newImageFile);
            }

            const res = await api.put(`/items/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            showToast('Item updated successfully!', 'success');
            // Refresh item data
            const itemRes = await api.get(`/items/${id}`);
            setItem(itemRes.data);
            setIsEditing(false);
            setNewImageFile(null);
            setNewImagePreview(null);
        } catch (err) {
            console.error('Update item error:', err);
            showToast(err.response?.data?.error || 'Failed to update item', 'error');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading details...</div>;
    if (error || !item) return <div className="p-8 text-center text-red-500">{error || 'Item not found'}</div>;

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <Link to="/marketplace" className="inline-flex items-center text-gray-500 hover:text-neon-blue mb-8 transition-all duration-300 group">
                <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold">Back to Marketplace</span>
            </Link>

            <div className="bg-card-bg/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-800 overflow-hidden mb-12">
                <div className="grid grid-cols-1 lg:grid-cols-2">

                    {/* Left: Images */}
                    <div className="bg-dark-bg p-4 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-800">
                        <div className="relative group w-full aspect-square md:aspect-video lg:aspect-square rounded-2xl overflow-hidden shadow-inner bg-card-bg">
                            <img
                                src={item.image_url || "https://placehold.co/800x600/111827/00f3ff?text=No+Image"}
                                alt={item.title}
                                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="p-8 md:p-12 flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="inline-block px-4 py-1.5 bg-blue-900/40 text-neon-blue border border-blue-800/50 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                                    {item.category}
                                </span>
                                <h1 className="text-4xl font-black text-white mb-3 tracking-tight leading-tight">{item.title}</h1>
                                <div className="flex items-center text-gray-500 text-sm font-medium">
                                    <MapPin className="h-4 w-4 mr-1.5 text-neon-blue" />
                                    Kathmandu University
                                    <span className="mx-3 opacity-30">|</span>
                                    {new Date(item.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                            </div>
                        </div>

                        <div className="mb-10 flex items-baseline space-x-2">
                            <span className="text-5xl font-black text-neon-green drop-shadow-[0_0_10px_rgba(57,255,20,0.3)]">Rs {item.price}</span>
                        </div>

                        <div className="mb-12">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">Description</h3>
                            <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">{item.description}</p>
                        </div>

                        {/* Seller Card */}
                        <div className="mt-auto bg-dark-bg/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-800/80 shadow-xl group/seller">
                            <div className="flex items-center mb-8 border-b border-gray-800/50 pb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-neon-blue blur-lg opacity-20 group-hover/seller:opacity-40 transition-opacity"></div>
                                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-black text-2xl overflow-hidden relative z-10 shadow-lg border border-white/10">
                                        {item.seller_picture ? (
                                            <img src={item.seller_picture} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            item.seller_name?.[0]?.toUpperCase() || 'U'
                                        )}
                                    </div>
                                </div>
                                <div className="ml-5">
                                    <h4 className="text-xl font-black text-white group-hover/seller:text-neon-blue transition-colors">
                                        {item.seller_name}
                                    </h4>
                                    <p className="text-sm text-gray-500 font-medium">{item.seller_email}</p>
                                </div>
                            </div>

                            {item.status?.toLowerCase() === 'sold' ? (
                                <div className="w-full py-4 bg-gray-900 text-gray-500 rounded-xl font-black text-center border border-gray-800 uppercase tracking-widest text-sm">
                                    Listing Sold
                                </div>
                            ) : item.status?.toLowerCase() === 'pending' ? (
                                <div className="space-y-4">
                                    <div className="w-full py-4 bg-blue-950/40 text-neon-blue border border-blue-900/50 rounded-xl font-black text-center uppercase tracking-widest text-sm">
                                        Reservation Pending
                                    </div>
                                    {user && user.id === item.uploaded_by && (
                                        <div className="bg-blue-900/20 p-5 rounded-2xl border border-blue-800/30">
                                            <p className="text-sm text-blue-300 font-bold mb-4 flex items-center">
                                                <span className="w-2 h-2 bg-neon-blue rounded-full mr-2 animate-pulse"></span>
                                                Request from {item.buyer_name}
                                            </p>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={handleAccept}
                                                    className="flex-1 py-3 bg-neon-green/10 border border-neon-green/30 text-neon-green hover:bg-neon-green/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={handleReject}
                                                    className="flex-1 py-3 bg-red-900/10 border border-red-900/30 text-red-400 hover:bg-red-950/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {user && user.id === item.buyer_id && (
                                        <div className="text-center bg-gray-900/40 p-4 rounded-xl">
                                            <p className="text-xs text-gray-500 mb-3 font-bold uppercase tracking-widest">Awaiting Seller Approval</p>
                                            <button
                                                onClick={handleCancel}
                                                className="w-full py-2 text-xs text-red-500 hover:text-red-400 font-black uppercase tracking-widest transition-colors"
                                            >
                                                Cancel Request
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : item.status?.toLowerCase() === 'reserved' ? (
                                <div className="space-y-4">
                                    <div className="w-full py-4 bg-yellow-950/30 text-yellow-500 border border-yellow-900/30 rounded-xl font-black text-center uppercase tracking-widest text-sm">
                                        Reserved {user && user.id === item.buyer_id ? 'by You' : ''}
                                    </div>
                                    {user && user.id === item.uploaded_by && (
                                        <>
                                            <p className="text-xs text-gray-400 text-center font-bold uppercase tracking-widest">Reserved for {item.buyer_name}</p>
                                            <button
                                                onClick={handleConfirmSale}
                                                disabled={confirming}
                                                className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-sm hover:shadow-[0_0_15px_rgba(57,255,20,0.2)] active:scale-95 transition-all disabled:opacity-50"
                                            >
                                                {confirming ? 'Confirming...' : 'Mark as Sold'}
                                            </button>
                                        </>
                                    )}
                                    {(user && (user.id === item.uploaded_by || user.id === item.buyer_id)) && (
                                        <button
                                            onClick={handleCancel}
                                            className="w-full py-2 text-xs text-red-500 hover:text-red-400 font-black uppercase tracking-widest transition-colors"
                                        >
                                            Cancel Reservation
                                        </button>
                                    )}
                                </div>
                            ) : user && user.id === item.uploaded_by ? (
                                <div className="space-y-4">
                                    <div className="w-full py-4 bg-blue-900/20 text-blue-400 border border-blue-800/30 rounded-xl font-black text-center uppercase tracking-widest text-sm">
                                        Owner View
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={handleConfirmSale}
                                            disabled={confirming}
                                            className="py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:shadow-lg active:scale-95 transition-all disabled:opacity-50"
                                        >
                                            {confirming ? '...' : 'Mark Sold'}
                                        </button>
                                        <button
                                            onClick={handleEditItem}
                                            className="py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:shadow-lg active:scale-95 transition-all"
                                        >
                                            Edit Ad
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <button
                                        onClick={handleReserve}
                                        disabled={reserving}
                                        className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 border border-white/10"
                                    >
                                        {reserving ? 'Processing...' : 'Reserve This Item'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Comments Section */}
            <div className="bg-card-bg/40 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-800 overflow-hidden">
                <div className="p-8 md:p-12">
                    <div className="flex items-center space-x-3 mb-10">
                        <div className="h-8 w-1.5 bg-neon-purple rounded-full shadow-[0_0_8px_rgba(188,19,254,0.8)]"></div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Community Discussion</h2>
                    </div>

                    {/* New Comment Input */}
                    <form onSubmit={handlePostComment} className="mb-12">
                        <div className="flex items-start space-x-6">
                            <div className="h-14 w-14 rounded-2xl bg-blue-900/30 border border-blue-800/50 flex items-center justify-center text-neon-blue font-black text-xl shadow-lg shrink-0">
                                {user?.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="flex-1">
                                <textarea
                                    className="w-full p-5 bg-dark-bg border border-gray-700 rounded-2xl text-white placeholder-gray-600 focus:ring-1 focus:ring-neon-blue focus:border-neon-blue outline-none transition-all duration-300 resize-none leading-relaxed"
                                    placeholder={user ? "Have a question about the condition or price? Ask here..." : "Authorized users only. Please sign in to join the conversation."}
                                    rows="4"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    disabled={!user || submittingComment}
                                ></textarea>
                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={!user || !newComment.trim() || submittingComment}
                                        className="inline-flex items-center px-10 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50"
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        {submittingComment ? 'Transmitting...' : 'Post Comment'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-10">
                        {comments.filter(c => !c.parent_comment_id).length === 0 ? (
                            <div className="py-20 text-center bg-dark-bg/30 rounded-3xl border border-dashed border-gray-800">
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No transmissions yet. Start the conversation.</p>
                            </div>
                        ) : (
                            comments
                                .filter(c => !c.parent_comment_id)
                                .map(comment => (
                                    <div key={comment.id} className="group/comment">
                                        {/* Main Comment */}
                                        <div className="flex space-x-5">
                                            <div className="h-12 w-12 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-500 font-black overflow-hidden shrink-0 shadow-lg">
                                                {comment.user_picture ? (
                                                    <img src={comment.user_picture} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    comment.user_name?.[0]?.toUpperCase() || 'U'
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="bg-dark-bg/60 border border-gray-800 p-5 rounded-2xl rounded-tl-none relative group-hover/comment:border-gray-700 transition-colors">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="font-black text-neon-blue text-sm uppercase tracking-tight">{comment.user_name}</span>
                                                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                                                            {new Date(comment.created_at).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-300 leading-relaxed font-medium">{comment.comment_text}</p>
                                                    <div className="mt-4">
                                                        <button
                                                            onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                                                            className="text-xs font-black text-gray-500 hover:text-neon-blue uppercase tracking-widest transition-colors flex items-center"
                                                        >
                                                            Reply to thread
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Replies */}
                                                <div className="mt-4 ml-8 space-y-4 border-l border-gray-800 pl-6">
                                                    {comments
                                                        .filter(r => r.parent_comment_id === comment.id)
                                                        .map(reply => (
                                                            <div key={reply.id} className="flex space-x-4">
                                                                <div className="h-10 w-10 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-600 text-xs font-black overflow-hidden shrink-0">
                                                                    {reply.user_picture ? (
                                                                        <img src={reply.user_picture} alt="" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        reply.user_name?.[0]?.toUpperCase() || 'U'
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 bg-blue-950/10 border border-blue-900/20 p-4 rounded-xl rounded-tl-none hover:border-blue-800/40 transition-colors">
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <span className="font-black text-white text-xs uppercase tracking-tight">{reply.user_name}</span>
                                                                        <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                                                                            {new Date(reply.created_at).toLocaleString()}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm text-gray-400 font-medium leading-relaxed">{reply.comment_text}</p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    }

                                                    {/* Reply Form */}
                                                    {replyTo === comment.id && (
                                                        <div className="flex space-x-4 items-start mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                                            <CornerDownRight className="h-5 w-5 text-gray-700 mt-2 shrink-0" />
                                                            <div className="flex-1">
                                                                <textarea
                                                                    className="w-full p-4 bg-dark-bg border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:ring-1 focus:ring-neon-blue outline-none text-sm resize-none transition-all duration-300"
                                                                    placeholder="Signal your response..."
                                                                    rows="2"
                                                                    value={replyText}
                                                                    onChange={(e) => setReplyText(e.target.value)}
                                                                    autoFocus
                                                                ></textarea>
                                                                <div className="mt-3 flex justify-end space-x-3">
                                                                    <button
                                                                        onClick={() => setReplyTo(null)}
                                                                        className="px-4 py-2 text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
                                                                    >
                                                                        Abort
                                                                    </button>
                                                                    <button
                                                                        disabled={!replyText.trim() || submittingComment}
                                                                        onClick={() => handlePostReply(comment.id)}
                                                                        className="px-6 py-2 text-[10px] bg-neon-blue/10 border border-neon-blue/30 text-neon-blue rounded-lg font-black uppercase tracking-widest hover:bg-neon-blue/20 transition-all duration-300 disabled:opacity-50"
                                                                    >
                                                                        Transmit
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>
            </div>
            {/* Edit Item Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card-bg rounded-3xl shadow-2xl max-w-lg w-full p-8 md:p-10 relative border border-gray-800 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center space-x-3 mb-8">
                            <div className="h-8 w-1 bg-neon-blue rounded-full"></div>
                            <h2 className="text-2xl font-black text-white tracking-tight uppercase">Refine Listing</h2>
                        </div>
                        <form onSubmit={handleUpdateItem} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    className="w-full bg-dark-bg p-4 border border-gray-700 rounded-xl text-white focus:ring-1 focus:ring-neon-blue outline-none transition-all duration-300"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Description</label>
                                <textarea
                                    required
                                    rows="4"
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    className="w-full bg-dark-bg p-4 border border-gray-700 rounded-xl text-white focus:ring-1 focus:ring-neon-blue outline-none resize-none transition-all duration-300"
                                ></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Price (Rs)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={editForm.price}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '' || parseFloat(val) >= 0) {
                                                setEditForm({ ...editForm, price: val });
                                            }
                                        }}
                                        className="w-full bg-dark-bg p-4 border border-gray-700 rounded-xl text-white focus:ring-1 focus:ring-neon-blue outline-none transition-all duration-300 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Category</label>
                                    <select
                                        value={editForm.category}
                                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                        className="w-full bg-dark-bg p-4 border border-gray-700 rounded-xl text-white focus:ring-1 focus:ring-neon-blue outline-none transition-all duration-300 cursor-pointer"
                                    >
                                        <option value="books">Books</option>
                                        <option value="stationery">Stationery</option>
                                        <option value="electronics">Electronics</option>
                                        <option value="furniture">Furniture</option>
                                        <option value="sports">Sports</option>
                                        <option value="clothing">Clothing</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Image Replacement */}
                            <div>
                                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Image Update</label>
                                <div className="flex items-center gap-6">
                                    <div className="relative h-20 w-20 rounded-xl border border-gray-700 overflow-hidden bg-dark-bg flex items-center justify-center shrink-0 shadow-lg">
                                        {newImagePreview ? (
                                            <img src={newImagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={item.image_url} alt="Current" className="w-full h-full object-cover opacity-40 hover:opacity-100 transition-opacity" />
                                        )}
                                    </div>
                                    <label className="flex-1 cursor-pointer">
                                        <div className="flex flex-col items-center justify-center py-3 px-4 border-2 border-dashed border-gray-700 rounded-xl hover:border-neon-blue hover:bg-neon-blue/5 transition-all group">
                                            <span className="text-[10px] text-gray-500 group-hover:text-neon-blue font-black uppercase tracking-widest">Select New Frame</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleNewImageChange} />
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setNewImageFile(null);
                                        setNewImagePreview(null);
                                    }}
                                    className="flex-1 py-4 border border-gray-700 rounded-xl font-black uppercase tracking-widest text-[10px] text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:shadow-lg active:scale-95 transition-all duration-300"
                                >
                                    Confirm Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                variant={confirmModal.variant}
            />
        </div>
    );
}
