import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { supabase } from '../lib/supabase';
import { Search, Gavel, Plus, X, Calendar, CheckCircle } from 'lucide-react';

interface InterimOrder {
    id: number;
    case_name: string;
    case_no: number;
    case_year: number;
    undated_text: string | null;
    next_date: string | null;
    order_date: string | null;
    created_at: string;
}

export function InterimOrders() {
    const [orders, setOrders] = useState<InterimOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [formData, setFormData] = useState({
        case_name: 'WP(C)',
        case_no: '',
        case_year: new Date().getFullYear().toString(),
        undated_text: '',
        next_date: '',
        order_date: ''
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('interim_orders')
                .select('*')
                .order('order_date', { ascending: false, nullsFirst: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase
                .from('interim_orders')
                .insert([{
                    case_name: formData.case_name,
                    case_no: parseInt(formData.case_no),
                    case_year: parseInt(formData.case_year),
                    undated_text: formData.undated_text || null,
                    next_date: formData.next_date || null,
                    order_date: formData.order_date || null
                }]);

            if (error) throw error;

            setShowAddModal(false);
            setFormData({
                case_name: 'WP(C)',
                case_no: '',
                case_year: new Date().getFullYear().toString(),
                undated_text: '',
                next_date: '',
                order_date: ''
            });
            setShowSuccessModal(true); // Show success modal
            fetchOrders();
        } catch (error) {
            console.error('Error adding order:', error);
            alert('Failed to add order');
        }
    };

    const filteredOrders = orders.filter(order =>
        order.case_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.case_no?.toString().includes(searchTerm) ||
        order.undated_text?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Interim Orders</h2>
                    <p className="text-sm text-slate-500 mt-1">Management of interim orders and hearing dates.</p>
                </div>
                <Button onClick={() => setShowAddModal(true)} className="bg-slate-900 hover:bg-slate-800 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    New Interim
                </Button>
            </div>

            {/* Search Filter */}
            <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm max-w-md">
                <Search className="h-5 w-5 text-slate-400 ml-2" />
                <input
                    type="text"
                    placeholder="Search by case name, number or status..."
                    className="flex-1 border-none focus:ring-0 text-sm outline-none px-2 py-1"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Orders Data Table */}
            <Card className="overflow-hidden border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                    <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                        <Gavel className="h-4 w-4 text-slate-500" />
                        Order Registry
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3 whitespace-nowrap">Case Details</th>
                                    <th className="px-6 py-3 whitespace-nowrap">Status / Remarks</th>
                                    <th className="px-6 py-3 whitespace-nowrap">Next Hearing Date</th>
                                    <th className="px-6 py-3 whitespace-nowrap">Order Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                            Loading records...
                                        </td>
                                    </tr>
                                ) : filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                            No orders found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900">{order.case_name}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    {order.case_no}/{order.case_year}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {order.undated_text ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                                                        {order.undated_text}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {order.next_date ? (
                                                    new Date(order.next_date).toLocaleDateString('en-GB', {
                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                    })
                                                ) : <span className="text-slate-400 italic">Not Scheduled</span>}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {order.order_date ? (
                                                    new Date(order.order_date).toLocaleDateString('en-GB', {
                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                    })
                                                ) : <span className="text-slate-400">-</span>}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Add Order Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-lg font-semibold text-slate-900">Add New Order</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddOrder} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="case_name">Case Name</Label>
                                    <select
                                        id="case_name"
                                        required
                                        className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.case_name}
                                        onChange={(e) => setFormData({ ...formData, case_name: e.target.value })}
                                    >
                                        <option value="WP(C)">WP(C)</option>
                                        <option value="Trp(C)">Trp(C)</option>
                                        <option value="CrlMc">CrlMc</option>
                                        <option value="CoC">CoC</option>
                                        <option value="WA">WA</option>
                                        <option value="OP(C)">OP(C)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="case_year">Year</Label>
                                    <Input
                                        id="case_year"
                                        type="number"
                                        required
                                        value={formData.case_year}
                                        onChange={(e) => setFormData({ ...formData, case_year: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="case_no">Case Number</Label>
                                <Input
                                    id="case_no"
                                    type="number"
                                    required
                                    placeholder="e.g. 12345"
                                    value={formData.case_no}
                                    onChange={(e) => setFormData({ ...formData, case_no: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="undated_text">Status / Remarks (Optional)</Label>
                                <Input
                                    id="undated_text"
                                    placeholder="e.g. Until Further Orders"
                                    value={formData.undated_text}
                                    onChange={(e) => setFormData({ ...formData, undated_text: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="next_date">Next Hearing Date</Label>
                                    <div className="relative">
                                        <Input
                                            id="next_date"
                                            type="date"
                                            value={formData.next_date}
                                            onChange={(e) => setFormData({ ...formData, next_date: e.target.value })}
                                        />
                                        <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="order_date">Order Date</Label>
                                    <div className="relative">
                                        <Input
                                            id="order_date"
                                            type="date"
                                            value={formData.order_date}
                                            onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                                        />
                                        <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-slate-900 text-white hover:bg-slate-800">
                                    Save Record
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Order Added Successfully!</h3>
                        <p className="text-sm text-slate-500 mb-6">The interim order has been recorded in the database.</p>
                        <Button
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
