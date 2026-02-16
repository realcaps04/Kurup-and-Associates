import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Briefcase, ShieldCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            navigate('/');
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-white">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative flex-col justify-between p-12 text-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 z-0"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay z-0"></div>

                <div className="relative z-10 flex items-center space-x-2">
                    <ShieldCheck className="h-8 w-8 text-blue-400" />
                    <span className="text-xl font-bold tracking-wide">SecureData</span>
                </div>

                <div className="relative z-10 space-y-6 max-w-lg">
                    <h2 className="text-4xl font-bold leading-tight tracking-tight">
                        Powering the Future of Legal Data Management
                    </h2>
                    <p className="text-slate-400 text-lg">
                        Streamline your casework, manage clients securely, and access critical documents with our next-generation platform.
                    </p>
                </div>

                <div className="relative z-10 flex items-center space-x-4 text-sm text-slate-500">
                    <div>© 2026 Kurup & Associates</div>
                    <div className="h-1 w-1 rounded-full bg-slate-600"></div>
                    <div>Privacy Policy</div>
                    <div className="h-1 w-1 rounded-full bg-slate-600"></div>
                    <div>Terms of Service</div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-sm space-y-8 animate-fade-in">
                    <div className="flex flex-col items-center text-center space-y-2">
                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-2">
                            <Briefcase className="h-8 w-8 text-slate-900" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome Back</h1>
                        <p className="text-sm text-slate-500">
                            Enter your credentials to access your workspace
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="kurup&Coexample@gmail.com"
                                    className="bg-white"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <a href="#" className="text-xs font-medium text-slate-900 hover:text-slate-700 hover:underline">
                                        Forgot password?
                                    </a>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    className="bg-white"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg animate-slide-up">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white h-11 shadow-lg shadow-slate-900/10 transition-all hover:scale-[1.02]"
                            isLoading={loading}
                        >
                            Sign In to Account
                        </Button>
                    </form>

                    <div className="text-center text-sm">
                        <span className="text-slate-500">Don't have an account? </span>
                        <Link to="/signup" className="font-medium text-slate-900 hover:underline">
                            Request Access
                        </Link>
                    </div>

                    <div className="text-center text-xs text-slate-400">
                        Protected by enterprise-grade security encryption.
                    </div>
                </div>
            </div>
        </div>
    );
}
