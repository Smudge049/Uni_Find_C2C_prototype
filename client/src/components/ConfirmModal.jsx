import React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "blue" // blue, red, green
}) {
    if (!isOpen) return null;

    const variantStyles = {
        blue: {
            bg: 'bg-gradient-to-r from-neon-blue/80 to-blue-700/80',
            text: 'text-black',
            hover: 'hover:from-neon-blue hover:to-blue-700',
            shadow: 'shadow-[0_0_20px_rgba(0,243,255,0.3)]',
            icon: <AlertCircle className="h-6 w-6 text-neon-blue" />,
            iconBg: 'bg-neon-blue/10'
        },
        red: {
            bg: 'bg-gradient-to-r from-red-500/80 to-red-800/80',
            text: 'text-black',
            hover: 'hover:from-red-500 hover:to-red-800',
            shadow: 'shadow-[0_0_20px_rgba(220,38,38,0.3)]',
            icon: <AlertCircle className="h-6 w-6 text-red-500" />,
            iconBg: 'bg-red-500/10'
        },
        green: {
            bg: 'bg-gradient-to-r from-neon-green/80 to-green-700/80',
            text: 'text-black',
            hover: 'hover:from-neon-green hover:to-green-700',
            shadow: 'shadow-[0_0_20px_rgba(57,255,20,0.3)]',
            icon: <CheckCircle2 className="h-6 w-6 text-neon-green" />,
            iconBg: 'bg-neon-green/10'
        }
    };

    const style = variantStyles[variant] || variantStyles.blue;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative bg-card-bg border border-white/10 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8">
                    <div className="flex items-start mb-6">
                        <div className={`p-3 rounded-xl ${style.iconBg} mr-4 border border-white/5`}>
                            {style.icon}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">{title}</h3>
                            <p className="text-gray-400 mt-2 text-xs font-medium leading-relaxed tracking-wide">{message}</p>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-10">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 px-4 bg-white/5 border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-400 hover:bg-white/10 hover:text-white transition active:scale-95"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 py-4 px-4 ${style.bg} ${style.text} ${style.hover} rounded-xl font-black text-[10px] uppercase tracking-widest ${style.shadow} transition active:scale-95`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
