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
        <div className="flex flex-col lg:flex-row gap-8 relative">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden sticky top-[64px] z-30 bg-dark-bg/80 backdrop-blur-md py-4 px-1 -mx-4 mb-2 border-b border-gray-800">
                <button
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="w-full flex items-center justify-center gap-2 bg-card-bg border border-gray-700 rounded-lg py-2.5 text-sm font-semibold text-white shadow-sm active:scale-95 transition-all hover:border-neon-blue/50"
                >
                    <SlidersHorizontal className="h-4 w-4 text-neon-blue" />
                    {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
                    {selectedCategory !== 'All' && (
                        <span className="ml-2 bg-gray-800 text-neon-blue border border-neon-blue/30 px-2 py-0.5 rounded-full text-xs">
                            {selectedCategory}
                        </span>
                    )}
                </button>
            </div>

            {/* Sidebar Filters */}
            <aside className={`
                ${showMobileFilters ? 'block' : 'hidden md:hidden lg:block'} 
                w-full lg:w-64 flex-shrink-0 space-y-8 bg-card-bg p-6 rounded-xl border border-gray-800 h-fit 
                lg:sticky lg:top-24 z-20 transition-all duration-300 shadow-xl
            `}>
                <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
                        <span className="flex items-center text-neon-blue drop-shadow-[0_0_5px_rgba(0,243,255,0.5)]"><SlidersHorizontal className="h-5 w-5 mr-2" /> Filters</span>
                        <button onClick={() => setShowMobileFilters(false)} className="lg:hidden text-gray-400 p-1 hover:text-white hover:bg-white/10 rounded">
                            <X className="h-5 w-5" />
                        </button>
                    </h3>

                    {/* Categories */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-gray-300">Category</h4>
                        <div className="space-y-2">
                            {CATEGORIES.map(category => (
                                <label key={category} className="flex items-center cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="category"
                                        checked={selectedCategory === category}
                                        onChange={() => updateURL({ category })}
                                        className="h-4 w-4 text-neon-blue focus:ring-neon-blue bg-dark-bg border-gray-600 focus:ring-offset-0"
                                    />
                                    <span className={`ml-2 transition-colors duration-200 ${selectedCategory === category ? 'text-neon-blue font-medium' : 'text-gray-400 group-hover:text-white'}`}>{category}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-800 my-6"></div>

                    {/* Price Range */}
                    <div>
                        <h4 className="font-medium text-gray-300 mb-3">Price Range (Rs)</h4>
                        <div className="flex items-center space-x-2 mb-2">
                            <input
                                type="number"
                                placeholder="Min"
                                value={priceRange.min}
                                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && updateURL({ minPrice: priceRange.min, maxPrice: priceRange.max })}
                                className="w-full p-2 bg-dark-bg border border-gray-700 rounded-lg text-sm text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none placeholder-gray-600 transition-all"
                            />
                            <span className="text-gray-600">-</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={priceRange.max}
                                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && updateURL({ minPrice: priceRange.min, maxPrice: priceRange.max })}
                                className="w-full p-2 bg-dark-bg border border-gray-700 rounded-lg text-sm text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none placeholder-gray-600 transition-all"
                            />
                        </div>
                        <button
                            onClick={() => updateURL({ minPrice: priceRange.min, maxPrice: priceRange.max })}
                            className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg text-sm font-bold shadow-lg hover:shadow-neon-blue/20 active:scale-95 transition-all border border-white/10"
                        >
                            Apply Filter
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                {/* Search Header */}
                <div className="bg-card-bg p-4 rounded-xl border border-gray-800 mb-6 flex flex-col sm:flex-row items-center gap-4 shadow-lg">
                    <div className="relative flex-1 w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => updateURL({ search: e.target.value })}
                            className="block w-full pl-10 pr-4 py-2 bg-dark-bg border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-1 focus:ring-neon-blue focus:border-neon-blue outline-none transition-all"
                            placeholder="Search marketplace..."
                        />
                    </div>
                    <div className="text-sm text-gray-400 whitespace-nowrap">
                        Showing <span className="text-white font-bold">{items.length}</span> records
                    </div>
                </div>

                {/* Listings Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-pulse text-neon-blue text-lg">Loading items...</div>
                    </div>
                ) : items.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {items.map(item => (
                            <ItemCard key={item.id} item={{
                                ...item,
                                image: item.image_url // Map backend image_url to ItemCard's expected image prop
                            }} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-card-bg rounded-xl border border-gray-800">
                        <div className="mx-auto h-12 w-12 text-gray-600 mb-4">
                            <Search className="h-full w-full" />
                        </div>
                        <h3 className="text-lg font-medium text-white">No items found</h3>
                        <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
