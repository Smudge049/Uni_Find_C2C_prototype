import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';

export default function Register() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('form'); // 'form' or 'verify'
    const { showToast } = useToast();
    const { login, verifyRegister } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
            // Optionally auto-trigger OTP if name/password were also there, 
            // but usually just pre-filling email is enough.
        }
    }, [location.state]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (step === 'form') {
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                setLoading(false);
                return;
            }

            if (password.length < 6) {
                setError('Password must be at least 6 characters');
                setLoading(false);
                return;
            }

            const res = await login(email, name, 'register', password);

            if (res.success && res.requiresVerification) {
                showToast('OTP sent to your email!', 'info');
                setStep('verify');
            } else if (res.success) {
                showToast('Account created successfully!', 'success');
                navigate('/profile');
            } else {
                setError(res.message);
            }
        } else {
            // Step: verify
            if (otp.length !== 6) {
                setError('Please enter a 6-digit verification code');
                setLoading(false);
                return;
            }

            const res = await verifyRegister(email, otp);
            if (res.success) {
                showToast('Verification successful! Welcome to UniFind.', 'success');
                navigate('/profile');
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
                        Join <span className="text-neon-blue drop-shadow-[0_0_5px_rgba(0,243,255,0.4)]">UniFind</span>
                    </h2>
                    <p className="mt-3 text-sm text-gray-400">
                        {step === 'form' ? 'Create your account with your KU email' : `Verify the code sent to ${email}`}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-950/30 border border-red-900 rounded-lg p-4 flex items-start gap-3 animate-shake">
                        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-red-400">{error}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {step === 'form' ? (
                        <>
                            <div className="bg-blue-950/20 border border-blue-900/50 rounded-lg p-4">
                                <p className="text-sm text-neon-blue font-bold mb-2 flex items-center">
                                    <Mail className="h-4 w-4 mr-2" /> KUmail Required
                                </p>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Only students with <span className="text-gray-200">@ku.edu.np</span> email addresses can register.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2 ml-1">
                                        Your Name
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <UserIcon className="h-5 w-5 text-gray-500 group-focus-within:text-neon-blue transition-colors" />
                                        </div>
                                        <input
                                            id="name"
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 bg-dark-bg border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:ring-1 focus:ring-neon-blue focus:border-neon-blue outline-none transition-all duration-300"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

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

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-2 ml-1">
                                        Confirm Password
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-neon-blue transition-colors" />
                                        </div>
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 bg-dark-bg border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:ring-1 focus:ring-neon-blue focus:border-neon-blue outline-none transition-all duration-300"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-400 mb-4 text-center">
                                    Verification Code
                                </label>
                                <div className="relative flex justify-center">
                                    <input
                                        id="otp"
                                        type="text"
                                        required
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        className="block w-full max-w-[240px] py-4 bg-dark-bg border-2 border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-neon-blue focus:border-neon-blue outline-none transition-all duration-300 text-center tracking-[1em] text-3xl font-black shadow-inner"
                                        placeholder="000000"
                                    />
                                </div>
                                <p className="mt-6 text-sm text-gray-500 text-center">
                                    Did not receive the code?
                                    <button
                                        type="button"
                                        onClick={() => setStep('form')}
                                        className="ml-2 text-neon-blue font-bold hover:text-white transition-colors underline decoration-neon-blue/30"
                                    >
                                        Try again
                                    </button>
                                </p>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-4 px-4 border border-white/10 rounded-xl shadow-lg text-[10px] font-black uppercase tracking-widest text-black bg-gradient-to-r from-neon-blue/80 to-blue-700/80 hover:from-neon-blue hover:to-blue-700 hover:shadow-neon-blue/20 active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                                <span>{step === 'form' ? 'Creating account...' : 'Verifying...'}</span>
                            </div>
                        ) : (
                            step === 'form' ? 'Create Account' : 'Verify & Join'
                        )}
                    </button>

                    <div className="text-center pt-2">
                        <p className="text-sm text-gray-400">
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="font-bold text-neon-blue hover:text-white transition-colors"
                            >
                                Sign in
                            </button>
                        </p>
                    </div>

                    <div className="text-center text-[10px] text-gray-600 mt-6 uppercase tracking-widest">
                        Join the KU Marketplace Community
                    </div>
                </form>
            </div >
        </div >
    );
}
