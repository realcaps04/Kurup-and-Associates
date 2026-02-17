import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
    Building,
    Search,
    Eye,
    Edit,
    Trash2,
    Loader2,
    FileText
} from 'lucide-react';


interface SocietyStats {
    name: string;
    count: number;
}

export function SocietyDetails() {
    const [stats, setStats] = useState<SocietyStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchSocieties();
    }, []);

    const fetchSocieties = async () => {
        setLoading(true);
        try {
            // Fetch all cases to aggregate society data
            // Note: For large datasets, this should be done via an RPC or a View on the backend
            const { data, error } = await supabase
                .from('cases')
                .select('society');

            if (error) {
                console.error('Error fetching cases:', error);
                return;
            }

            if (data) {
                // Aggregate counts
                const societyCounts: Record<string, number> = {};

                data.forEach(item => {
                    const societyName = item.society?.trim();
                    if (societyName) {
                        societyCounts[societyName] = (societyCounts[societyName] || 0) + 1;
                    }
                });

                // Convert to array
                const statsArray = Object.entries(societyCounts).map(([name, count]) => ({
                    name,
                    count
                })).sort((a, b) => a.name.localeCompare(b.name));

                setStats(statsArray);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredStats = stats.filter(stat =>
        stat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleView = (name: string) => {
        console.log('View society:', name);
        // Navigate to case list filtered by this society
    };

    const handleEdit = (name: string) => {
        console.log('Edit society:', name);
        // Open modal to rename society
    };

    const handleDelete = (name: string) => {
        console.log('Delete society:', name);
        // Confirm delete
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <Building className="h-6 w-6 text-blue-600" />
                        Society Details
                    </h2>
                    <p className="text-slate-500 text-sm">
                        Overview of all societies and their associated case records.
                    </p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search societies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white border-slate-200 focus:border-blue-500 rounded-xl"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                        <Loader2 className="h-8 w-8 animate-spin mb-2" />
                        <p>Loading society data...</p>
                    </div>
                ) : filteredStats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                        <Building className="h-12 w-12 text-slate-300 mb-3" />
                        <h3 className="text-lg font-medium text-slate-900">No societies found</h3>
                        <p className="text-sm">Try adjusting your search query.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Society Name
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        No. of Cases
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {filteredStats.map((stat, index) => (
                                    <tr key={index} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                    <Building className="h-4 w-4" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-900">
                                                    {stat.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-slate-400" />
                                                <span className="text-sm text-slate-700 font-medium">
                                                    {stat.count}
                                                </span>
                                                <span className="text-xs text-slate-500">records</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleView(stat.name)}
                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    title="View Cases"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(stat.name)}
                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                                                    title="Edit Society Name"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(stat.name)}
                                                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                    title="Delete"
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
        </div>
    );
}
