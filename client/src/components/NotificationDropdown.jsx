import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, CheckCircle, XCircle, ShoppingBag, Clock } from 'lucide-react';

export default function NotificationDropdown({ notifications, onMarkAsRead, onMarkAllAsRead, onClose }) {
    const navigate = useNavigate();

    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return "Just now";
    };

    const getIcon = (type) => {
        switch (type) {
            case 'reservation_request': return <ShoppingBag className="h-4 w-4 text-neon-blue" />;
            case 'reservation_accepted': return <CheckCircle className="h-4 w-4 text-neon-green" />;
            case 'reservation_rejected':
            case 'reservation_cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
            case 'item_sold': return <ShoppingBag className="h-4 w-4 text-neon-green" />;
            case 'comment':
            case 'reply': return <MessageSquare className="h-4 w-4 text-neon-purple" />;
            default: return <Bell className="h-4 w-4 text-neon-blue" />;
        }
    };

    return (
        <div className="absolute right-0 mt-4 w-80 bg-card-bg/95 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden z-[100] animate-in slide-in-from-top-2 duration-300">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
                <h3 className="font-black text-white uppercase tracking-tighter text-sm">Notifications</h3>
                {notifications.length > 0 && (
                    <button
                        onClick={onMarkAllAsRead}
                        className="text-[10px] text-neon-blue hover:text-white font-black uppercase tracking-widest transition-colors"
                    >
                        mark all as read
                    </button>
                )}
            </div>

            <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-10 text-center">
                        <Bell className="h-12 w-12 text-white/5 mx-auto mb-4" />
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">No Signals Detected</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {notifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => {
                                    if (!notif.is_read) onMarkAsRead(notif.id);
                                    if (notif.item_id) navigate(`/items/${notif.item_id}`);
                                    onClose();
                                }}
                                className={`p-4 hover:bg-white/5 cursor-pointer transition flex gap-4 ${!notif.is_read ? 'bg-neon-blue/5' : ''}`}
                            >
                                <div className={`h-10 w-10 rounded-xl flex-shrink-0 flex items-center justify-center border transition-all ${notif.is_read ? 'bg-white/5 border-white/5' : 'bg-neon-blue/10 border-neon-blue/20 shadow-[0_0_15px_rgba(0,243,255,0.1)]'}`}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1">
                                    <p className={`text-xs leading-relaxed ${!notif.is_read ? 'text-white font-bold' : 'text-gray-400 font-medium'}`}>
                                        {notif.message}
                                    </p>
                                    <div className="flex items-center mt-2 text-[10px] font-black uppercase tracking-widest text-gray-600">
                                        <Clock className="h-3 w-3 mr-1.5" />
                                        {getTimeAgo(notif.created_at)}
                                    </div>
                                </div>
                                {!notif.is_read && (
                                    <div className="h-2 w-2 rounded-full bg-neon-blue mt-2 shadow-[0_0_10px_rgba(0,243,255,0.8)]"></div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-3 bg-white/5 border-t border-white/5 text-center">
                <button
                    onClick={onClose}
                    className="text-[10px] text-gray-500 hover:text-white font-black uppercase tracking-widest transition-colors"
                >
                    Dismiss
                </button>
            </div>
        </div>
    );
}
