import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import ItemCard from '../components/ItemCard';
import api from '../api';

const CATEGORIES = [
    { name: 'Books', icon: '📚' },
    { name: 'Stationery', icon: '✏️' },
    { name: 'Electronics', icon: '💻' },
    { name: 'Furniture', icon: '🪑' },
    { name: 'Clothing', icon: '👕' },
    { name: 'Sports', icon: '⚽' },
    { name: 'Other', icon: '📦' },
];

export default function Home() {
    const [recentItems, setRecentItems] = useState([]);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await api.get('/items');
                setRecentItems(response.data.slice(0, 4));
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };
        fetchItems();
    }, []);
    return (
        <div className="space-y-16">
            {/* Hero Section */}
            <section className="relative rounded-3xl p-10 md:p-20 text-center text-white overflow-hidden bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-white/10 shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="relative z-10 max-w-3xl mx-auto space-y-8 flex flex-col items-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-neon-blue blur-3xl opacity-20 animate-pulse"></div>
                        <img src="/logo.png" alt="UNI-find Logo" className="h-28 w-28 md:h-40 md:w-40 object-contain mx-auto relative z-10 drop-shadow-[0_0_15px_rgba(0,243,255,0.6)]" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
                            Welcome to <span className="text-neon-blue drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">UNI-find</span>
                        </h1>
                        <p className="text-xl text-gray-300 font-medium max-w-xl mx-auto">
                            The elite marketplace for Kathmandu University students to connect and trade.
                        </p>
                    </div>
                    <Link to="/marketplace" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-black text-lg hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20">
                        Explore Marketplace
                    </Link>
                </div>
            </section>

            {/* Categories */}
            <section>
                <div className="flex items-center space-x-3 mb-8">
                    <div className="h-8 w-1.5 bg-neon-blue rounded-full shadow-[0_0_8px_rgba(0,243,255,0.8)]"></div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Browse Categories</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {CATEGORIES.map((cat) => (
                        <Link
                            key={cat.name}
                            to={`/marketplace?category=${cat.name}`}
                            className="bg-card-bg/60 backdrop-blur-sm rounded-2xl p-8 text-center shadow-lg hover:shadow-neon-blue/20 hover:-translate-y-2 transition-all duration-300 cursor-pointer border border-gray-800 hover:border-neon-blue/50 group block"
                        >
                            <div className="text-4xl mb-4 group-hover:scale-125 group-hover:drop-shadow-[0_0_10px_rgba(0,243,255,0.4)] transition-all duration-300">{cat.icon}</div>
                            <h3 className="font-bold text-gray-300 group-hover:text-white transition-colors">{cat.name}</h3>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Recent Listings */}
            <section>
                <div className="flex justify-between items-end mb-8">
                    <div className="flex items-center space-x-3">
                        <div className="h-8 w-1.5 bg-neon-purple rounded-full shadow-[0_0_8px_rgba(188,19,254,0.8)]"></div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Recently Listed</h2>
                    </div>
                    <Link to="/marketplace" className="text-neon-blue font-bold hover:text-white transition-colors flex items-center group">
                        View All <span className="ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {recentItems.length > 0 ? (
                        recentItems.map((item) => (
                            <ItemCard key={item.id} item={item} />
                        ))
                    ) : (
                        <div className="col-span-full py-20 bg-card-bg/40 rounded-3xl border border-dashed border-gray-800 text-center">
                            <p className="text-gray-500 font-medium">No items listed yet in the campus ecosystem.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
