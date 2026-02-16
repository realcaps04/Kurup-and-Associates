import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { UserPlus, ShieldCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export function SignUp() {
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const navigate = useNavigate();

    // Ensure clean session when visiting signup
    React.useEffect(() => {
        const signOut = async () => {
            await supabase.auth.signOut();
        };
        signOut();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            // 1. Check for existing registration in clerk_users to avoid Auth rate limits
            const { data: existingStatus } = await supabase
                .rpc('get_application_status', { email_input: formData.email });

            if (existingStatus) {
                // setError("This email is already registered. Please check your application status.");
                setShowDuplicateModal(true);
                setLoading(false);
                return;
            }

            // 2. Direct Application Submission (Bypassing Supabase Auth Rate Limits)
            // Auto-generate employee ID (e.g., EMP + current timestamp suffix)
            const autoEmployeeId = `EMP-${Date.now().toString().slice(-6)}`;

            // Generate a temporary ID (will be synced with Auth ID upon approval)
            const tempId = self.crypto.randomUUID();

            const { error: dbError } = await supabase
                .from('clerk_users')
                .insert({
                    id: tempId,
                    email: formData.email,
                    full_name: formData.fullName,
                    employee_id: autoEmployeeId,
                    phone_number: formData.phoneNumber,
                    password: formData.password, // Storing for later Admin syncing
                    role: 'clerk',
                    status: 'application_submitted'
                });

            if (dbError) {
                console.error("Profile creation failed:", dbError);
                throw new Error("Application submission failed. Please try again.");
            }

            // Success - Redirect to submission confirmation
            navigate('/status');
        } catch (err: any) {
            console.error("Signup error:", err);
            // Handle specific Supabase error codes/messages
            if (err?.message?.includes("User already registered") || err?.status === 422) {
                setError("This email is associated with an existing account. Please log in or check your application status.");
            } else if (err?.status === 429) {
                setError("Sign up rate limit exceeded. Please wait a while before trying again, or use a different email address.");
            } else {
                setError(err?.message || "An error occurred during sign up. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-white relative">
            {/* Duplicate Email Modal */}
            {showDuplicateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-slate-100 animate-scale-up">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                                <ShieldCheck className="h-6 w-6 text-blue-600" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-slate-900">Account Already Exists</h3>
                                <p className="text-sm text-slate-500">
                                    The email <span className="font-medium text-slate-900">{formData.email}</span> is already registered.
                                </p>
                            </div>

                            <div className="flex flex-col w-full gap-3 pt-2">
                                <Button
                                    onClick={() => navigate('/status', { state: { email: formData.email } })}
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                                >
                                    Check Application Status
                                </Button>
                                <Button
                                    onClick={() => setShowDuplicateModal(false)}
                                    className="w-full bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Left Side - Visual */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative flex-col justify-between p-12 text-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 z-0"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay z-0"></div>

                <div className="relative z-10 flex items-center space-x-2">
                    <ShieldCheck className="h-8 w-8 text-blue-400" />
                    <span className="text-xl font-bold tracking-wide">SecureData</span>
                </div>

                <div className="relative z-10 space-y-6 max-w-lg">
                    <h2 className="text-4xl font-bold leading-tight tracking-tight">
                        Join the Elite Legal Team
                    </h2>
                    <p className="text-slate-400 text-lg">
                        Create your account to start managing cases, documents, and client records with enterprise-grade security.
                    </p>
                </div>

                <div className="relative z-10 flex items-center space-x-4 text-sm text-slate-500">
                    <div>© 2026 Kurup & Associates</div>
                </div>
            </div>

            {/* Right Side - Sign Up Form */}
            <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-slate-50 overflow-y-auto">
                <div className="w-full max-w-md space-y-8 animate-fade-in py-8">
                    <div className="flex flex-col items-center text-center space-y-2">
                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-2">
                            <UserPlus className="h-8 w-8 text-slate-900" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create an Account</h1>
                        <p className="text-sm text-slate-500">
                            Enter your details to register as a new clerk
                        </p>
                    </div>

                    <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@firm.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input
                                id="phoneNumber"
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
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
                            Create Account
                        </Button>
                    </form>

                    <div className="text-center text-sm">
                        <span className="text-slate-500">Already have an account? </span>
                        <Link to="/login" className="font-medium text-slate-900 hover:underline">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
