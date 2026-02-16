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
    const navigate = useNavigate();

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
            // 1. Sign up with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                    }
                }
            });

            if (authError) throw authError;

            if (authData.user) {
                // 2. Create Clerk User Profile
                // Auto-generate employee ID (e.g., EMP + current timestamp suffix)
                const autoEmployeeId = `EMP-${Date.now().toString().slice(-6)}`;

                const { error: dbError } = await supabase
                    .from('clerk_users')
                    .insert({
                        id: authData.user.id,
                        email: formData.email,
                        full_name: formData.fullName,
                        employee_id: autoEmployeeId,
                        phone_number: formData.phoneNumber,
                        password: formData.password,
                        role: 'clerk',
                        status: 'application_submitted'
                    });

                if (dbError) {
                    console.error("Profile creation failed:", dbError);
                    throw new Error("Account created but profile setup failed. Please contact admin.");
                }

                // Success - Redirect to submission confirmation (or login with message)
                // alert("Application Submitted! Your account is pending approval.");
                navigate('/status');
            }
        } catch (err: any) {
            setError(err.message || "An error occurred during sign up");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-white">
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
