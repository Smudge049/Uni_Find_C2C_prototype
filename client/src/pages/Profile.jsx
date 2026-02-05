import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { User, Mail, Edit, Package, CheckCircle, Heart, LogOut, X } from 'lucide-react';
import ItemCard from '../components/ItemCard';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Profile() {
    const [activeTab, setActiveTab] = useState('active');

    const { logout, refreshUser, user } = useAuth();
    const { showToast } = useToast();

    // Auth context user is basic payload, we want full profile + stats
    // We'll manage local profile state to update immediately on edit.
    const [profile, setProfile] = useState({
        name: user?.name || 'Loading...',
        email: user?.email || '',
        faculty: 'Student',
        avatar: user?.picture ? user.picture : `https://placehold.co/150x150/3b82f6/ffffff?text=${user?.name ? user.name.charAt(0) : 'U'}`,

    });

    const [myItems, setMyItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit Modal State
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isRemovingImage, setIsRemovingImage] = useState(false);


    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            // Fetch multiple datasets concurrently for better performance
            const [userRes, itemsRes] = await Promise.all([
                api.get('/dashboard'),
                api.get('/my-items')
            ]);

            if (userRes.data.user) {
                const profilePic = userRes.data.user.picture
                    ? userRes.data.user.picture
                    : `https://placehold.co/150x150/3b82f6/ffffff?text=${userRes.data.user.name.charAt(0)}`;

                setProfile(prev => ({
                    ...prev,
                    name: userRes.data.user.name,
                    email: userRes.data.user.email,
                    avatar: profilePic
                }));
                setEditName(userRes.data.user.name);
                setImagePreview(profilePic);
            }

            setMyItems(itemsRes.data);
        } catch (error) {
            console.error('Error fetching profile data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', editName);
            if (imageFile) {
                formData.append('avatar', imageFile);
            } else if (isRemovingImage) {
                formData.append('removePicture', true);
            }

            const res = await api.put('/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Update local state
            setProfile(prev => ({
                ...prev,
                name: res.data.user.name,
                avatar: res.data.user.picture
            }));

            // Update global context
            if (refreshUser) {
                refreshUser(res.data.user);
            }

            setIsRemovingImage(false);
            setIsEditing(false);
            showToast('Profile updated successfully!', 'success');
        } catch (error) {
            console.error('Failed to update profile:', error);
            showToast('Failed to update profile', 'error');
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setIsRemovingImage(false);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(`https://placehold.co/150x150/3b82f6/ffffff?text=${profile.name.charAt(0)}`);
        setIsRemovingImage(true);
    };

    // Calculate Counts
    const activeCount = myItems.length; // For now assuming all my items are active or sold, total listings
    const soldCount = myItems.filter(i => i.status?.toLowerCase() === 'sold').length;

    // Filter for Display
    const displayedItems = activeTab === 'active'
        ? myItems.filter(i => i.status?.toLowerCase() !== 'sold')
        : activeTab === 'sold'
            ? myItems.filter(i => i.status?.toLowerCase() === 'sold')
            : [];

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Profile Header */}
            <div className="bg-card-bg/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/5 p-8 mb-12 relative overflow-hidden">
                {/* Decorative Background Element */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-neon-blue/10 rounded-full blur-[100px] pointer-events-none"></div>

                {/* Logout Button */}
                <button
                    onClick={logout}
                    className="absolute top-6 right-6 text-gray-500 hover:text-red-500 flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 group"
                    title="Logout"
                >
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Logout</span>
                    <LogOut className="h-5 w-5" />
                </button>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-neon-blue to-neon-purple rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
                        <img
                            src={profile.avatar}
                            alt={profile.name}
                            className="relative w-32 h-32 rounded-full border-2 border-white/10 object-cover shadow-2xl"
                        />
                        <button
                            onClick={() => setIsEditing(true)}
                            className="absolute bottom-1 right-1 bg-neon-blue text-black p-2.5 rounded-full hover:bg-white transition-all shadow-xl border-2 border-dark-bg active:scale-90"
                        >
                            <Edit className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-6">
                        <div>
                            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-1">{profile.name}</h1>
                            <div className="inline-flex items-center px-3 py-1 bg-neon-blue/10 rounded-full border border-neon-blue/20">
                                <span className="text-[10px] font-black text-neon-blue uppercase tracking-widest">{profile.faculty}</span>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6 items-center justify-center md:justify-start">
                            <div className="flex items-center text-gray-400 group cursor-pointer hover:text-white transition-colors">
                                <div className="p-2 bg-white/5 rounded-lg mr-3 border border-white/10 group-hover:border-neon-blue/30 transition-colors">
                                    <Mail className="h-4 w-4 text-neon-blue" />
                                </div>
                                <span className="text-sm font-medium">{profile.email}</span>
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center md:justify-start pt-4">
                            <div className="text-center px-8 py-4 bg-white/5 rounded-2xl border border-white/10 hover:border-neon-blue/30 transition-all duration-300 group">
                                <span className="block text-3xl font-black text-white group-hover:text-neon-blue transition-colors">{activeCount}</span>
                                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Listings</span>
                            </div>
                            <div className="text-center px-8 py-4 bg-white/5 rounded-2xl border border-white/10 hover:border-neon-green/30 transition-all duration-300 group">
                                <span className="block text-3xl font-black text-white group-hover:text-neon-green transition-colors">{soldCount}</span>
                                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Sold</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-card-bg border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden">
                        {/* Decorative Background Element */}
                        <div className="absolute -top-24 -left-24 w-48 h-48 bg-neon-blue/5 rounded-full blur-[80px] pointer-events-none"></div>

                        <button
                            onClick={() => setIsEditing(false)}
                            className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-8">Edit Profile</h2>

                        <form onSubmit={handleUpdateProfile} className="space-y-8 relative z-10">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="block w-full bg-dark-bg border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all p-4 text-sm font-bold"
                                />
                            </div>

                            <div className="flex flex-col items-center">
                                <label className="block w-full text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 ml-1">Profile Picture</label>
                                <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload').click()}>
                                    <div className="absolute -inset-1 bg-gradient-to-tr from-neon-blue/20 to-neon-purple/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                    <img
                                        src={imagePreview || profile.avatar}
                                        alt="Profile Preview"
                                        className="relative w-28 h-28 rounded-full object-cover border-2 border-white/10 group-hover:border-neon-blue transition-colors duration-500 shadow-xl"
                                    />
                                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="text-white text-[10px] font-black uppercase tracking-widest">Change</div>
                                    </div>
                                    <input
                                        type="file"
                                        id="avatar-upload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </div>
                            </div>

                            {(imagePreview || profile.avatar) && !imagePreview?.includes('placehold.co') && (
                                <div className="flex justify-center">
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="text-[10px] font-black uppercase tracking-widest text-black bg-gradient-to-r from-red-500/80 to-red-800/80 hover:from-red-500 hover:to-red-800 py-2 px-6 rounded-full border border-white/10 transition-all shadow-lg active:scale-95"
                                    >
                                        Remove Picture
                                    </button>
                                </div>
                            )}

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setIsRemovingImage(false);
                                        setImageFile(null);
                                        setImagePreview(profile.avatar);
                                    }}
                                    className="flex-1 py-4 px-6 bg-white/5 border border-white/10 rounded-xl text-gray-400 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 hover:text-white transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 px-6 bg-gradient-to-r from-neon-blue/80 to-blue-700/80 hover:from-neon-blue hover:to-blue-700 text-black font-black uppercase tracking-widest text-[10px] rounded-xl shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:shadow-[0_0_30px_rgba(0,243,255,0.5)] transition-all active:scale-95 border border-white/10"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Tabs & Listings */}
            <div>
                <div className="mb-10 border-b border-white/5">
                    <nav className="-mb-px flex space-x-12 justify-center md:justify-start">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`${activeTab === 'active'
                                ? 'border-neon-blue text-neon-blue'
                                : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-white/20'
                                } whitespace-nowrap py-4 px-1 border-b-2 text-[10px] font-black uppercase tracking-widest flex items-center transition-all duration-300`}
                        >
                            <Package className={`h-4 w-4 mr-2 ${activeTab === 'active' ? 'text-neon-blue' : 'text-gray-500'}`} /> Active Listings
                        </button>
                        <button
                            onClick={() => setActiveTab('sold')}
                            className={`${activeTab === 'sold'
                                ? 'border-neon-green text-neon-green'
                                : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-white/20'
                                } whitespace-nowrap py-4 px-1 border-b-2 text-[10px] font-black uppercase tracking-widest flex items-center transition-all duration-300`}
                        >
                            <CheckCircle className={`h-4 w-4 mr-2 ${activeTab === 'sold' ? 'text-neon-green' : 'text-gray-500'}`} /> Sold items
                        </button>
                    </nav>
                </div>

                {loading ? (
                    <div className="text-center py-24">
                        <div className="animate-pulse text-neon-blue font-black uppercase tracking-[0.2em] text-xs">Accessing Data...</div>
                    </div>
                ) : displayedItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {displayedItems.map(item => (
                            <div key={item.id} className="relative group">
                                <ItemCard item={item} />
                                {activeTab === 'active' && (
                                    <Link
                                        to={`/items/${item.id}?edit=true`}
                                        className="absolute top-4 right-4 bg-neon-blue text-black p-2.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white active:scale-90"
                                        title="Edit Listing"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center">
                        <div className="p-6 bg-white/5 rounded-full mb-6 border border-white/5">
                            <Package className="h-12 w-12 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">No {activeTab} Records Found</h3>
                        <p className="text-gray-500 text-sm font-medium tracking-wide">All items listed under this status will be archived here.</p>
                        <Link to="/add-item" className="mt-8 text-[10px] font-black text-neon-blue uppercase tracking-widest hover:text-white transition-colors border-b border-neon-blue/30 pb-1">
                            Create New Listing
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
