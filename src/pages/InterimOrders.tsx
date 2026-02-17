import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { supabase } from '../lib/supabase';
import { Search, Gavel } from 'lucide-react';

interface InterimOrder {
    id: number;
    case_name: string;
    case_no: number;
    case_year: number;
    undated_text: string;
    next_date: string;
    order_date: string;
    created_at: string;
}

export function InterimOrders() {
    const [orders, setOrders] = useState<InterimOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('interim_orders')
                .select('*')
                .order('order_date', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
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
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Interim Orders</h2>
                    <p className="text-slate-500 mt-1">Management of interim orders and hearing dates.</p>
                </div>
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
        </div>
    );
}
