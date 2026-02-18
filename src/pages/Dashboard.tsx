import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Building, Calendar, Gavel, Scale } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useFavicon } from '../hooks/useFavicon';

export function Dashboard() {
    useFavicon('/clerk-favicon.svg');
    const [activeCasesCount, setActiveCasesCount] = useState<number | string>('-');
    const [societiesCount, setSocietiesCount] = useState<number | string>('-');
    const [upcomingHearingsCount, setUpcomingHearingsCount] = useState<number | string>('-');
    const [judgmentsCount, setJudgmentsCount] = useState<number | string>('-');

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
                    const uniqueSocieties = new Set(
                        societyData
                            .map(item => item.society)
                            .filter(s => s && s.trim().length > 0)
                    );
                    setSocietiesCount(uniqueSocieties.size);
                }

                // Fetch Upcoming Hearings (Next 14 Days)
                const today = new Date();
                const endDate = new Date();
                endDate.setDate(today.getDate() + 14);

                const todayStr = today.toISOString().split('T')[0];
                const endDateStr = endDate.toISOString().split('T')[0];

                const { count: hearingsCount, error: hearingsError } = await supabase
                    .from('interim_orders')
                    .select('*', { count: 'exact', head: true })
                    .gte('next_date', todayStr)
                    .lte('next_date', endDateStr);

                if (hearingsError) {
                    console.error('Error fetching hearings:', hearingsError);
                    setUpcomingHearingsCount('0');
                } else {
                    setUpcomingHearingsCount(hearingsCount || 0);
                }

                // Fetch Judgments count
                const { count: judgCount, error: judgError } = await supabase
                    .from('judgments')
                    .select('*', { count: 'exact', head: true });

                if (judgError) {
                    console.error('Error fetching judgments:', judgError);
                    setJudgmentsCount('0');
                } else {
                    setJudgmentsCount(judgCount || 0);
                }

            } catch (error) {
                console.error('Error in fetchStats:', error);
                setActiveCasesCount('0');
                setSocietiesCount('0');
                setUpcomingHearingsCount('0');
                setJudgmentsCount('0');
            }
        };

        fetchStats();
    }, []);

    const stats = [
        { label: 'Active Cases', value: activeCasesCount.toString(), icon: Scale, change: activeCasesCount === '-' ? 'Loading...' : `${activeCasesCount} active cases` },
        { label: 'Total Judgments', value: judgmentsCount.toString(), icon: Gavel, change: 'Recorded judgments' },
        { label: 'Upcoming Hearings', value: upcomingHearingsCount.toString(), icon: Calendar, change: 'Next 14 days' },
        { label: 'Societies Active', value: societiesCount.toString(), icon: Building, change: 'Registered societies' },
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
