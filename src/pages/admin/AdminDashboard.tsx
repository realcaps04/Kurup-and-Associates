import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import {
    Users, FileText, Search, Bell, LogOut, CheckCircle, Loader2, UserPlus, Clock, UserCheck, LifeBuoy, Eye, X, Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ClerkUser } from '../../types/clerk';
import { cn } from '../../lib/utils';
import { useFavicon } from '../../hooks/useFavicon';

interface SupportRequest {
    id: number;
    user_email: string;
    type: string;
    subject: string;
    message: string;
    priority: 'Low' | 'Medium' | 'High' | 'Critical';
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    created_at: string;
    admin_response?: string;
}

export function AdminDashboard() {
    useFavicon('/admin-favicon.svg');
    const [requests, setRequests] = useState<ClerkUser[]>([]);
    const [activeClerks, setActiveClerks] = useState<ClerkUser[]>([]);
    const [supportTickets, setSupportTickets] = useState<SupportRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'requests' | 'active_clerks' | 'support_requests'>('requests');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [selectedTicket, setSelectedTicket] = useState<SupportRequest | null>(null);

    // Reply state
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [replyLoading, setReplyLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const navigate = useNavigate();

    // Reset reply state when ticket opens
    useEffect(() => {
        if (selectedTicket) {
            setIsReplying(false);
            setReplyText(selectedTicket.admin_response || '');
        }
    }, [selectedTicket]);

    // ... existing fetch functions ...

    const handleSendReply = async () => {
        if (!selectedTicket || !replyText.trim()) return;
        setReplyLoading(true);
        try {
            const { error: rpcError } = await supabase.rpc('admin_reply_to_ticket', {
                ticket_id: selectedTicket.id,
                response_text: replyText
            });

            if (rpcError) throw rpcError;

            // Update local state
            const updatedTicket = { ...selectedTicket, admin_response: replyText };
            setSelectedTicket(updatedTicket);
            setSupportTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));

            setIsReplying(false);
            setShowSuccess(true);
        } catch (error) {
            console.error('Error sending reply:', error);
            alert('Failed to send reply.');
        } finally {
            setReplyLoading(false);
        }
    };


    // Fetch Pending Requests
    const fetchRequests = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_pending_requests');
            if (error) throw error;
            setRequests((data as any[]) || []);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const [statusChangeSuccess, setStatusChangeSuccess] = useState(false);

    // Fetch Active Clerks
    const fetchActiveClerks = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_active_clerks');
            if (error) throw error;
            setActiveClerks((data as any[]) || []);
        } catch (error) {
            console.error('Error fetching active clerks:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Support Tickets
    const fetchSupportTickets = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('get_all_support_tickets');
            if (error) throw error;
            setSupportTickets((data as any[]) || []);
        } catch (error) {
            console.error('Error fetching support tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle Approve/Reject Clerk
    const handleAction = async (userId: string, action: 'approve' | 'reject') => {
        setActionLoading(userId);
        try {
            const newStatus = action === 'approve' ? 'approved' : 'inactive';
            const { error } = await supabase.rpc('update_clerk_status', {
                user_id: userId,
                new_status: newStatus
            });
            if (error) throw error;
            setRequests(prev => prev.filter(req => req.id !== userId));
        } catch (error) {
            console.error(`Error ${action}ing user:`, error);
            alert(`Failed to ${action} user.`);
        } finally {
            setActionLoading(null);
        }
    };

    // Handle Update Support Status
    const handleUpdateSupportStatus = async (ticketId: number, newStatus: string) => {
        try {
            const { error } = await supabase.rpc('update_support_status', {
                ticket_id: ticketId,
                new_status: newStatus
            });

            if (error) throw error;

            // Update local state
            setSupportTickets(prev => prev.map(ticket =>
                ticket.id === ticketId ? { ...ticket, status: newStatus as any } : ticket
            ));

            // Close modal and show success
            setSelectedTicket(null);
            setStatusChangeSuccess(true);
            setTimeout(() => setStatusChangeSuccess(false), 3000); // Auto hide after 3s

        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    useEffect(() => {
        const isAdmin = localStorage.getItem('admin_session');
        if (!isAdmin) {
            navigate('/admin/login');
            return;
        }

        if (activeTab === 'requests') fetchRequests();
        else if (activeTab === 'active_clerks') fetchActiveClerks();
        else if (activeTab === 'support_requests') fetchSupportTickets();
    }, [activeTab]);

    const sidebarItems = [
        { id: 'requests', icon: UserPlus, label: 'Clerk Requests' },
        { id: 'active_clerks', icon: UserCheck, label: 'Active Clerks' },
        { id: 'support_requests', icon: LifeBuoy, label: 'Support Requests' },
    ];

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'In Progress': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'Resolved': return 'bg-green-50 text-green-700 border-green-200';
            case 'Closed': return 'bg-slate-50 text-slate-700 border-slate-200';
            default: return 'bg-slate-50 text-slate-700';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center transform transition-all animate-in zoom-in-95 duration-200 scale-100">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Reply Sent!</h3>
                        <p className="text-slate-500 mb-6 leading-relaxed">
                            Your response has been sent to the clerk successfully and the ticket has been updated.
                        </p>
                        <div className="flex justify-center">
                            <Button
                                onClick={() => setShowSuccess(false)}
                                className="bg-slate-900 text-white hover:bg-slate-800 w-full rounded-xl py-3 h-auto"
                            >
                                Continue
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Change Success Modal */}
            {statusChangeSuccess && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-fit min-w-[300px] p-6 text-center transform transition-all animate-in zoom-in-95 duration-200 scale-100">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
                            <CheckCircle className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Status Updated</h3>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-200 fixed h-full z-40 hidden md:flex flex-col shadow-sm">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold text-xl">K</div>
                    <span className="font-bold tracking-tight text-xl text-slate-900">Kurup & Co</span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                activeTab === item.id
                                    ? "bg-blue-50 text-blue-900 shadow-sm ring-1 ring-blue-100"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", activeTab === item.id ? "text-blue-600" : "text-slate-400")} />
                            {item.label}
                            {item.id === 'requests' && requests.length > 0 && (
                                <span className={cn(
                                    "ml-auto text-xs font-bold px-2 py-0.5 rounded-full transition-colors",
                                    activeTab === 'requests' ? "bg-blue-200 text-blue-800" : "bg-red-100 text-red-600"
                                )}>
                                    {requests.length}
                                </span>
                            )}
                            {item.id === 'support_requests' && supportTickets.filter(t => t.status === 'Open').length > 0 && (
                                <span className={cn(
                                    "ml-auto text-xs font-bold px-2 py-0.5 rounded-full transition-colors",
                                    activeTab === 'support_requests' ? "bg-blue-200 text-blue-800" : "bg-red-100 text-red-600"
                                )}>
                                    {supportTickets.filter(t => t.status === 'Open').length}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={() => {
                            localStorage.removeItem('admin_session');
                            navigate('/admin/login');
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-72 p-8 overflow-y-auto h-screen bg-slate-50/50 relative">
                {/* Header */}
                <header className="flex items-center justify-between mb-10">
                    <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm hover:shadow transition-shadow"
                        />
                    </div>
                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-slate-900">Administrator</p>
                                <p className="text-xs text-slate-500">Super Admin</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-medium shadow-md shadow-slate-900/20">
                                A
                            </div>
                        </div>
                    </div>
                </header>

                {/* Account Requests Tab */}
                {activeTab === 'requests' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Clerk Requests</h1>
                                <p className="text-slate-500 mt-1">Manage pending account approvals for new clerks.</p>
                            </div>
                            <Button onClick={fetchRequests} variant="outline" className="gap-2">
                                <Clock className="h-4 w-4" />
                                Refresh List
                            </Button>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            {requests.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="mx-auto h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle className="h-8 w-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900">No Pending Requests</h3>
                                    <p className="text-slate-500 mt-1">All caught up! There are no pending clerk approvals.</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Name</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Email</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Date</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {requests.map((req) => (
                                            <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-900">{req.full_name || 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">{req.email}</td>
                                                <td className="px-6 py-4 text-slate-500 text-sm">
                                                    {new Date(req.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleAction(req.id, 'approve')}
                                                            disabled={actionLoading === req.id}
                                                            className="bg-green-600 hover:bg-green-700 text-white shadow-sm shadow-green-600/20"
                                                        >
                                                            {actionLoading === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve'}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleAction(req.id, 'reject')}
                                                            disabled={actionLoading === req.id}
                                                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* Active Clerks Tab */}
                {activeTab === 'active_clerks' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Active Clerks</h1>
                                <p className="text-slate-500 mt-1">View and manage the firm's active clerical staff.</p>
                            </div>
                            <Button onClick={fetchActiveClerks} variant="outline" className="gap-2">
                                <Clock className="h-4 w-4" />
                                Refresh List
                            </Button>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            {activeClerks.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="mx-auto h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <Users className="h-8 w-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900">No Active Clerks Found</h3>
                                    <p className="text-slate-500 mt-1">There are no approved clerk accounts yet.</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Name</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Employee ID</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Department</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {activeClerks.map((clerk) => (
                                            <tr key={clerk.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                            {clerk.full_name?.charAt(0) || 'C'}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-slate-900">{clerk.full_name || 'N/A'}</div>
                                                            <div className="text-xs text-slate-500">{clerk.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 text-sm font-mono">{clerk.employee_id || '-'}</td>
                                                <td className="px-6 py-4 text-slate-600 text-sm">{clerk.department || 'General'}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Active
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* Support Requests Tab */}
                {activeTab === 'support_requests' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Support Requests</h1>
                                <p className="text-slate-500 mt-1">Review and manage support tickets.</p>
                            </div>
                            <Button onClick={fetchSupportTickets} variant="outline" className="gap-2">
                                <Clock className="h-4 w-4" />
                                Refresh List
                            </Button>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            {supportTickets.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="mx-auto h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <LifeBuoy className="h-8 w-8 text-slate-300" />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900">No Support Requests</h3>
                                    <p className="text-slate-500 mt-1">There are no open support tickets at the moment.</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Subject & Message</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Priority</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Status</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">Date</th>
                                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {supportTickets.map((ticket) => (
                                            <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-slate-900 mb-1">{ticket.subject}</span>
                                                        <span className="text-sm text-slate-500 line-clamp-1 max-w-xs">{ticket.message}</span>
                                                        <span className="text-xs text-slate-400 mt-1 block">From: {ticket.user_email || 'Anonymous'} · {ticket.type}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", getPriorityColor(ticket.priority))}>
                                                        {ticket.priority}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusColor(ticket.status))}>
                                                        {ticket.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500">
                                                    {new Date(ticket.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setSelectedTicket(ticket)}
                                                        className="text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Ticket Detail Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-900">Support Request Details</h3>
                            <button
                                onClick={() => setSelectedTicket(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Status</label>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={selectedTicket.status}
                                            onChange={(e) => handleUpdateSupportStatus(selectedTicket.id, e.target.value)}
                                            className="block w-full rounded-md border-slate-300 py-1.5 text-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="Open">Open</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Resolved">Resolved</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Priority</label>
                                    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", getPriorityColor(selectedTicket.priority))}>
                                        {selectedTicket.priority}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Subject</label>
                                    <p className="text-slate-900 font-medium">{selectedTicket.subject}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Message Content</label>
                                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{selectedTicket.message}</p>
                                </div>

                                {/* Admin Reply Section */}
                                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs font-semibold text-blue-800 uppercase tracking-wider block">Admin Response</label>
                                        {!isReplying && !selectedTicket.admin_response && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => { setIsReplying(true); setReplyText(''); }}
                                                className="h-6 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                                            >
                                                Reply
                                            </Button>
                                        )}
                                        {!isReplying && selectedTicket.admin_response && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => { setIsReplying(true); setReplyText(selectedTicket.admin_response || ''); }}
                                                className="h-6 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                                            >
                                                Edit
                                            </Button>
                                        )}
                                    </div>

                                    {isReplying ? (
                                        <div className="space-y-3">
                                            <textarea
                                                className="w-full rounded-lg border-blue-200 bg-white p-3 text-sm focus:border-blue-400 focus:ring-blue-400 min-h-[100px]"
                                                placeholder="Type your reply to the clerk..."
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                            />
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setIsReplying(false)}
                                                    className="text-slate-500 hover:text-slate-700"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={handleSendReply}
                                                    disabled={replyLoading}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                                >
                                                    {replyLoading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Send className="h-3 w-3 mr-2" />}
                                                    Send Reply
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                                            {selectedTicket.admin_response || <span className="text-slate-400 italic">No response sent yet.</span>}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 text-sm text-slate-500 pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        <span>{selectedTicket.user_email || 'Anonymous User'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span>Submitted on {new Date(selectedTicket.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                                    Close
                                </Button>
                                <Button
                                    onClick={() => handleUpdateSupportStatus(selectedTicket.id, selectedTicket.status)}
                                    className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/10"
                                >
                                    Confirm
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
