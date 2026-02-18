import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { useAuth } from '../context/AuthContext';
import { LifeBuoy, Plus, MessageSquare, Clock, CheckCircle, AlertCircle, Loader2, Send, Trash2, Eye, X, UserCheck, Rocket } from 'lucide-react';
import { cn } from '../lib/utils';

interface SupportRequest {
    id: number;
    type: string;
    subject: string;
    message: string;
    priority: string;
    status: string;
    created_at: string;
    user_email?: string;
    admin_response?: string;
}

interface Release {
    id: number;
    version: string;
    title: string;
    description: string;
    features: string[];
    created_at: string;
}

export function Support() {
    const { session } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [requests, setRequests] = useState<SupportRequest[]>([]);
    const [releases, setReleases] = useState<Release[]>([]);
    const [activeTab, setActiveTab] = useState<'new' | 'history' | 'releases'>('new');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
    const [clerkMap, setClerkMap] = useState<Record<string, string>>({});

    // Form State
    const [formData, setFormData] = useState({
        type: 'Feature Request',
        priority: 'Medium',
        subject: '',
        message: ''
    });

    useEffect(() => {
        if (activeTab === 'history') {
            fetchRequests();
        } else if (activeTab === 'releases') {
            fetchReleases();
        }
    }, [activeTab]);

    const fetchRequests = async () => {
        if (!session?.user?.email) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('support_requests')
                .select('*')
                .eq('user_email', session.user.email)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests(data || []);
        } catch (err) {
            console.error('Unexpected error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchReleases = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('releases')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReleases(data || []);
        } catch (error) {
            console.error('Error fetching releases:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.from('support_requests').insert([{
                user_id: session?.user?.id, // May be null for manual Clerk login
                user_email: session?.user?.email || JSON.parse(localStorage.getItem('clerk_session') || '{}')?.email,
                ...formData,
                status: 'Open'
            }]);

            if (error) {
                console.error('Error submitting request:', error);
                alert('Failed to submit request. Please ensure you are logged in or try again.');
            } else {
                setShowSuccess(true);
                setFormData({ type: 'Feature Request', priority: 'Medium', subject: '', message: '' });
            }
        } catch (err) {
            console.error('Unexpected error submitting request:', err);
            alert('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: number) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            const { error } = await supabase
                .from('support_requests')
                .delete()
                .eq('id', deleteId);

            if (error) {
                console.error('Error deleting request:', error);
                alert('Failed to delete request.');
            } else {
                setRequests(requests.filter(req => req.id !== deleteId));
                setDeleteId(null);
            }
        } catch (err) {
            console.error('Unexpected error deleting request:', err);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto relative">
            {/* View Details Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-900">Request Details</h3>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Status</label>
                                    <span className={cn(
                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                        selectedRequest.status === 'Resolved' ? "bg-green-50 text-green-700 border-green-200" :
                                            selectedRequest.status === 'In Progress' ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                "bg-slate-100 text-slate-600 border-slate-200"
                                    )}>
                                        {selectedRequest.status}
                                    </span>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Priority</label>
                                    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                        selectedRequest.priority === 'Critical' || selectedRequest.priority === 'High' ? "bg-red-50 text-red-700 border-red-200" : "bg-blue-50 text-blue-700 border-blue-200"
                                    )}>
                                        {selectedRequest.priority}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Subject</label>
                                    <p className="text-slate-900 font-medium">{selectedRequest.subject}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Message Content</label>
                                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{selectedRequest.message}</p>
                                </div>

                                {/* Admin Response Section */}
                                {selectedRequest.admin_response && (
                                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <UserCheck className="h-3 w-3" />
                                            </div>
                                            <label className="text-xs font-bold text-blue-900 uppercase tracking-wider block">Admin Response</label>
                                        </div>
                                        <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap pl-8">
                                            {selectedRequest.admin_response}
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center gap-4 text-sm text-slate-500 pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span>Submitted on {new Date(selectedRequest.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center transform transition-all animate-in zoom-in-95 duration-200 scale-100">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
                            <CheckCircle className="h-10 w-10 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Request Submitted!</h3>
                        <p className="text-slate-500 mb-6 leading-relaxed">
                            Thank you for your feedback. We've received your request and will review it shortly.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button
                                onClick={() => {
                                    setShowSuccess(false);
                                    setActiveTab('history');
                                }}
                                className="bg-slate-900 text-white hover:bg-slate-800 w-full rounded-xl py-3 h-auto"
                            >
                                View History
                            </Button>
                            <Button
                                onClick={() => setShowSuccess(false)}
                                variant="outline"
                                className="w-full rounded-xl py-3 h-auto border-slate-200 hover:bg-slate-50 text-slate-700"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center transform transition-all animate-in zoom-in-95 duration-200 scale-100">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
                            <Trash2 className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Request?</h3>
                        <p className="text-slate-500 mb-6 leading-relaxed">
                            Are you sure you want to delete this request? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button
                                onClick={confirmDelete}
                                className="bg-red-600 text-white hover:bg-red-700 w-full rounded-xl py-3 h-auto shadow-lg shadow-red-600/20"
                            >
                                Delete
                            </Button>
                            <Button
                                onClick={() => setDeleteId(null)}
                                variant="outline"
                                className="w-full rounded-xl py-3 h-auto border-slate-200 hover:bg-slate-50 text-slate-700"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <LifeBuoy className="h-6 w-6 text-blue-600" />
                        Support Center
                    </h2>
                    <p className="text-slate-500 text-sm">Need help? Request new features or report issues directly to the admin.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 rounded-xl bg-slate-100 p-1 w-fit">
                <button
                    onClick={() => setActiveTab('new')}
                    className={cn(
                        "flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all",
                        activeTab === 'new'
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                    )}
                >
                    <Plus className="h-4 w-4" />
                    New Request
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={cn(
                        "flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all",
                        activeTab === 'history'
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                    )}
                >
                    <Clock className="h-4 w-4" />
                    Request History
                </button>
                <button
                    onClick={() => setActiveTab('releases')}
                    className={cn(
                        "flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all",
                        activeTab === 'releases'
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                    )}
                >
                    <Rocket className="h-4 w-4" />
                    Latest Releases
                </button>
            </div>

            {activeTab === 'new' ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 ring-1 ring-slate-900/5 transition-all">
                    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-slate-700">Request Type</Label>
                                <select
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option>Feature Request</option>
                                    <option>Bug Report</option>
                                    <option>General Inquiry</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700">Priority</Label>
                                <select
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                                    value={formData.priority}
                                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    <option>Low</option>
                                    <option>Medium</option>
                                    <option>High</option>
                                    <option>Critical</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-700">Subject</Label>
                            <Input
                                required
                                placeholder="Brief summary of your request..."
                                className="bg-slate-50 border-slate-200 focus:bg-white h-12"
                                value={formData.subject}
                                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-700">Message / Details</Label>
                            <textarea
                                required
                                rows={6}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all resize-none"
                                placeholder="Describe the feature or issue in detail..."
                                value={formData.message}
                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                            />
                        </div>

                        <div className="pt-4 flex items-center justify-end">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 h-12 px-8 rounded-xl transition-transform hover:scale-[1.02]"
                            >
                                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                                Submit Request
                            </Button>
                        </div>
                    </form>
                </div>
            ) : activeTab === 'history' ? (
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400 mb-2" />
                            <p className="text-slate-500">Loading your requests...</p>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
                            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">No requests found</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mt-1 mb-6">You haven't submitted any support requests yet.</p>
                            <Button variant="outline" onClick={() => setActiveTab('new')}>
                                Create New Request
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Subject</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Requester</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Priority</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {requests.map((req) => (
                                        <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={cn(
                                                    "px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wider",
                                                    req.type === 'Bug Report' ? "bg-red-50 text-red-700 border-red-200" :
                                                        req.type === 'Feature Request' ? "bg-purple-50 text-purple-700 border-purple-200" :
                                                            "bg-blue-50 text-blue-700 border-blue-200"
                                                )}>
                                                    {req.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-slate-900">{req.subject}</div>
                                                <div className="text-sm text-slate-500 line-clamp-1">{req.message}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-slate-900 font-medium">
                                                    {(req.user_email && clerkMap[req.user_email]) || req.user_email?.split('@')[0] || 'Unknown Clerk'}
                                                </div>
                                                <div className="text-xs text-slate-500">{req.user_email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={cn(
                                                    "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                                    req.status === 'Resolved' ? "bg-green-50 text-green-700 border-green-200" :
                                                        req.status === 'In Progress' ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                            "bg-slate-100 text-slate-600 border-slate-200"
                                                )}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {req.priority === 'Critical' || req.priority === 'High' ? (
                                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                                    ) : (
                                                        <CheckCircle className="h-4 w-4 text-slate-300" />
                                                    )}
                                                    <span className="text-sm text-slate-700">{req.priority}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {new Date(req.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setSelectedRequest(req)}
                                                        className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(req.id)}
                                                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in">
                    {releases.length > 0 ? (
                        releases.map((release) => (
                            <div key={release.id} className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm relative overflow-hidden mb-6">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <Rocket className="h-32 w-32 text-blue-600" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">{release.version}</span>
                                        <span className="text-slate-400 text-sm">{new Date(release.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{release.title}</h3>
                                    <p className="text-slate-600 mb-6 leading-relaxed max-w-2xl">
                                        {release.description}
                                    </p>

                                    {release.features && release.features.length > 0 && (
                                        <div className="space-y-4">
                                            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                                                <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                                                What's New
                                            </h4>
                                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {release.features.map((feature, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-white rounded-2xl border border-slate-200 border-dashed">
                            <Rocket className="h-12 w-12 text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900">No release notes</h3>
                            <p className="text-sm max-w-sm text-center">There are no new release updates to display at this time.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
