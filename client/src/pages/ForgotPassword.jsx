import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Key, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api';

export default function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/forgot-password', { email });
            setSuccessMessage('An OTP has been sent to your email.');
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/reset-password', { email, otp, newPassword });
            setSuccessMessage('Password reset successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-card-bg rounded-2xl shadow-2xl p-8 border border-gray-800">
                <button
                    onClick={() => step === 1 ? navigate('/login') : setStep(1)}
                    className="flex items-center text-sm text-gray-500 hover:text-neon-blue mb-6 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to {step === 1 ? 'Login' : 'Email'}
                </button>

                <div className="text-center mb-8">
                    <div className="mx-auto h-16 w-16 bg-blue-950/30 text-neon-blue rounded-full flex items-center justify-center mb-4 border border-blue-900/50 shadow-[0_0_10px_rgba(0,243,255,0.2)]">
                        <Key className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">
                        {step === 1 ? 'Forgot Password?' : 'Reset Password'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        {step === 1
                            ? 'Enter your email to receive a password reset verified OTP.'
                            : 'Enter the verification code sent to your email.'}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 bg-red-950/30 border border-red-900 text-red-400 p-3 rounded-lg flex items-start text-sm animate-shake">
                        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-4 bg-green-950/30 border border-green-900 text-green-400 p-3 rounded-lg flex items-start text-sm">
                        <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                        {successMessage}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleRequestOtp} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2 ml-1">
                                KU Email Address
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-neon-blue transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 bg-dark-bg border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:ring-1 focus:ring-neon-blue focus:border-neon-blue outline-none transition-all duration-300"
                                    placeholder="your.email@ku.edu.np"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-4 px-4 border border-white/10 rounded-xl shadow-lg text-sm font-black text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 hover:shadow-neon-blue/20 active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send Verification Code'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">
                                Verification Code (OTP)
                            </label>
                            <input
                                type="text"
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="block w-full px-3 py-4 bg-dark-bg border border-gray-700 rounded-xl text-white focus:ring-1 focus:ring-neon-blue focus:border-neon-blue outline-none transition-all duration-300 text-center tracking-[1em] text-2xl font-black shadow-inner"
                                placeholder="123456"
                                maxLength={6}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">
                                New Password
                            </label>
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="block w-full px-3 py-3 bg-dark-bg border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:ring-1 focus:ring-neon-blue focus:border-neon-blue outline-none transition-all duration-300"
                                placeholder="••••••••"
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-4 px-4 border border-white/10 rounded-xl shadow-lg text-sm font-black text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 hover:shadow-neon-blue/20 active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
