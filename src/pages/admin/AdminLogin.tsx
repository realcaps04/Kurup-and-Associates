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
    const [showErrorModal, setShowErrorModal] = useState(false);
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
                setError("Invalid admin credentials");
                setShowErrorModal(true);
            }
        } catch (err: any) {
            setError(err.message || 'Login failed');
            setShowErrorModal(true);
            console.error("Admin login error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-slate-50 items-center justify-center p-4">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-fade-in">
                <div className="p-8 space-y-8">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 mb-4 ring-1 ring-slate-200">
                            <ShieldAlert className="h-6 w-6 text-slate-700" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Administrator Access</h1>
                        <p className="text-sm text-slate-500">
                            Secure login for system management.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-700">Admin Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@firm.com"
                                    className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-200"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-700">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-200"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>



                        <Button
                            type="submit"
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white h-11"
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
                <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500">
                    <span className="flex items-center justify-center gap-1">
                        <Lock className="h-3 w-3" />
                        Authorized Personnel Only
                    </span>
                </div>
            </div>

            {/* Error Modal */}
            {showErrorModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm border border-red-100 animate-scale-up overflow-hidden">
                        <div className="bg-red-50 p-6 flex flex-col items-center justify-center border-b border-red-100">
                            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
                                <ShieldAlert className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-red-900">Access Denied</h3>
                        </div>
                        <div className="p-6 text-center space-y-6">
                            <p className="text-slate-600 text-sm">
                                {error || "Invalid credentials provided. Please check your email and password."}
                            </p>
                            <Button
                                onClick={() => setShowErrorModal(false)}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                            >
                                Try Again
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
