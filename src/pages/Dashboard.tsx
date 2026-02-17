import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Building, Calendar, Clock, FileText, Scale } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Dashboard() {
    const [activeCasesCount, setActiveCasesCount] = useState<number | string>('-');
    const [societiesCount, setSocietiesCount] = useState<number | string>('-');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch active cases count
                const { count: activeCount, error: activeError } = await supabase
                    .from('cases')
                    .select('*', { count: 'exact', head: true })
                    .ilike('status', 'active');

                if (activeError) {
                    console.error('Error fetching active cases:', activeError);
                    setActiveCasesCount('0');
                } else {
                    setActiveCasesCount(activeCount || 0);
                }

                // Fetch distinct societies count
                const { data: societyData, error: societyError } = await supabase
                    .from('cases')
                    .select('society');

                if (societyError) {
                    console.error('Error fetching societies:', societyError);
                    setSocietiesCount('0');
                } else if (societyData) {
                    // Filter out null/empty and get unique count
                    const uniqueSocieties = new Set(
                        societyData
                            .map(item => item.society)
                            .filter(s => s && s.trim().length > 0)
                    );
                    setSocietiesCount(uniqueSocieties.size);
                }

            } catch (error) {
                console.error('Error in fetchStats:', error);
                setActiveCasesCount('0');
                setSocietiesCount('0');
            }
        };

        fetchStats();
    }, []);

    const stats = [
        { label: 'Active Cases', value: activeCasesCount.toString(), icon: Scale, change: activeCasesCount === '-' ? 'Loading...' : `${activeCasesCount} active cases` },
        { label: 'Society Details', value: societiesCount.toString(), icon: Building, change: societiesCount === '-' ? 'Loading...' : `${societiesCount} societies registered` },
        { label: 'Pending Documents', value: '0', icon: FileText, change: 'All caught up' },
        { label: 'Tasks Due', value: '0', icon: Clock, change: 'No tasks pending' },
    ];



    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-500">Last updated: Just now</span>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.label}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">
                                {stat.label}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-slate-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                            <p className="text-xs text-slate-500 mt-1">
                                {stat.change}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>


        </div>
    );
}
