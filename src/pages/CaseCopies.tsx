import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
    Search, Folder, FileText, Calendar,
    Loader2, Trash2, Eye, X, Plus, CheckSquare, ChevronDown
} from 'lucide-react';

interface CaseCopy {
    id: number;
    case_name: string;
    case_no: string;
    case_year: string;
    doctype: string;
    date: string;
}

export function CaseCopies() {
    const [copies, setCopies] = useState<CaseCopy[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCopy, setSelectedCopy] = useState<CaseCopy | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // Add Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [caseNameOptions, setCaseNameOptions] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        case_name: '',
        case_no: '',
        case_year: new Date().getFullYear().toString(),
        doctype: '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchCopies();
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

    const fetchCopies = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('case_copies')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;
            setCopies(data || []);
        } catch (error) {
            console.error('Error fetching case copies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this record?')) return;

        try {
            const { error } = await supabase.from('case_copies').delete().eq('id', id);
            if (error) throw error;
            setCopies(copies.filter(c => c.id !== id));
        } catch (error) {
            console.error('Error deleting copy:', error);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { data, error } = await supabase
                .from('case_copies')
                .insert([formData])
                .select()
                .single();

            if (error) throw error;

            setCopies([data, ...copies]);
            setIsAddModalOpen(false);
            setFormData({
                case_name: '',
                case_no: '',
                case_year: new Date().getFullYear().toString(),
                doctype: '',
                date: new Date().toISOString().split('T')[0]
            });
        } catch (error) {
            console.error('Error saving copy:', error);
            alert('Failed to save record.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleView = (copy: CaseCopy) => {
        setSelectedCopy(copy);
        setIsViewModalOpen(true);
    };

    const filteredCopies = copies.filter(c =>
        c.case_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.case_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.doctype?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in group">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
                <div className="space-y-0.5">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">Case Copies</h2>
                    <p className="text-slate-500 text-sm">Track and manage document copies and requests.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial sm:w-80">
                        <div className="absolute left-3 top-2.5 pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <Input
                            placeholder="Search copies..."
                            className="pl-9 h-10 bg-white border-slate-200 focus:border-slate-300 rounded-lg text-sm w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/10 h-10 px-4 text-sm whitespace-nowrap"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Entry
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ring-1 ring-slate-900/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/80 border-b border-slate-100 backdrop-blur-sm">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-900 uppercase tracking-wider text-xs">Case Details</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 uppercase tracking-wider text-xs">Case No / Year</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 uppercase tracking-wider text-xs">Document Type</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 uppercase tracking-wider text-xs">Date</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 uppercase tracking-wider text-xs text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-4" />
                                            <p className="text-slate-500 font-medium">Loading copies...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCopies.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-slate-50/50">
                                                <FileText className="h-8 w-8 text-slate-300" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-1">No copies found</h3>
                                            <p className="text-slate-500">No document copy records exist matching your search.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCopies.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group border-transparent hover:border-slate-100">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                                                    <Folder className="h-4 w-4" />
                                                </div>
                                                <span className="font-medium text-slate-900">{c.case_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-slate-900 font-mono text-xs bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded w-fit mb-1">#{c.case_no}</span>
                                                <span className="text-slate-500 text-xs">Year: {c.case_year}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-3.5 w-3.5 text-slate-400" />
                                                <span className="text-slate-700 font-medium">{c.doctype || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-500 text-xs">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {c.date}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleView(c)}
                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(c.id)}
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

            {/* View Details Modal */}
            {isViewModalOpen && selectedCopy && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-up ring-1 ring-slate-900/5">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-900">Copy Details</h3>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="p-2 hover:bg-slate-200/50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center shadow-sm text-blue-600 border border-slate-100">
                                    <Folder className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Case Name</p>
                                    <p className="text-lg font-bold text-slate-900">{selectedCopy.case_name}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Case Number</p>
                                    <p className="text-base font-semibold text-slate-900 bg-slate-50 inline-block px-2 py-1 rounded border border-slate-200 font-mono">#{selectedCopy.case_no}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Case Year</p>
                                    <p className="text-base font-medium text-slate-900">{selectedCopy.case_year}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Document Type</p>
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-slate-400" />
                                        <p className="text-base font-medium text-slate-900">{selectedCopy.doctype}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Date</p>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-slate-400" />
                                        <p className="text-base font-medium text-slate-900">{selectedCopy.date}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 flex justify-end">
                            <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add New Copy Modal */}
            {
                isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up ring-1 ring-slate-900/5">
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
                                <h3 className="text-xl font-bold text-slate-900">New Case Copy</h3>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="p-6 space-y-5">
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
                                            placeholder="e.g. 1234"
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
                                    <label className="text-sm font-medium text-slate-700">Document Type <span className="text-red-500">*</span></label>
                                    <Input
                                        required
                                        placeholder="e.g. Judgment, Vakalathu, Filing..."
                                        value={formData.doctype}
                                        onChange={e => setFormData({ ...formData, doctype: e.target.value })}
                                        className="bg-slate-50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Date <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Input
                                            required
                                            type="date"
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                            className="bg-slate-50 pl-10"
                                        />
                                        <Calendar className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-2">
                                    <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting} className="bg-slate-900">
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckSquare className="mr-2 h-4 w-4" />}
                                        Save Entry
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
