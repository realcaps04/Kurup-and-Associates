import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { useAuth } from '../context/AuthContext';
import { LifeBuoy, Plus, MessageSquare, Clock, CheckCircle, AlertCircle, Loader2, Send } from 'lucide-react';
import { cn } from '../lib/utils';

interface SupportRequest {
    id: number;
    type: string;
    subject: string;
    message: string;
    priority: string;
    status: string;
    created_at: string;
}

export function Support() {
    const { session } = useAuth();
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState<SupportRequest[]>([]);
    const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');

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
        }
    }, [activeTab]);

    const fetchRequests = async () => {
        setLoading(true);
        // Using user_id logic if session exists, else simplify for now
        const query = supabase.from('support_requests').select('*').order('created_at', { ascending: false });
        // Assume RLS filters by user_id automatically if policy is correct

        const { data, error } = await query;
        if (error) console.error('Error fetching requests:', error);
        else setRequests(data || []);

        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.from('support_requests').insert([{
            user_id: session?.user?.id, // Optional depending on auth setup
            // For now, assume clerk_users table logic handles session differently?
            // If using Supabase Auth (session?.user?.id), this works.
            // If using local storage 'clerk_session', we might want to store email.
            user_email: session?.user?.email || JSON.parse(localStorage.getItem('clerk_session') || '{}')?.email,
            ...formData,
            status: 'Open'
        }]);

        if (error) {
            console.error('Error submitting request:', error);
            alert('Failed to submit request. Please try again.');
        } else {
            alert('Request submitted successfully!');
            setFormData({ type: 'Feature Request', priority: 'Medium', subject: '', message: '' });
            setActiveTab('history');
        }
        setLoading(false);
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
                <div className="space-y-1">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <LifeBuoy className="h-8 w-8 text-blue-600" />
                        Support Center
                    </h2>
                    <p className="text-slate-500 text-lg">Need help? Request new features or report issues directly to the admin.</p>
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
            ) : (
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
                        <div className="grid gap-4">
                            {requests.map((req) => (
                                <div key={req.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={cn(
                                                    "px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wider",
                                                    req.type === 'Bug Report' ? "bg-red-50 text-red-700 border-red-200" :
                                                        req.type === 'Feature Request' ? "bg-purple-50 text-purple-700 border-purple-200" :
                                                            "bg-blue-50 text-blue-700 border-blue-200"
                                                )}>
                                                    {req.type}
                                                </span>
                                                <span className={cn(
                                                    "px-2.5 py-0.5 rounded-full text-xs font-medium border",
                                                    req.status === 'Resolved' ? "bg-green-50 text-green-700 border-green-200" :
                                                        req.status === 'In Progress' ? "bg-amber-50 text-amber-700 border-amber-200" :
                                                            "bg-slate-100 text-slate-600 border-slate-200"
                                                )}>
                                                    {req.status}
                                                </span>
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(req.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                {req.subject}
                                            </h3>
                                            <p className="text-slate-600 leading-relaxed text-sm line-clamp-2">
                                                {req.message}
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            {req.priority === 'Critical' || req.priority === 'High' ? (
                                                <AlertCircle className="h-5 w-5 text-red-500" />
                                            ) : (
                                                <CheckCircle className="h-5 w-5 text-slate-300" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
