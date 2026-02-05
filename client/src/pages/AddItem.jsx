import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const CATEGORIES = ['Books', 'Electronics', 'Stationery', 'Clothing', 'Furniture', 'Sports', 'Other'];

export default function AddItem() {
    const [images, setImages] = useState([]); // Preview URLs
    const [files, setFiles] = useState([]); // Actual File objects
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        price: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleImageUpload = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles([...files, ...selectedFiles]);

        // Create preview URLs
        const newImages = selectedFiles.map(file => URL.createObjectURL(file));
        setImages([...images, ...newImages]);
    };

    const removeImage = (index) => {
        const newImages = [...images];
        const newFiles = [...files];
        newImages.splice(index, 1);
        newFiles.splice(index, 1);
        setImages(newImages);
        setFiles(newFiles);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('category', formData.category);
            data.append('price', formData.price);
            data.append('description', formData.description);

            files.forEach(file => {
                data.append('images', file);
            });

            await api.post('/items', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            showToast('Item posted successfully!', 'success');
            navigate('/marketplace');
        } catch (err) {
            console.error("Failed to post item", err);
            showToast('Failed to list item. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-card-bg/80 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-800 p-8 md:p-12 mb-12">
            <div className="flex items-center space-x-3 mb-10">
                <div className="h-8 w-1.5 bg-neon-blue rounded-full shadow-[0_0_8px_rgba(0,243,255,0.8)]"></div>
                <h1 className="text-3xl font-black text-white tracking-tight">Post a New Ad</h1>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-bold text-gray-400 mb-3 ml-1">Ad Title</label>
                    <input
                        type="text"
                        name="title"
                        required
                        className="block w-full bg-dark-bg border border-gray-700 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:ring-1 focus:ring-neon-blue focus:border-neon-blue outline-none transition-all duration-300"
                        placeholder="What are you offering?"
                        value={formData.title}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-3 ml-1">Category</label>
                        <select
                            name="category"
                            required
                            className="block w-full bg-dark-bg border border-gray-700 rounded-xl px-4 py-4 text-white focus:ring-1 focus:ring-neon-blue focus:border-neon-blue outline-none transition-all duration-300 cursor-pointer"
                            value={formData.category}
                            onChange={handleChange}
                        >
                            <option value="" className="bg-card-bg">Select Category</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat} className="bg-card-bg">{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-3 ml-1">Price (Rs)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neon-green font-bold">Rs</span>
                            <input
                                type="number"
                                name="price"
                                required
                                min="0"
                                step="0.01"
                                className="block w-full bg-dark-bg border border-gray-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:ring-1 focus:ring-neon-blue focus:border-neon-blue outline-none transition-all duration-300 font-mono"
                                placeholder="0.00"
                                value={formData.price}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || parseFloat(val) >= 0) {
                                        handleChange(e);
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-400 mb-3 ml-1">Description</label>
                    <textarea
                        name="description"
                        rows="5"
                        required
                        className="block w-full bg-dark-bg border border-gray-700 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:ring-1 focus:ring-neon-blue focus:border-neon-blue outline-none transition-all duration-300 resize-none leading-relaxed"
                        placeholder="Detail the condition, age, and any other relevant specs..."
                        value={formData.description}
                        onChange={handleChange}
                    ></textarea>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-400 mb-4 ml-1">Photos</label>

                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                        {images.map((img, idx) => (
                            <div key={idx} className="relative aspect-square bg-dark-bg rounded-xl border border-gray-800 overflow-hidden group shadow-lg">
                                <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="bg-red-600 text-white p-2 rounded-full transform hover:scale-110 active:scale-95 transition-all"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                {idx === 0 && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-neon-blue/80 text-dark-bg text-[10px] font-black py-1 text-center uppercase tracking-widest">
                                        Cover
                                    </div>
                                )}
                            </div>
                        ))}

                        <label className="border-2 border-dashed border-gray-700 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-neon-blue hover:bg-neon-blue/5 transition-all duration-300 h-full aspect-square group">
                            <Upload className="h-8 w-8 text-gray-500 group-hover:text-neon-blue transition-colors mb-2" />
                            <span className="text-xs text-gray-500 group-hover:text-gray-300 font-bold transition-colors">Add Photo</span>
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                    </div>
                    <p className="text-xs text-gray-600 ml-1">You can upload up to 5 high-quality photos. Drag & drop coming soon.</p>
                </div>

                <div className="pt-8 flex flex-col sm:flex-row justify-end gap-4 border-t border-gray-800/50">
                    <button
                        type="button"
                        onClick={() => navigate('/marketplace')}
                        className="px-8 py-4 border border-gray-700 rounded-xl text-gray-400 font-bold hover:bg-white/5 hover:text-white transition-all duration-300 order-2 sm:order-1"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-black text-lg hover:shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 order-1 sm:order-2 border border-white/10"
                    >
                        {loading ? 'Processing...' : 'Post Ad Now'}
                    </button>
                </div>
            </form>
        </div>
    );
}
