import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

const Toast = ({ message, type, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    const icons = {
        success: <CheckCircle className="h-5 w-5 text-neon-green" />,
        error: <AlertCircle className="h-5 w-5 text-red-500" />,
        warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
        info: <Info className="h-5 w-5 text-neon-blue" />,
    };

    const colors = {
        success: 'border-neon-green/50 shadow-neon-green/10',
        error: 'border-red-500/50 shadow-red-500/10',
        warning: 'border-amber-500/50 shadow-amber-500/10',
        info: 'border-neon-blue/50 shadow-neon-blue/10',
    };

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(onClose, 300); // Wait for fade out animation
    };

    return (
        <div
            className={`
                flex items-center gap-4 p-4 rounded-xl border-2 bg-card-bg/90 backdrop-blur-xl shadow-2xl pointer-events-auto
                min-w-[320px] max-w-md transition-all duration-300 transform
                ${isExiting ? 'opacity-0 translate-x-10 scale-95' : 'opacity-100 translate-x-0 scale-100'}
                ${colors[type] || colors.info}
                animate-in slide-in-from-right-10 duration-300
            `}
        >
            <div className={`p-2 rounded-lg bg-black/20`}>
                {icons[type] || icons.info}
            </div>
            <div className="flex-1 text-xs font-black uppercase tracking-widest text-white">
                {message}
            </div>
            <button
                onClick={handleClose}
                className="flex-shrink-0 text-gray-500 hover:text-white transition-colors p-1"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};

export default Toast;
