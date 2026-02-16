import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
            <div className="w-full max-w-md p-4">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 mb-4">
                        <Briefcase className="h-8 w-8 text-slate-900" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kurup & Associates</h1>
                    <p className="text-slate-500 mt-2">Legal Data Management System</p>
                </div>

                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-center">Clerk Login</CardTitle>
                        <p className="text-center text-sm text-slate-500">Enter your credentials to access the workspace</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="clerk@kurup.law"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {error && (
                                <div className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-100">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full" isLoading={loading}>
                                Sign In
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-slate-400 mt-8">
                    © 2026 Kurup & Associates. All rights reserved.
                </p>
            </div>
        </div>
    );
}
