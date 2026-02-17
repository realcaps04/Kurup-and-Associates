import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { cn } from '../lib/utils';
import {
    Plus, Search, FolderOpen, Edit2, Trash2,
    X, Loader2, CheckSquare, Eye, Filter, ChevronDown, ChevronUp, Check, Calendar
} from 'lucide-react';

interface Case {
    id: number;
    case_name: string;
    case_no: number;
    case_year: number;
    name: string;
    society: string;
    lawyer: string;
    represents: string;
    status: string;
    created_at?: string;
}

export function CaseRecords() {
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [caseNameOptions, setCaseNameOptions] = useState<string[]>([]);
    const [isCaseNameDropdownOpen, setIsCaseNameDropdownOpen] = useState(false);

    // Filter State
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        caseName: '',
        caseNo: '',
        caseYear: '',
        date: '',
        status: 'Active'
    });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCase, setEditingCase] = useState<Case | null>(null);
    const [modalLoading, setModalLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<Case>>({
        case_name: '', case_no: undefined, case_year: new Date().getFullYear(),
        name: '', society: '', lawyer: '', represents: '', status: 'Open'
    });

    useEffect(() => {
        fetchCases();
        fetchCaseNames();
    }, []);

    const fetchCaseNames = async () => {
        try {
            const { data, error } = await supabase
                .from('case_names')
                .select('name')
                .order('name', { ascending: true });

            if (error) throw error;
            if (data) {
                setCaseNameOptions(data.map(item => item.name));
            }
        } catch (error) {
            console.error('Error fetching case names:', error);
        }
    };

    const fetchCases = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('cases')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCases(data || []);
        } catch (error) {
            console.error('Error fetching cases:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (caseItem?: Case) => {
        if (caseItem) {
            setEditingCase(caseItem);
            setFormData(caseItem);
        } else {
            setEditingCase(null);
            setFormData({
                case_name: '', case_no: undefined, case_year: new Date().getFullYear(),
                name: '', society: '', lawyer: '', represents: '', status: 'Open'
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalLoading(true);

        try {
            if (editingCase) {
                const { error } = await supabase
                    .from('cases')
                    .update(formData)
                    .eq('id', editingCase.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('cases')
                    .insert([formData]);
                if (error) throw error;
            }

            setIsModalOpen(false);
            fetchCases();
        } catch (error) {
            console.error('Error saving case:', error);
            alert('Failed to save case record.');
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this case record?')) return;

        try {
            const { error } = await supabase.from('cases').delete().eq('id', id);
            if (error) throw error;
            setCases(cases.filter(c => c.id !== id));
        } catch (error) {
            console.error('Error deleting case:', error);
        }
    };

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredCases = cases.filter(c => {
        const matchesSearch =
            c.case_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.case_no?.toString().includes(searchTerm) ||
            c.case_year?.toString().includes(searchTerm) ||
            c.society?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.lawyer?.toLowerCase().includes(searchTerm.toLowerCase());

        // Filter Popover Logic
        const matchesCaseName = filters.caseName ? c.case_name === filters.caseName : true;
        const matchesCaseNo = filters.caseNo ? c.case_no?.toString().includes(filters.caseNo) : true;
        const matchesCaseYear = filters.caseYear ? c.case_year?.toString().includes(filters.caseYear) : true;
        const matchesDate = filters.date ? c.created_at?.startsWith(filters.date) : true;

        let matchesStatus = true;
        if (filters.status === 'Active') {
            matchesStatus = !['closed', 'archived', 'disposed'].includes(c.status?.toLowerCase());
        } else if (filters.status !== 'All') {
            matchesStatus = c.status?.toLowerCase() === filters.status.toLowerCase();
        }

        return matchesSearch && matchesCaseName && matchesCaseNo && matchesCaseYear && matchesDate && matchesStatus;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredCases.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCases.length / itemsPerPage);

    const handlePrevious = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNext = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    // Reset to first page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

    return (
        <div className="space-y-8 animate-fade-in group">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-6">
                <div className="space-y-0.5">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">Case Records</h2>
                    <p className="text-slate-500 text-sm">Manage and track all legal case files and hearings.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial sm:w-80">
                        <div className="absolute left-3 top-2.5 pointer-events-none">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <Input
                            placeholder="Search cases..."
                            className="pl-9 h-10 bg-white border-slate-200 focus:border-slate-300 rounded-lg text-sm w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <Button
                            variant="outline"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={cn("h-10 w-10 p-0 shrink-0", isFilterOpen && "bg-slate-100 border-slate-300")}
                        >
                            <Filter className="h-4 w-4 text-slate-600" />
                        </Button>
                        {isFilterOpen && (
                            <>
                                <div className="fixed inset-0 z-30" onClick={() => setIsFilterOpen(false)} />
                                <div className="absolute right-0 top-12 z-40 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 p-4 animate-in fade-in-0 zoom-in-95 space-y-4 ring-1 ring-slate-900/5">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                        <h4 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                                            <Filter className="h-3.5 w-3.5 text-slate-500" />
                                            Filter Records
                                        </h4>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setFilters({ caseName: '', caseNo: '', caseYear: '', date: '', status: 'Active' })}
                                            className="h-auto p-0 text-xs text-red-500 hover:text-red-700 hover:bg-transparent px-2 py-1"
                                        >
                                            Reset
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-700">Case Type</Label>
                                            <select
                                                className="w-full h-9 rounded-lg border border-slate-200 text-xs px-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900/10 bg-slate-50/50"
                                                value={filters.caseName}
                                                onChange={e => setFilters({ ...filters, caseName: e.target.value })}
                                            >
                                                <option value="">All Types</option>
                                                {caseNameOptions.map(name => <option key={name} value={name}>{name}</option>)}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-700">Case No</Label>
                                                <Input
                                                    className="h-9 text-xs bg-slate-50/50"
                                                    placeholder="e.g. 123"
                                                    value={filters.caseNo}
                                                    onChange={e => setFilters({ ...filters, caseNo: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-medium text-slate-700">Year</Label>
                                                <Input
                                                    className="h-9 text-xs bg-slate-50/50"
                                                    placeholder="e.g. 2024"
                                                    value={filters.caseYear}
                                                    onChange={e => setFilters({ ...filters, caseYear: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-700">Creation Date</Label>
                                            <div className="relative">
                                                <Input
                                                    type="date"
                                                    className="h-9 text-xs pl-9 bg-slate-50/50"
                                                    value={filters.date}
                                                    onChange={e => setFilters({ ...filters, date: e.target.value })}
                                                />
                                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-medium text-slate-700">Status</Label>
                                            <select
                                                className="w-full h-9 rounded-lg border border-slate-200 text-xs px-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900/10 bg-slate-50/50"
                                                value={filters.status}
                                                onChange={e => setFilters({ ...filters, status: e.target.value })}
                                            >
                                                <option value="All">All Statuses</option>
                                                <option value="Active">Active Only</option>
                                                <option value="Open">Open</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Hearing Scheduled">Hearing Scheduled</option>
                                                <option value="Closed">Closed</option>
                                                <option value="Archived">Archived</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <Button
                        onClick={() => handleOpenModal()}
                        className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/10 h-10 px-4 text-sm whitespace-nowrap"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Case
                    </Button>
                </div>
            </div>

            {/* Case Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ring-1 ring-slate-900/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/80 border-b border-slate-100 backdrop-blur-sm">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-900 uppercase tracking-wider text-xs">Case Details</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 uppercase tracking-wider text-xs">Client / Name</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 uppercase tracking-wider text-xs">Representing</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 uppercase tracking-wider text-xs">Lawyer</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 uppercase tracking-wider text-xs">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 uppercase tracking-wider text-xs text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-slate-400 mb-4" />
                                            <p className="text-slate-500 font-medium">Loading records...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredCases.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-slate-50/50">
                                                <FolderOpen className="h-8 w-8 text-slate-300" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-1">No case records found</h3>
                                            <p className="text-slate-500">Get started by creating a new case record or try adjusting your search filters.</p>
                                            <Button variant="outline" onClick={() => handleOpenModal()} className="mt-6">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Create First Case
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group border-transparent hover:border-slate-100">
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-4">
                                                <div className="mt-1 p-2 bg-blue-50/50 rounded-lg text-blue-600 group-hover:bg-blue-100/50 transition-colors">
                                                    <FolderOpen className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900 text-sm">{c.name}</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs font-bold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded border border-slate-300">
                                                            {c.case_name}
                                                        </span>
                                                        <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                                            #{c.case_no}
                                                        </span>
                                                        <span className="text-xs text-slate-400">•</span>
                                                        <span className="text-xs text-slate-500 font-medium">{c.case_year}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{c.society || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                                                {c.represents || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 text-sm font-medium">
                                            {c.lawyer || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border",
                                                c.status?.toLowerCase() === 'closed' || c.status?.toLowerCase() === 'archived' || c.status?.toLowerCase() === 'disposed'
                                                    ? "bg-slate-100 text-slate-600 border-slate-200"
                                                    : c.status?.toLowerCase() === 'hearing scheduled'
                                                        ? "bg-purple-50 text-purple-700 border-purple-200"
                                                        : c.status?.toLowerCase() === 'in progress'
                                                            ? "bg-blue-50 text-blue-700 border-blue-200"
                                                            : "bg-green-50 text-green-700 border-green-200"
                                            )}>
                                                <div className={cn("h-1.5 w-1.5 rounded-full mr-2",
                                                    c.status?.toLowerCase() === 'closed' || c.status?.toLowerCase() === 'disposed' ? "bg-slate-400" :
                                                        c.status?.toLowerCase() === 'hearing scheduled' ? "bg-purple-500" :
                                                            c.status?.toLowerCase() === 'in progress' ? "bg-blue-500" :
                                                                "bg-green-500"
                                                )}></div>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenModal(c)}
                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenModal(c)}
                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                >
                                                    <Edit2 className="h-4 w-4" />
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

                {/* Pagination Footer */}
                <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-between bg-slate-50/50">
                    <div className="text-sm text-slate-500 font-medium">
                        Showing <span className="text-slate-900">{filteredCases.length > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className="text-slate-900">{Math.min(indexOfLastItem, filteredCases.length)}</span> of <span className="text-slate-900">{filteredCases.length}</span> results
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-xs text-slate-400 mr-2 hidden sm:block">Page {currentPage} of {totalPages || 1}</div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                            className="h-8 px-3 text-xs"
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNext}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="h-8 px-3 text-xs"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-up ring-1 ring-slate-900/5">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    {editingCase ? 'Edit Case Record' : 'New Case Record'}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">Fill in the details below to {editingCase ? 'update' : 'create'} a legal case file.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4 md:col-span-2">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                        <div className="h-px bg-slate-200 flex-1"></div>
                                        Case Information
                                        <div className="h-px bg-slate-200 flex-1"></div>
                                    </h4>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-700">Case Name <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <div
                                            className={cn(
                                                "flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer transition-all hover:bg-slate-100/50",
                                                isCaseNameDropdownOpen && "ring-2 ring-slate-900/10 bg-white"
                                            )}
                                            onClick={() => setIsCaseNameDropdownOpen(!isCaseNameDropdownOpen)}
                                        >
                                            <span className={cn(!formData.case_name && "text-slate-500")}>
                                                {formData.case_name || "Select Case Name"}
                                            </span>
                                            {isCaseNameDropdownOpen ? (
                                                <ChevronUp className="h-4 w-4 opacity-50" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4 opacity-50" />
                                            )}
                                        </div>
                                        {isCaseNameDropdownOpen && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-40"
                                                    onClick={() => setIsCaseNameDropdownOpen(false)}
                                                />
                                                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-100 bg-white shadow-xl shadow-slate-900/5 animate-in fade-in-0 zoom-in-95 py-1">
                                                    {caseNameOptions.map((name) => (
                                                        <div
                                                            key={name}
                                                            className={cn(
                                                                "relative flex cursor-pointer select-none items-center rounded-lg mx-1 px-2 py-2 text-sm outline-none transition-colors hover:bg-slate-100 hover:text-slate-900",
                                                                formData.case_name === name && "bg-slate-50 text-slate-900 font-medium"
                                                            )}
                                                            onClick={() => {
                                                                setFormData({ ...formData, case_name: name });
                                                                setIsCaseNameDropdownOpen(false);
                                                            }}
                                                        >
                                                            <span className="flex-1 truncate">{name}</span>
                                                            {formData.case_name === name && (
                                                                <Check className="ml-auto h-4 w-4 text-slate-900" />
                                                            )}
                                                        </div>
                                                    ))}
                                                    {caseNameOptions.length === 0 && (
                                                        <div className="py-6 text-center text-sm text-slate-500">
                                                            No options found.
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-700">Case Number <span className="text-red-500">*</span></Label>
                                        <Input
                                            type="number"
                                            required
                                            value={formData.case_no || ''}
                                            onChange={e => setFormData({ ...formData, case_no: parseInt(e.target.value) })}
                                            placeholder="1024"
                                            className="bg-slate-50 border-slate-200 focus:bg-white font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-700">Year <span className="text-red-500">*</span></Label>
                                        <Input
                                            type="number"
                                            required
                                            value={formData.case_year || ''}
                                            onChange={e => setFormData({ ...formData, case_year: parseInt(e.target.value) })}
                                            placeholder="2024"
                                            className="bg-slate-50 border-slate-200 focus:bg-white font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 md:col-span-2 pt-2">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                        <div className="h-px bg-slate-200 flex-1"></div>
                                        Client Details
                                        <div className="h-px bg-slate-200 flex-1"></div>
                                    </h4>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-700">Client / Party Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. John Doe"
                                        className="bg-slate-50 border-slate-200 focus:bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Society / Organization</Label>
                                    <Input
                                        value={formData.society}
                                        onChange={e => setFormData({ ...formData, society: e.target.value })}
                                        placeholder="e.g. Royal Gardens CHS"
                                        className="bg-slate-50 border-slate-200 focus:bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Assigned Lawyer</Label>
                                    <Input
                                        value={formData.lawyer}
                                        onChange={e => setFormData({ ...formData, lawyer: e.target.value })}
                                        placeholder="e.g. Adv. Sharma"
                                        className="bg-slate-50 border-slate-200 focus:bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Represents</Label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-10 appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:bg-white transition-all cursor-pointer"
                                            value={formData.represents}
                                            onChange={e => setFormData({ ...formData, represents: e.target.value })}
                                        >
                                            <option value="">Select Role</option>
                                            <option value="Plaintiff">Plaintiff</option>
                                            <option value="Defendant">Defendant</option>
                                            <option value="Petitioner">Petitioner</option>
                                            <option value="Respondent">Respondent</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                            <ChevronDown className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700">Current Status</Label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-10 appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 focus:bg-white transition-all cursor-pointer"
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="Open">Open</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Hearing Scheduled">Hearing Scheduled</option>
                                            <option value="Closed">Closed</option>
                                            <option value="Archived">Archived</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                            <ChevronDown className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="h-11">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={modalLoading} className="bg-slate-900 text-white hover:bg-slate-800 h-11 px-8 shadow-lg shadow-slate-900/20">
                                    {modalLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckSquare className="mr-2 h-4 w-4" />}
                                    {editingCase ? 'Update Record' : 'Create Record'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
