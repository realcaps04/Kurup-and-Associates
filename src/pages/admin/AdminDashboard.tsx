import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { CheckCircle, XCircle, Users, LayoutDashboard, LogOut, Loader2, Search, Filter, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ClerkUser } from '../../types/clerk';
import { cn } from '../../lib/utils';

export function AdminDashboard() {
    const [requests, setRequests] = useState<ClerkUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchRequests = async () => {
        setLoading(true);
        try {
            // Use RPC to fetch pending requests (bypassing RLS issues)
            const { data, error } = await supabase
                .rpc('get_pending_requests');

            if (error) throw error;
            // RPC returns standard array, map to state
            setRequests((data as any[]) || []);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Check local admin session
        const isAdmin = localStorage.getItem('admin_session');
        if (!isAdmin) {
            navigate('/admin/login');
            return;
        }

        fetchRequests();
    }, []);

    const handleAction = async (userId: string, action: 'approve' | 'reject') => {
        setActionLoading(userId);
        try {
            const newStatus = action === 'approve' ? 'approved' : 'rejected'; // Or 'inactive'

            // If rejecting, maybe set to inactive or deleted? Let's use 'inactive' for rejected but kept record
            const statusToSet = action === 'approve' ? 'approved' : 'inactive';

            // Use RPC to update status securely
            const { error } = await supabase
                .rpc('update_clerk_status', {
                    user_id: userId,
                    new_status: statusToSet
                });

            if (error) throw error;

            // Optimistic update
            setRequests(prev => prev.filter(req => req.id !== userId));

        } catch (error) {
            console.error(`Error ${action}ing user:`, error);
            alert(`Failed to ${action} user. Check console for details.`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleLogout = async () => {
        // Clear local session
        localStorage.removeItem('admin_session');
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Admin Header */}
            <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <LayoutDashboard className="h-5 w-5 text-red-500" />
                        </div>
                        <h1 className="font-bold text-white tracking-tight">Admin Console</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            className="text-slate-400 hover:text-white hover:bg-slate-800"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Account Requests</h2>
                        <p className="text-slate-500 mt-1">Manage pending registration applications from clerks.</p>
                    </div>
                    <Button onClick={fetchRequests} variant="outline" className="self-start">
                        <RefreshCcw className={cn("h-4 w-4 mr-2", loading ? "animate-spin" : "")} />
                        Refresh List
                    </Button>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 text-slate-400 animate-spin mb-4" />
                        <p className="text-slate-500">Loading requests...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                        <div className="mx-auto h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Users className="h-6 w-6 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No Pending Requests</h3>
                        <p className="text-slate-500 mt-1">All caught up! There are no new account applications to review.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {requests.map((req) => (
                            <div key={req.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md animate-fade-in">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-slate-900 text-lg">{req.full_name}</h3>
                                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium border border-amber-200">
                                            {req.status?.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-sm text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-700">Email:</span> {req.email}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-700">Phone:</span> {req.phone_number || 'N/A'}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-700">Expected Employee ID:</span>
                                            <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-xs">{req.employee_id}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-slate-700">Submitted:</span> {new Date(req.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    <Button
                                        onClick={() => handleAction(req.id, 'reject')}
                                        disabled={actionLoading === req.id}
                                        className="bg-white border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shadow-sm"
                                    >
                                        {actionLoading === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                                        Reject
                                    </Button>
                                    <Button
                                        onClick={() => handleAction(req.id, 'approve')}
                                        disabled={actionLoading === req.id}
                                        className="bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10"
                                    >
                                        {actionLoading === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                        Approve Access
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
