import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { useFavicon } from '../hooks/useFavicon';
import { Plus, Trash2, DollarSign, CreditCard, Loader2, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface Transaction {
    id: number;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    date: string;
    description: string;
    reference_number?: string;
    payment_method?: string;
    created_at: string;
}

interface TransactionsPageProps {
    type: 'income' | 'expense';
}

export function Transactions({ type }: TransactionsPageProps) {
    useFavicon(type === 'income' ? '/income-favicon.svg' : '/expense-favicon.svg');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        reference_number: '',
        payment_method: 'Cash'
    });

    const isIncome = type === 'income';
    const title = isIncome ? 'Income Management' : 'Expense Tracking';
    const description = isIncome ? 'Track and manage all incoming payments and revenue sources.' : 'Monitor and categorize your business expenses.';
    const themeColor = isIncome ? 'text-green-600' : 'text-red-600';
    const bgColor = isIncome ? 'bg-green-50' : 'bg-red-50';

    useEffect(() => {
        fetchTransactions();
    }, [type]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('type', type)
                .order('date', { ascending: false });

            if (error) throw error;
            setTransactions(data || []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            const { error } = await supabase.from('transactions').insert([{
                type,
                category: formData.category,
                amount: parseFloat(formData.amount),
                date: formData.date,
                description: formData.description,
                reference_number: formData.reference_number,
                payment_method: formData.payment_method
            }]);

            if (error) throw error;

            setShowModal(false);
            setFormData({
                category: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                description: '',
                reference_number: '',
                payment_method: 'Cash'
            });
            fetchTransactions();
        } catch (error) {
            console.error('Error adding transaction:', error);
            alert('Failed to add transaction. Please try again.');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this record?')) return;

        try {
            const { error } = await supabase.from('transactions').delete().eq('id', id);
            if (error) throw error;
            setTransactions(transactions.filter(t => t.id !== id));
        } catch (error) {
            console.error('Error deleting transaction:', error);
            alert('Failed to delete transaction.');
        }
    };

    const totalAmount = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>
                    <p className="text-sm text-slate-500 mt-0.5">{description}</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => setShowModal(true)} className="bg-slate-900 text-white gap-2 h-9 px-4 text-sm">
                        <Plus className="h-4 w-4" /> Add {isIncome ? 'Income' : 'Expense'}
                    </Button>
                </div>
            </div>

            {/* Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">Total {isIncome ? 'Revenue' : 'Spending'}</p>
                        <h3 className={cn("text-xl font-bold", themeColor)}>₹{totalAmount.toLocaleString('en-IN')}</h3>
                    </div>
                    <div className={cn("p-3 rounded-xl", bgColor)}>
                        <DollarSign className={cn("h-5 w-5", themeColor)} />
                    </div>
                </div>
                {/* Could add more stats here, e.g., monthly average, top category */}
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">Recent Transactions</h3>
                    {/* Add filter/search later if needed */}
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400 mb-2" />
                        <p className="text-slate-500">Loading records...</p>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="p-16 text-center text-slate-500">
                        <div className="mx-auto bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                            <CreditCard className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-slate-900 font-medium mb-1">No transactions recorded</h3>
                        <p className="text-sm">Start by adding a new {type} record.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Date</th>
                                    <th className="px-6 py-4 font-semibold">Category</th>
                                    <th className="px-6 py-4 font-semibold">Description</th>
                                    <th className="px-6 py-4 font-semibold text-right">Amount</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-700 whitespace-nowrap">
                                            {new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                                {t.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={t.description}>
                                            {t.description || '-'}
                                        </td>
                                        <td className={cn("px-6 py-4 text-right font-bold whitespace-nowrap", isIncome ? "text-green-600" : "text-slate-900")}>
                                            {isIncome ? '+' : '-'} ₹{Number(t.amount).toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-900">New {isIncome ? 'Income Source' : 'Expense Record'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Amount (₹)</Label>
                                    <Input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Input
                                    list="categories"
                                    required
                                    placeholder="Select or type..."
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                />
                                <datalist id="categories">
                                    {isIncome ? (
                                        <>
                                            <option value="Consultation Fee" />
                                            <option value="Retainer Fee" />
                                            <option value="Case Settlement" />
                                            <option value="Other" />
                                        </>
                                    ) : (
                                        <>
                                            <option value="Office Rent" />
                                            <option value="Stationery" />
                                            <option value="Travel Allowance" />
                                            <option value="Utilities" />
                                            <option value="Staff Salary" />
                                            <option value="Court Fees" />
                                        </>
                                    )}
                                </datalist>
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                    placeholder="Details..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitLoading} className="bg-slate-900 text-white">
                                    {submitLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                                    Save Record
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
