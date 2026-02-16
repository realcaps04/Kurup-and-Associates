import { Bell, Search, User } from 'lucide-react';
import { Input } from '../ui/Input';

export function Header() {
    return (
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
            <div className="flex items-center w-full max-w-md">
                <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        type="search"
                        placeholder="Search cases, clients, or documents..."
                        className="pl-9 bg-slate-50 border-slate-100 focus:bg-white transition-colors"
                    />
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                </button>
                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                    <User className="h-5 w-5" />
                </div>
            </div>
        </header>
    );
}
