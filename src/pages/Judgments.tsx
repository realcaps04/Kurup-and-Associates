import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Search, Scale, Plus, X, Calendar, FileText, Trash2, Eye, ChevronDown, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

interface Judgment {
    id: number;
    case_name: string;
    case_no: string;
    case_year: string;
    judge_name: string | null;
    judgment_date: string | null;
    description: string | null;
    file_url: string | null;
    created_at: string;
}

export function Judgments() {
    const [judgments, setJudgments] = useState<Judgment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedJudgment, setSelectedJudgment] = useState<Judgment | null>(null);
    const [caseNameOptions, setCaseNameOptions] = useState<string[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        case_name: '',
        case_no: '',
        case_year: new Date().getFullYear().toString(),
        judge_name: '',
        judgment_date: new Date().toISOString().split('T')[0],
        description: ''
    });

    useEffect(() => {
        fetchJudgments();
        fetchCaseNames();
    }, []);

    const fetchCaseNames = async () => {
        try {
            const { data, error } = await supabase
                .from('case_names')
                .select('name')
                .order('name', { ascending: true });

            if (data) {
                setCaseNameOptions(data.map(item => item.name));
            }
        } catch (error) {
            console.error('Error fetching case names:', error);
        }
    };

    const fetchJudgments = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('judgments')
                .select('*')
                .order('judgment_date', { ascending: false });

            if (error) throw error;
            setJudgments(data || []);
        } catch (error) {
            console.error('Error fetching judgments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddJudgment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('judgments')
                .insert([formData]);

            if (error) throw error;

            setShowAddModal(false);
            setFormData({
                case_name: '',
                case_no: '',
                case_year: new Date().getFullYear().toString(),
                judge_name: '',
                judgment_date: new Date().toISOString().split('T')[0],
                description: ''
            });
            fetchJudgments();
        } catch (error) {
            console.error('Error adding judgment:', error);
            alert('Failed to add judgment record');
        }
    };

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // ... (rest of the code)

    const handleDeleteClick = (id: number) => {
        setDeleteId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            const { error } = await supabase.from('judgments').delete().eq('id', deleteId);
            if (error) throw error;
            setJudgments(judgments.filter(j => j.id !== deleteId));
            setShowDeleteConfirm(false);
            setDeleteId(null);
        } catch (error) {
            console.error('Error deleting judgment:', error);
        }
    };

    const filteredJudgments = judgments.filter(j =>
        j.case_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.case_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (j.judge_name && j.judge_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-fade-in group">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Judgments</h2>
                    <p className="text-sm text-slate-500 mt-1">Repository of case judgments and orders.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial sm:w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                        <Input
                            placeholder="Search judgments..."
                            className="pl-9 h-10 bg-white border-slate-200 focus:border-slate-300 rounded-lg text-sm w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/10 h-10 px-4 text-sm whitespace-nowrap"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Entry
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ring-1 ring-slate-900/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/80 border-b border-slate-100 backdrop-blur-sm">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-900 uppercase tracking-wider text-xs">Case Details</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 uppercase tracking-wider text-xs">Judge</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 uppercase tracking-wider text-xs">Judgment Date</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 uppercase tracking-wider text-xs">Description</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 uppercase tracking-wider text-xs text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-4" />
                                            <p className="text-slate-500 font-medium">Loading judgments...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredJudgments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-slate-50/50">
                                                <Scale className="h-8 w-8 text-slate-300" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-1">No judgments found</h3>
                                            <p className="text-slate-500">There are no judgment records matching your search criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredJudgments.map((judgment) => (
                                    <tr key={judgment.id} className="hover:bg-slate-50/80 transition-colors group border-transparent hover:border-slate-100">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-slate-900">{judgment.case_name}</div>
                                                <div className="text-xs text-slate-500 mt-1">
                                                    #{judgment.case_no} / {judgment.case_year}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-slate-700 font-medium">{judgment.judge_name || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {judgment.judgment_date ? new Date(judgment.judgment_date).toLocaleDateString() : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-xs truncate text-slate-600" title={judgment.description || ''}>
                                                {judgment.description || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => { setSelectedJudgment(judgment); setShowViewModal(true); }}
                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(judgment.id)}
                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Judgment Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up ring-1 ring-slate-900/5">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
                            <h3 className="text-xl font-bold text-slate-900">Add New Judgment</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddJudgment} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Case Name <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select
                                        required
                                        className="w-full h-10 appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:bg-white transition-all cursor-pointer"
                                        value={formData.case_name}
                                        onChange={e => setFormData({ ...formData, case_name: e.target.value })}
                                    >
                                        <option value="">Select Case Type</option>
                                        {caseNameOptions.map(name => (
                                            <option key={name} value={name}>{name}</option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Case Number <span className="text-red-500">*</span></label>
                                    <Input
                                        required
                                        placeholder="e.g. 12345"
                                        value={formData.case_no}
                                        onChange={e => setFormData({ ...formData, case_no: e.target.value })}
                                        className="bg-slate-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Year <span className="text-red-500">*</span></label>
                                    <Input
                                        required
                                        type="number"
                                        placeholder="YYYY"
                                        value={formData.case_year}
                                        onChange={e => setFormData({ ...formData, case_year: e.target.value })}
                                        className="bg-slate-50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Presiding Judge</label>
                                <Input
                                    placeholder="Hon. Justice Name"
                                    value={formData.judge_name}
                                    onChange={e => setFormData({ ...formData, judge_name: e.target.value })}
                                    className="bg-slate-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Judgment Date <span className="text-red-500">*</span></label>
                                <div className="relative group">
                                    <Input
                                        required
                                        type="date"
                                        value={formData.judgment_date}
                                        onChange={e => setFormData({ ...formData, judgment_date: e.target.value })}
                                        className="bg-slate-50 pl-10 hover:bg-white focus:bg-white transition-colors cursor-pointer"
                                    />
                                    <Calendar className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-hover:text-blue-600 transition-colors" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Memo / Description</label>
                                <textarea
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:bg-white transition-all min-h-[100px]"
                                    placeholder="Brief description or excerpt of the judgment..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-2">
                                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800">
                                    Save Judgment
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {showViewModal && selectedJudgment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up ring-1 ring-slate-900/5">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-900">Judgment Details</h3>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="p-2 hover:bg-slate-200/50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center shadow-sm text-purple-600 border border-slate-100">
                                    <Scale className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Case Name</p>
                                    <p className="text-lg font-bold text-slate-900">{selectedJudgment.case_name}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Case No</p>
                                        <p className="font-semibold text-slate-900">#{selectedJudgment.case_no}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Year</p>
                                        <p className="font-semibold text-slate-900">{selectedJudgment.case_year}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Presiding Judge</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-base font-medium text-slate-900">{selectedJudgment.judge_name || 'Not Specified'}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Judgment Date</p>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-slate-400" />
                                        <p className="text-base font-medium text-slate-900">
                                            {selectedJudgment.judgment_date ? new Date(selectedJudgment.judgment_date).toLocaleDateString(undefined, {
                                                year: 'numeric', month: 'long', day: 'numeric'
                                            }) : '-'}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Description / Memo</p>
                                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                        {selectedJudgment.description || 'No description provided.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 flex justify-end">
                            <Button onClick={() => setShowViewModal(false)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center transform transition-all animate-scale-up ring-1 ring-slate-900/5">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6 ring-8 ring-red-50">
                            <Trash2 className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Record?</h3>
                        <p className="text-slate-500 mb-6 leading-relaxed">
                            Are you sure you want to delete this judgment record? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={confirmDelete}
                                className="bg-red-600 hover:bg-red-700 text-white flex-1 shadow-lg shadow-red-600/20"
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
