import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  Users, 
  CreditCard, 
  Settings as SettingsIcon, 
  History,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  Bell,
  FileText,
  Loader2,
  PieChart,
  Database,
  Building2,
  BarChart3,
  Scissors,
  RotateCcw,
  Terminal,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';

// Lazy load pages for performance optimization
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const ParentDashboard = React.lazy(() => import('./pages/ParentDashboard'));
const Students = React.lazy(() => import('./pages/Students'));
const Fees = React.lazy(() => import('./pages/Fees'));
const Payments = React.lazy(() => import('./pages/Payments'));
const ActivityLog = React.lazy(() => import('./pages/ActivityLog'));
const Notifications = React.lazy(() => import('./pages/Notifications'));
const Reports = React.lazy(() => import('./pages/Reports'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ParentRegister = React.lazy(() => import('./pages/ParentRegister'));
const Subscription = React.lazy(() => import('./pages/Subscription'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Landing = React.lazy(() => import('./pages/Landing'));
const MigrationCenter = React.lazy(() => import('./pages/MigrationCenter'));
const BranchManagement = React.lazy(() => import('./pages/BranchManagement'));
const FranchiseConsole = React.lazy(() => import('./pages/FranchiseConsole'));
const Adjustments = React.lazy(() => import('./pages/Adjustments'));
const IntegrationCenter = React.lazy(() => import('./pages/IntegrationCenter'));
const RecoveryCenter = React.lazy(() => import('./pages/RecoveryCenter'));

// Loading component for Suspense
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
    <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
    <p className="text-slate-500 font-medium animate-pulse">Loading dashboard components...</p>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return null; // Or a spinner
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return children;
};

const Layout = ({ children }) => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-700 font-sans overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col items-stretch transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-8 border-b border-slate-100">
          <h1 className="text-xl font-bold text-blue-600 tracking-tight">
            Ultra Enterprise
          </h1>
          <button className="lg:hidden p-2 text-slate-400" onClick={() => setIsSidebarOpen(false)}>
             <ChevronRight size={20} className="rotate-180" />
          </button>
        </div>

        <nav className="flex-1 py-6 space-y-1">
          <SidebarLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" active={location.pathname === '/dashboard'} />
          
          {user?.role !== 'PARENT' && (
            <>
              <SidebarLink to="/students" icon={<Users size={20} />} label="Students" active={location.pathname === '/students'} />
              <SidebarLink to="/fees" icon={<CreditCard size={20} />} label="Fees Structure" active={location.pathname === '/fees'} />
              <SidebarLink to="/payments" icon={<History size={20} />} label="Transaction History" active={location.pathname === '/payments'} />
              <SidebarLink to="/reports" icon={<PieChart size={20} />} label="Reports" active={location.pathname === '/reports'} />
              <SidebarLink to="/activity" icon={<FileText size={20} />} label="Audit Trail" active={location.pathname === '/activity'} />
              <SidebarLink to="/communications" icon={<Bell size={20} />} label="Communication Hub" active={location.pathname === '/communications'} />
              <SidebarLink to="/migration" icon={<Database size={20} />} label="Data Migration" active={location.pathname === '/migration'} />
              {user?.isHeadOffice && (
                <>
                  <SidebarLink to="/branches" icon={<Building2 size={20} />} label="Head Office Console" active={location.pathname === '/branches'} />
                  <SidebarLink to="/recovery" icon={<ShieldAlert size={20} />} label="Emergency Recovery" active={location.pathname === '/recovery'} />
                </>
              )}
              <SidebarLink to="/franchise" icon={<BarChart3 size={20} />} label="Franchise Finances" active={location.pathname === '/franchise'} />
              <SidebarLink to="/adjustments" icon={<Scissors size={20} />} label="Financial Adjustments" active={location.pathname === '/adjustments'} />
              <SidebarLink to="/integrations" icon={<Terminal size={20} />} label="API Integration" active={location.pathname === '/integrations'} />
              <SidebarLink to="/subscription" icon={<Sparkles size={20} />} label="Subscription Plan" active={location.pathname === '/subscription'} />
            </>
          )}

          {user?.role === 'PARENT' && (
            <>
               <SidebarLink to="/dashboard" icon={<History size={20} />} label="My Payment Ledger" active={location.pathname === '/dashboard'} />
               <SidebarLink to="/notifications" icon={<Bell size={20} />} label="School Alerts" active={location.pathname === '/notifications'} />
            </>
          )}
          
          <div className="mt-8 px-8 pt-4 border-t border-slate-50">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Support</h3>
            <SidebarLink to="/settings" icon={<SettingsIcon size={20} />} label="Configuration" active={location.pathname === '/settings'} />
          </div>
        </nav>

        <div className="p-6">
          <div className={`${user?.plan === 'PREMIUM' ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-200'} border rounded-xl p-4`}>
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Subscription</p>
            <p className={`text-sm font-bold ${user?.plan === 'PREMIUM' ? 'text-blue-700' : 'text-slate-700'}`}>
              {user?.plan || 'Basic'} Plan
            </p>
            <Link to="/subscription" className="mt-3 block text-center w-full py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors">
              {user?.plan === 'PREMIUM' ? 'Plan Details' : 'Upgrade Now'}
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg"
            >
              <LayoutDashboard size={20} />
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium hidden sm:flex">
              <span>Home</span>
              <ChevronRight size={14} />
              <span className="text-slate-900 capitalize">{location.pathname === '/dashboard' ? 'Dashboard' : location.pathname.substring(1)}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <button className="text-slate-400 hover:text-slate-600 transition-colors p-2">
              <Bell size={20} />
            </button>
            <div className="h-8 w-px bg-slate-200 hidden xs:block"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-900">{user?.name || 'Guest'}</p>
                <p className="text-[10px] font-medium text-slate-400">{user?.role || 'User'}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
              title="Log Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
};

const SidebarLink = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-8 py-3 transition-all duration-200 relative group
      ${active 
        ? 'text-blue-600 font-bold bg-blue-50/50' 
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
      }`}
  >
    {active && <div className="absolute left-0 w-1 h-8 bg-blue-600 rounded-r-full" />}
    <span className={`${active ? 'text-blue-600' : 'text-slate-400'} group-hover:text-slate-900 ml-1`}>
      {icon}
    </span>
    <span className="text-sm">{label}</span>
  </Link>
);

const DashboardSwitcher = () => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );
  
  return user?.role === 'PARENT' ? <ParentDashboard /> : <Dashboard />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <React.Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register-parent" element={<ParentRegister />} />
            
            <Route path="/" element={<Landing />} />

            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <DashboardSwitcher />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/students" element={
              <ProtectedRoute>
                <Layout>
                  <Students />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/fees" element={
              <ProtectedRoute>
                <Layout>
                  <Fees />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/payments" element={
              <ProtectedRoute>
                <Layout>
                  <Payments />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/activity" element={
              <ProtectedRoute>
                <Layout>
                  <ActivityLog />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/communications" element={
              <ProtectedRoute>
                <Layout>
                  <Notifications />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/reports" element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/subscription" element={
              <ProtectedRoute>
                <Layout>
                  <Subscription />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/migration" element={
              <ProtectedRoute>
                <Layout>
                  <MigrationCenter />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/branches" element={
              <ProtectedRoute>
                <Layout>
                  <BranchManagement />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/franchise" element={
              <ProtectedRoute>
                <Layout>
                  <FranchiseConsole />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/adjustments" element={
              <ProtectedRoute>
                <Layout>
                  <Adjustments />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/integrations" element={
              <ProtectedRoute>
                <Layout>
                  <IntegrationCenter />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/recovery" element={
              <ProtectedRoute>
                <Layout>
                  <RecoveryCenter />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Catch all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
