import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { ShieldAlert, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Call custom RPC for admin login
            const { data: success, error: rpcError } = await supabase
                .rpc('admin_login', {
                    email_input: email,
                    password_input: password
                });

            if (rpcError) throw rpcError;

            if (success) {
                // Set a simple local session marker (in a real app, use a secure token or cookie)
                localStorage.setItem('admin_session', 'true');
                navigate('/admin/dashboard');
            } else {
                throw new Error("Invalid admin credentials");
            }
        } catch (err: any) {
            setError(err.message || 'Login failed');
            console.error("Admin login error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-slate-950 items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
                <div className="p-8 space-y-8">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-500/10 mb-4 ring-1 ring-red-500/20">
                            <ShieldAlert className="h-6 w-6 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">Administrator Access</h1>
                        <p className="text-sm text-slate-400">
                            Secure login for system management.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-300">Admin Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@firm.com"
                                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-red-500/50 focus:ring-red-500/20"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-300">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-red-500/50 focus:ring-red-500/20"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg animate-slide-up flex items-center gap-2">
                                <ShieldAlert className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-700 text-white h-11"
                            isLoading={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying Credentials...
                                </>
                            ) : (
                                <>
                                    Access Dashboard
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>
                </div>
                <div className="px-8 py-4 bg-slate-950/50 border-t border-slate-800 text-center text-xs text-slate-500">
                    <span className="flex items-center justify-center gap-1">
                        <Lock className="h-3 w-3" />
                        Authorized Personnel Only
                    </span>
                </div>
            </div>
        </div>
    );
}
