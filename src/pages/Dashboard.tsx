import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Calendar, Clock, FileText, Scale } from 'lucide-react';

const stats = [
    { label: 'Active Cases', value: '0', icon: Scale, change: 'No active cases' },
    { label: 'Upcoming Hearings', value: '0', icon: Calendar, change: 'No scheduled hearings' },
    { label: 'Pending Documents', value: '0', icon: FileText, change: 'All caught up' },
    { label: 'Tasks Due', value: '0', icon: Clock, change: 'No tasks pending' },
];

const recentActivity: any[] = []; // Empty array for now

export function Dashboard() {
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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {recentActivity.length === 0 ? (
                                <div className="text-center py-8 text-slate-500 text-sm">
                                    No recent activity to display.
                                </div>
                            ) : (
                                recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-center">
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none text-slate-900">{activity.action}</p>
                                            <p className="text-sm text-slate-500">{activity.details}</p>
                                        </div>
                                        <div className="ml-auto font-medium text-xs text-slate-400">{activity.time}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <button className="w-full text-left px-4 py-3 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700">
                            + New Case File
                        </button>
                        <button className="w-full text-left px-4 py-3 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700">
                            + Add Client Detail
                        </button>
                        <button className="w-full text-left px-4 py-3 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700">
                            + Upload Document
                        </button>
                        <button className="w-full text-left px-4 py-3 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700">
                            + Schedule Hearing
                        </button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
