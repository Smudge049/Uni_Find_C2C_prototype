import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ItemCard from '../components/ItemCard';
import api from '../api';

const CATEGORIES = ['All', 'Books', 'Electronics', 'Stationery', 'Clothing', 'Furniture', 'Sports', 'Other'];

export default function Marketplace() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const location = useLocation();
    const navigate = useNavigate();

    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const updateURL = (newParams) => {
        const params = new URLSearchParams(location.search);
        Object.keys(newParams).forEach(key => {
            if (newParams[key] === null || newParams[key] === 'All' || newParams[key] === '') {
                params.delete(key);
            } else {
                params.set(key, newParams[key]);
            }
        });
        navigate(`/marketplace?${params.toString()}`, { replace: true });
        setShowMobileFilters(false);
    };

    // Sync URL -> State and Fetch
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const categoryParam = params.get('category') || 'All';
        const searchParam = params.get('search') || '';
        const minPriceParam = params.get('minPrice') || '';
        const maxPriceParam = params.get('maxPrice') || '';

        // Find matching category case-insensitively
        const match = CATEGORIES.find(c => c.toLowerCase() === categoryParam.toLowerCase()) || 'All';

        setSelectedCategory(match);
        setSearchTerm(searchParam);
        setPriceRange({ min: minPriceParam, max: maxPriceParam });

        const debounceTimer = setTimeout(() => {
            fetchFilteredItems(match, searchParam, minPriceParam, maxPriceParam);
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [location.search]);

    const fetchFilteredItems = async (category, search, min, max) => {
        setLoading(true);
        try {
            const params = {};
            if (category !== 'All') params.category = category;
            if (search) params.search = search;
            if (min) params.minPrice = min;
            if (max) params.maxPrice = max;

            const { data } = await api.get('/items', { params });
            setItems(data);
        } catch (err) {
            console.error("Error fetching items", err);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex flex-col lg:flex-row gap-8 relative pb-20">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden sticky top-[64px] z-30 bg-dark-bg/80 backdrop-blur-md py-4 px-1 -mx-4 mb-4 border-b border-white/5">
                <button
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="w-full flex items-center justify-center gap-3 bg-card-bg border border-white/10 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-xl active:scale-95 transition-all hover:border-neon-blue/50"
                >
                    <SlidersHorizontal className="h-4 w-4 text-neon-blue" />
                    {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
                    {selectedCategory !== 'All' && (
                        <span className="ml-2 bg-neon-blue/20 text-neon-blue border border-neon-blue/30 px-2 py-0.5 rounded text-[8px]">
                            {selectedCategory}
                        </span>
                    )}
                </button>
            </div>

            {/* Sidebar Filters */}
            <aside className={`
                ${showMobileFilters ? 'fixed inset-0 z-50 bg-dark-bg p-8 pt-24 overflow-y-auto' : 'hidden lg:block'} 
                w-full lg:w-72 flex-shrink-0 space-y-10 bg-card-bg/40 backdrop-blur-xl p-8 rounded-2xl border border-white/5 h-fit 
                lg:sticky lg:top-24 z-20 transition-all duration-300 shadow-2xl
            `}>
                <div className="relative">
                    <h3 className="text-xl font-black text-white mb-8 flex items-center justify-between uppercase tracking-tighter">
                        <span className="flex items-center text-neon-blue drop-shadow-[0_0_8px_rgba(0,243,255,0.4)]">
                            <SlidersHorizontal className="h-5 w-5 mr-3" /> Filters
                        </span>
                        <button onClick={() => setShowMobileFilters(false)} className="lg:hidden text-gray-500 p-2 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                            <X className="h-6 w-6" />
                        </button>
                    </h3>

                    {/* Categories */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Category</h4>
                        <div className="space-y-3">
                            {CATEGORIES.map(category => (
                                <label key={category} className="flex items-center cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="radio"
                                            name="category"
                                            checked={selectedCategory === category}
                                            onChange={() => updateURL({ category })}
                                            className="appearance-none h-4 w-4 rounded-full border border-gray-700 bg-dark-bg checked:bg-neon-blue checked:border-neon-blue focus:ring-1 focus:ring-neon-blue/50 focus:ring-offset-0 transition-all"
                                        />
                                        {selectedCategory === category && (
                                            <div className="absolute inset-0 bg-neon-blue rounded-full blur-[4px] opacity-40"></div>
                                        )}
                                    </div>
                                    <span className={`ml-3 text-sm font-bold transition-all duration-200 uppercase tracking-wide ${selectedCategory === category ? 'text-neon-blue' : 'text-gray-500 group-hover:text-gray-300'}`}>{category}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-white/5 my-10"></div>

                    {/* Price Range */}
                    <div>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 ml-1">Price Range (Rs)</h4>
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="relative flex-1">
                                <input
                                    type="number"
                                    placeholder="MIN"
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && updateURL({ minPrice: priceRange.min, maxPrice: priceRange.max })}
                                    className="w-full p-3 bg-dark-bg border border-white/10 rounded-xl text-xs font-bold text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none placeholder-gray-700 transition-all"
                                />
                            </div>
                            <span className="text-gray-700 font-bold">-</span>
                            <div className="relative flex-1">
                                <input
                                    type="number"
                                    placeholder="MAX"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && updateURL({ minPrice: priceRange.min, maxPrice: priceRange.max })}
                                    className="w-full p-3 bg-dark-bg border border-white/10 rounded-xl text-xs font-bold text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none placeholder-gray-700 transition-all"
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => updateURL({ minPrice: priceRange.min, maxPrice: priceRange.max })}
                            className="w-full py-4 bg-gradient-to-r from-neon-blue/80 to-blue-700/80 hover:from-neon-blue hover:to-blue-700 text-black text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:shadow-neon-blue/20 active:scale-[0.98] transition-all border border-white/10"
                        >
                            Apply Filter
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                {/* Search Header */}
                <div className="bg-card-bg/40 backdrop-blur-xl p-5 rounded-2xl border border-white/5 mb-8 flex flex-col md:flex-row items-center gap-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon-blue/5 rounded-full blur-[60px] pointer-events-none"></div>

                    <div className="relative flex-1 w-full">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-neon-blue/50" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => updateURL({ search: e.target.value })}
                            className="block w-full pl-12 pr-6 py-4 bg-dark-bg/60 border border-white/10 rounded-2xl text-white font-bold placeholder-gray-600 focus:ring-1 focus:ring-neon-blue focus:border-neon-blue outline-none transition-all"
                            placeholder="SEARCH MARKETPLACE..."
                        />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white/5 px-4 py-2 rounded-full border border-white/5 whitespace-nowrap">
                        Found <span className="text-neon-blue">{items.length}</span> Objects
                    </div>
                </div>

                {/* Listings Grid */}
                {loading ? (
                    <div className="text-center py-32">
                        <div className="animate-pulse text-neon-blue font-black uppercase tracking-[0.2em] text-xs">Scanning Terminal...</div>
                    </div>
                ) : items.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                        {items.map(item => (
                            <ItemCard key={item.id} item={{
                                ...item,
                                image: item.image_url // Map backend image_url to ItemCard's expected image prop
                            }} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-card-bg/40 backdrop-blur-xl rounded-3xl border border-white/5 flex flex-col items-center justify-center">
                        <div className="p-8 bg-white/5 rounded-full mb-8 border border-white/5">
                            <Search className="h-16 w-16 text-gray-700" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-3">No Records Detected</h3>
                        <p className="text-gray-500 font-medium tracking-wide max-w-xs mx-auto">Access denied. Adjust your search parameters or filter protocols.</p>
                        <button
                            onClick={() => updateURL({ category: 'All', search: '', minPrice: '', maxPrice: '' })}
                            className="mt-10 text-[10px] font-black text-neon-blue uppercase tracking-widest hover:text-white transition-all border-b border-neon-blue/30 pb-1"
                        >
                            Reset Navigation
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
