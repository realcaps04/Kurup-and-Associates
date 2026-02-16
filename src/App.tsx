import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { ApplicationStatus } from './pages/ApplicationStatus';
import { Dashboard } from './pages/Dashboard';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { CaseRecords } from './pages/CaseRecords';
import { Support } from './pages/Support';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { session, loading } = useAuth();

    // If loading, we could show a spinner, but for now just return null
    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
    );

    if (!session) {
        // Fallback: Check for clerk_session in localStorage (for our custom non-Auth users)
        const localSession = localStorage.getItem('clerk_session');
        if (localSession) {
            return <>{children}</>;
        }
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
    const { session, loading } = useAuth();

    if (loading) return null;

    if (session) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}

function App() {
    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    } />

                    <Route path="/signup" element={
                        <PublicRoute>
                            <SignUp />
                        </PublicRoute>
                    } />

                    <Route path="/status" element={
                        <ApplicationStatus />
                    } />

                    {/* Admin Routes */}
                    <Route path="/AdminLogin" element={<Navigate to="/admin/login" replace />} />
                    <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />

                    <Route path="/" element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Dashboard />} />
                        <Route path="cases" element={<CaseRecords />} />
                        <Route path="support" element={<Support />} />
                        <Route path="clients" element={<div>Clients Placeholder</div>} />
                        <Route path="documents" element={<div>Documents Placeholder</div>} />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
