import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, Users, FileText, LogOut, Briefcase, X, PanelLeft, LifeBuoy, Gavel, Scale, CreditCard, Banknote } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
    { icon: FolderOpen, label: 'Case Records', to: '/cases' },
    { icon: Users, label: 'Case Copies', to: '/case-copies' },
    { icon: FileText, label: 'Society Details', to: '/society-details' },
    { icon: Gavel, label: 'Interim Orders', to: '/interim-orders' },
    { icon: Scale, label: 'Judgements', to: '/judgments' },
    { icon: CreditCard, label: 'Expenses', to: '/expenses' },
    { icon: Banknote, label: 'Income', to: '/income' },
    { icon: LifeBuoy, label: 'Support', to: '/support' },
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
    onToggle?: () => void;
}

export function Sidebar({ isOpen = true, onClose, onToggle }: SidebarProps) {
    const { signOut } = useAuth();

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm md:hidden animate-fade-in"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-30 flex h-screen flex-col border-r border-slate-200 bg-white shadow-sm transition-all duration-300 ease-in-out md:static md:shadow-none",
                // Mobile: Fixed width 72, toggles via translate
                // Desktop: Toggles width between 72 and 20
                isOpen ? "w-72 translate-x-0" : "w-72 -translate-x-full md:w-20 md:translate-x-0"
            )}>
                {/* Sidebar Header */}
                <div className={cn(
                    "flex h-16 items-center border-b border-slate-100 transition-all duration-300",
                    isOpen ? "justify-between px-6" : "justify-center px-2"
                )}>
                    {/* Logo & Text (Hidden if collapsed on desktop) */}
                    <div className={cn("flex items-center gap-2 overflow-hidden whitespace-nowrap transition-all duration-300",
                        !isOpen && "md:w-0 md:opacity-0 hidden md:flex"
                    )}>
                        <Briefcase className="h-6 w-6 text-slate-900 shrink-0" />
                        <span className="text-lg font-bold text-slate-900 tracking-tight">Kurup & Co.</span>
                    </div>

                    {/* Collapsed Logo (Shown only when collapsed on desktop) */}
                    {!isOpen && (
                        <div className="hidden md:flex items-center justify-center">
                            <Briefcase className="h-6 w-6 text-slate-900" />
                        </div>
                    )}

                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="md:hidden p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Re-implementing Desktop Toggle cleanly: */}
                    <button
                        onClick={onToggle}
                        className={cn(
                            "hidden md:flex p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors",
                            !isOpen && "absolute inset-x-0 mx-auto w-8 h-8 flex items-center justify-center top-4"
                        )}
                        title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                    >
                        <PanelLeft className="h-5 w-5" />
                    </button>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto overflow-x-hidden">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => {
                                if (window.innerWidth < 768 && onClose) onClose();
                            }}
                            className={({ isActive }) =>
                                cn(
                                    "group flex items-center py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out relative",
                                    isOpen ? "px-3" : "justify-center px-0",
                                    isActive
                                        ? "bg-slate-100 text-slate-900 shadow-sm ring-1 ring-slate-200"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={cn(
                                        "h-5 w-5 flex-shrink-0 transition-colors",
                                        isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600",
                                        isOpen && "mr-3"
                                    )} />

                                    <span className={cn(
                                        "whitespace-nowrap transition-all duration-300 origin-left",
                                        !isOpen && "hidden md:w-0 md:opacity-0"
                                    )}>
                                        {item.label}
                                    </span>

                                    {/* Tooltip for collapsed state (Desktop only) */}
                                    {!isOpen && (
                                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 hidden md:block">
                                            {item.label}
                                        </div>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer / Sign Out */}
                <div className={cn("border-t border-slate-100 p-4 bg-slate-50/50", !isOpen && "flex justify-center p-2")}>
                    <button
                        onClick={signOut}
                        className={cn(
                            "flex items-center py-2.5 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm rounded-lg transition-all",
                            isOpen ? "w-full px-3" : "justify-center w-8 h-8 p-0"
                        )}
                        title="Sign Out"
                    >
                        <LogOut className={cn("h-5 w-5 flex-shrink-0", isOpen && "mr-3")} />
                        <span className={cn("whitespace-nowrap", !isOpen && "hidden")}>Sign Out</span>
                    </button>

                </div>
            </div>
        </>
    );
}
