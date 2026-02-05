import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle, Mail, User as UserIcon, Lock } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const res = await login(email, null, 'login', password);

        if (res.success) {
            showToast('Sign in successful!', 'success');
            // Redirect to home page always
            navigate('/');
        } else {
            if (res.unverified) {
                setError(<>
                    {res.message}
                    <button
                        onClick={() => navigate('/register', { state: { email } })}
                        className="ml-2 underline font-bold"
                    >
                        Verify Now
                    </button>
                </>);
            } else {
                setError(res.message);
            }
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-card-bg p-10 rounded-2xl shadow-2xl border border-gray-800">
                <div className="text-center">
                    <div className="mx-auto h-20 w-20 flex items-center justify-center mb-4 transform hover:scale-110 transition-transform duration-300">
                        <img src="/logo.png" alt="UNI-find Logo" className="h-full w-full object-contain drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]" />
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight">
                        Welcome to <span className="text-neon-blue drop-shadow-[0_0_5px_rgba(0,243,255,0.4)]">UniFind</span>
                    </h2>
                    <p className="mt-3 text-sm text-gray-400">
                        Sign in with your Kathmandu University email
                    </p>
                </div>

                {error && (
                    <div className="bg-red-950/30 border border-red-900 rounded-lg p-4 flex items-start gap-3 animate-shake">
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-red-400">{error}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="bg-blue-950/20 border border-blue-900/50 rounded-lg p-4">
                        <p className="text-sm text-neon-blue font-bold mb-2 flex items-center">
                            <Mail className="h-4 w-4 mr-2" /> KUmail Required
                        </p>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Only students with <span className="text-gray-200">@ku.edu.np</span> email addresses can access this platform.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2 ml-1">
                                KU Email Address
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-neon-blue transition-colors" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 bg-dark-bg border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:ring-1 focus:ring-neon-blue focus:border-neon-blue outline-none transition-all duration-300"
                                    placeholder="your.name@ku.edu.np"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2 ml-1">
                                Password
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-neon-blue transition-colors" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 bg-dark-bg border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:ring-1 focus:ring-neon-blue focus:border-neon-blue outline-none transition-all duration-300"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pr-1">
                            <button
                                type="button"
                                onClick={() => navigate('/forgot-password')}
                                className="text-sm font-medium text-neon-blue hover:text-white transition-colors duration-200"
                            >
                                Forgot password?
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3.5 px-4 border border-white/10 rounded-xl shadow-lg text-sm font-black text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 hover:shadow-neon-blue/20 active:scale-[0.98] focus:outline-none transition-all duration-300 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                                <span>Signing in...</span>
                            </div>
                        ) : (
                            'Sign In'
                        )}
                    </button>

                    <div className="text-center pt-2">
                        <p className="text-sm text-gray-400">
                            Don't have an account?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/register')}
                                className="font-bold text-neon-blue hover:text-white transition-colors"
                            >
                                Register
                            </button>
                        </p>
                    </div>
                    <div className="text-center text-[10px] text-gray-600 mt-6 uppercase tracking-widest">
                        Secure Access • Campus Only
                    </div>
                </form>
            </div>
        </div>
    );
}
