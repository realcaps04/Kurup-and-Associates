import { Bell, Search, User, Menu } from 'lucide-react';
import { Input } from '../ui/Input';

export function Header() {
    return (
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200/50 bg-white/80 backdrop-blur-md px-6 transition-all">
            <div className="flex items-center gap-4 w-full max-w-xl">
                <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                    <Menu className="h-5 w-5" />
                </button>
                <div className="relative w-full max-w-md hidden md:block">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        type="search"
                        placeholder="Search cases, clients, or documents..."
                        className="pl-10 bg-slate-50 border-slate-200 focus:bg-white focus:ring-slate-200 transition-all rounded-full"
                    />
                </div>
            </div>
            <div className="flex items-center space-x-3">
                <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100/80 rounded-full transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                </button>
                <div className="h-8 w-1px bg-slate-200 mx-2"></div>
                <button className="flex items-center space-x-2 p-1 pl-2 pr-1 rounded-full hover:bg-slate-100/80 transition-all border border-transparent hover:border-slate-200">
                    <span className="text-sm font-medium text-slate-700 hidden sm:block">Admin User</span>
                    <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-white ring-2 ring-white shadow-sm">
                        <User className="h-4 w-4" />
                    </div>
                </button>
            </div>
        </header>
    );
}
