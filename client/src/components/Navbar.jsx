import { Link } from 'react-router-dom';
import { User, PlusCircle, Search, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
    const { user, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            return;
        }

        fetchNotifications();

        // Optional: Poll for new notifications every 60s
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
        } catch (err) {
            console.error('Failed to mark read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
        } catch (err) {
            console.error('Failed to mark all read:', err);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    return (
        <nav className="bg-card-bg/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 group">
                        <img src="/logo.png" alt="UNI-find Logo" className="h-10 w-10 object-contain group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(0,243,255,0.6)] transition-all duration-300" />
                        <span className="text-2xl font-black text-neon-blue drop-shadow-[0_0_3px_rgba(0,243,255,0.4)] tracking-tight">UNI-find</span>
                    </Link>

                    {/* Center Search */}
                    <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg leading-5 bg-dark-bg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-neon-blue focus:border-neon-blue sm:text-sm transition-all"
                            placeholder="Search for items..."
                        />
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center space-x-4">
                        <Link to="/marketplace" className="text-gray-400 hover:text-neon-blue font-medium transition-colors duration-200">
                            Marketplace
                        </Link>

                        {user ? (
                            <>
                                <Link to="/sell" className="flex items-center space-x-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-[0_0_15px_rgba(0,243,255,0.3)] active:scale-95 transition-all duration-200 font-bold border border-white/10">
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Post Item</span>
                                </Link>

                                {/* Notifications */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="p-2 text-gray-400 hover:text-neon-blue hover:bg-white/5 rounded-full transition relative group"
                                    >
                                        <Bell className="h-6 w-6" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1 right-1 h-4 w-4 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-card-bg">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {showNotifications && (
                                        <NotificationDropdown
                                            notifications={notifications}
                                            onMarkAsRead={markAsRead}
                                            onMarkAllAsRead={markAllAsRead}
                                            onClose={() => setShowNotifications(false)}
                                        />
                                    )}
                                </div>

                                {/* User Profile Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="flex items-center space-x-2 focus:outline-none"
                                    >
                                        {user.picture ? (
                                            <img
                                                src={user.picture}
                                                alt={user.name}
                                                className="h-8 w-8 rounded-full border-2 border-gray-700 hover:border-neon-blue hover:shadow-[0_0_8px_rgba(0,243,255,0.4)] transition-all duration-200"
                                            />
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold hover:shadow-[0_0_8px_rgba(0,243,255,0.4)] transition-all duration-200">
                                                {user.name?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </button>

                                    {/* Dropdown Menu */}
                                    {showDropdown && (
                                        <div className="absolute right-0 mt-3 w-56 bg-card-bg rounded-xl shadow-2xl border border-gray-800 py-1.5 z-50 ring-1 ring-white/5">
                                            <div className="px-4 py-3 border-b border-gray-800">
                                                <p className="text-sm font-bold text-white">{user.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                            <Link
                                                to="/profile"
                                                onClick={() => setShowDropdown(false)}
                                                className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200 group"
                                            >
                                                <User className="inline h-4 w-4 mr-2 group-hover:text-neon-blue transition-colors" />
                                                My Profile
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    setShowDropdown(false);
                                                    logout();
                                                }}
                                                className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all duration-200 group"
                                            >
                                                <LogOut className="inline h-4 w-4 mr-2" />
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-[0_0_15px_rgba(0,243,255,0.4)] active:scale-95 font-bold transition-all duration-200 border border-white/10"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Click outside to close dropdowns */}
            {(showDropdown || showNotifications) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setShowDropdown(false);
                        setShowNotifications(false);
                    }}
                />
            )}
        </nav>
    );
}
