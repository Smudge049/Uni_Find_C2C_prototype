import { Link } from 'react-router-dom';

export default function ItemCard({ item }) {
    const getTimeAgo = (dateString) => {
        if (!dateString) return '';
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
        return Math.floor(seconds) + "s ago";
    };

    return (
        <Link to={`/items/${item.id}`} className="block group">
            <div className="bg-card-bg rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(0,243,255,0.2)] hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-white/5 cursor-pointer backdrop-blur-md">
                <div className="bg-gray-800/50 h-48 w-full relative">
                    <img
                        src={item.image_url || item.image || "https://placehold.co/400x300"}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {item.status?.toLowerCase() === 'sold' && (
                        <div className="absolute top-3 right-3 bg-red-600/90 backdrop-blur-md text-white text-[10px] font-black tracking-widest px-2 py-1 rounded shadow-lg border border-red-500/50">
                            SOLD
                        </div>
                    )}
                    {item.status?.toLowerCase() === 'reserved' && (
                        <div className="absolute top-3 right-3 bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-black tracking-widest px-2 py-1 rounded shadow-lg border border-amber-400/50">
                            RESERVED
                        </div>
                    )}

                    <div className="absolute bottom-3 left-3 flex items-center bg-black/60 backdrop-blur-md rounded-full pr-3 pl-1 py-1 border border-white/10 shadow-lg">
                        <div className="h-6 w-6 rounded-full bg-neon-blue/20 flex items-center justify-center text-[10px] text-neon-blue font-bold overflow-hidden border border-neon-blue/30">
                            {item.seller_picture ? (
                                <img src={item.seller_picture} alt="" className="w-full h-full object-cover" />
                            ) : (
                                item.seller_name?.[0]?.toUpperCase() || 'U'
                            )}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider ml-2 text-white/90">{item.seller_name}</span>
                    </div>
                </div>
                <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-white truncate pr-2 group-hover:text-neon-blue transition-colors uppercase tracking-tight">{item.title}</h3>
                    </div>

                    <p className="text-xs text-gray-400 line-clamp-2 h-8 mb-4">{item.description}</p>

                    <div className="flex justify-between items-center">
                        <span className="text-neon-green font-black text-lg">Rs {item.price}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-400 transition-colors">{getTimeAgo(item.created_at)}</span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-neon-blue/10 text-[10px] font-black uppercase tracking-widest text-neon-blue border border-neon-blue/20">
                            {item.category}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
