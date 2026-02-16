import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, Users, FileText, CheckSquare, Settings, LogOut, Briefcase } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
    { icon: FolderOpen, label: 'Case Records', to: '/cases' },
    { icon: Users, label: 'Client Management', to: '/clients' },
    { icon: FileText, label: 'Document Records', to: '/documents' },
    { icon: CheckSquare, label: 'Tasks', to: '/tasks' },
    { icon: Settings, label: 'Settings', to: '/settings' },
];

export function Sidebar() {
    const { signOut } = useAuth();

    return (
        <div className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
            <div className="flex h-16 items-center px-6 border-b border-slate-100">
                <Briefcase className="h-6 w-6 text-slate-900 mr-2" />
                <span className="text-lg font-bold text-slate-900">Kurup & Co.</span>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                isActive
                                    ? "bg-slate-100 text-slate-900"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            )
                        }
                    >
                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>
            <div className="border-t border-slate-100 p-4">
                <button
                    onClick={signOut}
                    className="flex w-full items-center px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-colors"
                >
                    <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
                    Logout
                </button>
            </div>
        </div>
    );
}
