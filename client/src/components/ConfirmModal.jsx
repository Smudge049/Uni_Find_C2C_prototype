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
            bg: 'bg-blue-600',
            hover: 'hover:bg-blue-700',
            icon: <AlertCircle className="h-6 w-6 text-blue-600" />,
            iconBg: 'bg-blue-100'
        },
        red: {
            bg: 'bg-red-600',
            hover: 'hover:bg-red-700',
            icon: <AlertCircle className="h-6 w-6 text-red-600" />,
            iconBg: 'bg-red-100'
        },
        green: {
            bg: 'bg-green-600',
            hover: 'hover:bg-green-700',
            icon: <CheckCircle2 className="h-6 w-6 text-green-600" />,
            iconBg: 'bg-green-100'
        }
    };

    const style = variantStyles[variant] || variantStyles.blue;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex items-start mb-4">
                        <div className={`p-2 rounded-full ${style.iconBg} mr-4`}>
                            {style.icon}
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                            <p className="text-gray-500 mt-1 text-sm leading-relaxed">{message}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-4 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition active:scale-95"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 py-3 px-4 ${style.bg} ${style.hover} text-white rounded-xl font-semibold shadow-lg shadow-gray-200 transition active:scale-95`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
