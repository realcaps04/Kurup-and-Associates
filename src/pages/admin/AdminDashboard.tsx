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

    const [activeTab, setActiveTab] = useState<'requests' | 'users' | 'settings'>('requests');

    // ... (fetchRequests logic stays same)

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white fixed h-full z-40 hidden md:flex flex-col border-r border-slate-800">
                <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                        <LayoutDashboard className="h-5 w-5 text-red-500" />
                    </div>
                    <span className="font-bold tracking-tight text-lg">Admin Console</span>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                            activeTab === 'requests' ? "bg-red-600 text-white shadow-lg shadow-red-900/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        )}
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Account Requests
                        {requests.length > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{requests.length}</span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                            activeTab === 'users' ? "bg-red-600 text-white shadow-lg shadow-red-900/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        )}
                    >
                        <Users className="h-4 w-4" />
                        Active Employees
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                            activeTab === 'settings' ? "bg-red-600 text-white shadow-lg shadow-red-900/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        )}
                    >
                        <Filter className="h-4 w-4" />
                        Settings
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 min-h-screen">
                {/* Mobile Header */}
                <header className="bg-white border-b border-slate-200 sticky top-0 z-30 md:hidden px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-red-500/10 rounded-lg">
                            <LayoutDashboard className="h-4 w-4 text-red-500" />
                        </div>
                        <span className="font-bold text-slate-900">Admin Console</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                    </Button>
                </header>

                <div className="p-4 sm:p-8 max-w-6xl mx-auto">
                    {activeTab === 'requests' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">Account Requests</h1>
                                    <p className="text-slate-500 mt-1">Manage pending registration applications from clerks.</p>
                                </div>
                                <Button onClick={fetchRequests} variant="outline" className="self-start bg-white">
                                    <RefreshCcw className={cn("h-4 w-4 mr-2", loading ? "animate-spin" : "")} />
                                    Refresh List
                                </Button>
                            </div>

                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
                                    <Loader2 className="h-8 w-8 text-slate-400 animate-spin mb-4" />
                                    <p className="text-slate-500">Loading requests...</p>
                                </div>
                            ) : requests.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                                    <div className="mx-auto h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle className="h-6 w-6 text-slate-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900">All Clear</h3>
                                    <p className="text-slate-500 mt-1">There are no pending account requests at the moment.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {requests.map((req) => (
                                        <div key={req.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-slate-900 text-lg">{req.full_name}</h3>
                                                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200 uppercase tracking-wide">
                                                        {(req.status || 'pending').replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-sm text-slate-500 mt-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-slate-700 min-w-[60px]">Email:</span>
                                                        <span className="truncate">{req.email}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-slate-700 min-w-[60px]">Phone:</span>
                                                        <span>{req.phone_number || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-slate-700 min-w-[60px]">ID:</span>
                                                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs text-slate-600 border border-slate-200">{req.employee_id}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-slate-700 min-w-[60px]">Date:</span>
                                                        <span>{new Date(req.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 w-full md:w-auto mt-4 md:mt-0">
                                                <Button
                                                    onClick={() => handleAction(req.id, 'reject')}
                                                    disabled={actionLoading === req.id}
                                                    variant="outline"
                                                    className="flex-1 md:flex-none border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200"
                                                >
                                                    {actionLoading === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                                                    Reject
                                                </Button>
                                                <Button
                                                    onClick={() => handleAction(req.id, 'approve')}
                                                    disabled={actionLoading === req.id}
                                                    className="flex-1 md:flex-none bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10"
                                                >
                                                    {actionLoading === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                                    Approve Access
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 animate-fade-in">
                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <Users className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Active Employees</h3>
                            <p className="text-slate-500 mt-2 max-w-md text-center">This module is under development. Soon you will be able to manage all active clerk accounts here.</p>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 animate-fade-in">
                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <Filter className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">System Settings</h3>
                            <p className="text-slate-500 mt-2 max-w-md text-center">Global configuration options will be available here.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
