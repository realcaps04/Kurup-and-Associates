import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Loader2, CheckCircle, Clock, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function ApplicationStatus() {
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    // Auto-fill and check if email is passed via state
    React.useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
            // Optional: Auto-trigger check
            checkStatus(null, location.state.email);
        }
    }, [location.state]);

    const checkStatus = async (e: React.FormEvent | null, specificEmail?: string) => {
        if (e) e.preventDefault();

        const emailToCheck = specificEmail || email;
        if (!emailToCheck) return;

        setLoading(true);
        setStatus(null);
        setSearched(false);

        try {
            // Call the secure RPC function
            const { data, error } = await supabase
                .rpc('get_application_status', { email_input: emailToCheck });

            if (error) throw error;

            setStatus(data);
        } catch (err) {
            console.error('Error checking status:', err);
            // Treat error as "not found" or handles generic error
            setStatus(null);
        } finally {
            setLoading(false);
            setSearched(true);
        }
    };

    const getStatusDisplay = () => {
        if (!status) {
            return (
                <div className="text-center space-y-3 p-6 bg-slate-50 rounded-xl border border-slate-100">
                    <XCircle className="h-10 w-10 text-slate-400 mx-auto" />
                    <div>
                        <h3 className="font-medium text-slate-900">Application Not Found</h3>
                        <p className="text-sm text-slate-500 mt-1">We couldn't find an application associated with this email address.</p>
                    </div>
                    <Link to="/signup" className="text-sm font-medium text-blue-600 hover:underline">
                        Start a new application
                    </Link>
                </div>
            );
        }

        switch (status) {
            case 'application_submitted':
                return (
                    <div className="text-center space-y-4 p-8 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Clock className="h-8 w-8 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-amber-900">Application Under Review</h3>
                            <p className="text-amber-700 mt-2">
                                Your application has been received and is currently being reviewed by our administrative team.
                                You will receive an update once the process is complete.
                            </p>
                        </div>
                    </div>
                );
            case 'active':
            case 'approved':
                return (
                    <div className="text-center space-y-4 p-8 bg-green-50 rounded-xl border border-green-100">
                        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-green-900">Application Approved</h3>
                            <p className="text-green-700 mt-2">
                                Congratulations! Your account has been approved and is ready for use.
                            </p>
                        </div>
                        <Link to="/login">
                            <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white">
                                Proceed to Login
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                );
            case 'suspended':
            case 'inactive':
                return (
                    <div className="text-center space-y-4 p-8 bg-red-50 rounded-xl border border-red-100">
                        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-red-900">Account Inactive</h3>
                            <p className="text-red-700 mt-2">
                                Your account is currently inactive or suspended. Please contact the administrator for assistance.
                            </p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-white">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative flex-col justify-between p-12 text-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 z-0"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay z-0"></div>

                <div className="relative z-10 flex items-center space-x-2">
                    <ShieldCheck className="h-8 w-8 text-blue-400" />
                    <span className="text-xl font-bold tracking-wide">SecureData</span>
                </div>

                <div className="relative z-10">
                    <h2 className="text-4xl font-bold leading-tight tracking-tight mb-6">
                        Track Your Application
                    </h2>
                    <p className="text-slate-400 text-lg max-w-md">
                        Stay updated on your registration status. We process applications promptly to get you onboarded as quickly as possible.
                    </p>
                </div>

                <div className="relative z-10 flex items-center space-x-4 text-sm text-slate-500">
                    <div>© 2026 Kurup & Associates</div>
                </div>
            </div>

            {/* Right Side - Checker Form */}
            <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-md space-y-8 animate-fade-in py-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Application Status</h1>
                        <p className="text-sm text-slate-500">
                            Enter your registered email address to check your status
                        </p>
                    </div>

                    <form onSubmit={checkStatus} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@firm.com"
                                className="bg-white"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white h-11"
                            isLoading={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Checking...
                                </>
                            ) : 'Check Status'}
                        </Button>
                    </form>

                    {searched && (
                        <div className="animate-slide-up">
                            {getStatusDisplay()}
                        </div>
                    )}

                    <div className="text-center pt-8">
                        <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
