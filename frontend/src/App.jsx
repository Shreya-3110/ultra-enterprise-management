import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
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
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import ProductTour from './components/ProductTour';

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
    <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading dashboard components...</p>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return null; // Or a spinner
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return children;
};

const BranchSelector = () => {
  const { user, token, activeBranchId, setActiveBranchId } = useAuth();
  const [branches, setBranches] = React.useState([]);

  React.useEffect(() => {
    if (user?.isHeadOffice && token) {
      axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/schools/branches`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        if (res.data.success) {
          setBranches(res.data.data);
        }
      }).catch(err => console.error("Failed to fetch branches", err));
    }
  }, [user, token]);

  if (!user?.isHeadOffice) return null;

  return (
    <div className="hidden md:flex ml-4 items-center">
      <select 
        value={activeBranchId || ''}
        onChange={(e) => {
          setActiveBranchId(e.target.value || null);
          window.location.reload(); // Hard reload to clear component states scoped to old branch
        }}
        className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      >
        <option value="">Head Office (Global)</option>
        {branches.map(b => (
          <option key={b._id} value={b._id}>{b.name}</option>
        ))}
      </select>
    </div>
  );
};

const Layout = ({ children }) => {
  const location = useLocation();
  const { logout, user, token } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const { isDark, toggleTheme } = useTheme();

  React.useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) setNotifications(res.data.data.slice(0, 5));
      } catch (err) {
        console.error("Notif fetch error", err);
      }
    };
    if (token) fetchNotifs();
  }, [token]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#0B1121] text-slate-700 dark:text-slate-300 font-sans overflow-hidden">
      <ProductTour />
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900 dark:bg-slate-950/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#0B1121] border-r border-white/5 flex flex-col items-stretch transition-transform duration-300 lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-20 flex items-center gap-4 px-8 border-b border-white/5">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
             <GraduationCap size={24} />
          </div>
          <h1 className="text-xl font-black text-white tracking-tighter">
            School Admin
          </h1>
          <button className="lg:hidden p-2 text-slate-400 ml-auto" onClick={() => setIsSidebarOpen(false)}>
             <ChevronRight size={20} className="rotate-180" />
          </button>
        </div>

        <nav id="sidebar-nav" className="flex-1 py-8 space-y-2 overflow-y-auto custom-scrollbar px-5">
          <SidebarLink id="overview-link" to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" active={location.pathname === '/dashboard'} />
          
          {user?.role !== 'PARENT' && (
            <>
              <SidebarLink to="/front-office" icon={<Building2 size={20} />} label="Front Office" active={location.pathname === '/front-office'} hasSubmenu={true} />
              <SidebarLink to="/academics" icon={<GraduationCap size={20} />} label="Academics" active={location.pathname === '/academics'} hasSubmenu={true} />
              <SidebarLink to="/students" icon={<Users size={20} />} label="Student Information" active={location.pathname === '/students'} hasSubmenu={true} />
              <SidebarLink to="/certificate" icon={<Sparkles size={20} />} label="Certificate" active={location.pathname === '/certificate'} />
              <SidebarLink to="/attendance" icon={<UserCheck size={20} />} label="Attendance" active={location.pathname === '/attendance'} hasSubmenu={true} />
              <SidebarLink to="/examination" icon={<FileText size={20} />} label="Examination" active={location.pathname === '/examination'} hasSubmenu={true} />
              <SidebarLink to="/fees" icon={<CreditCard size={20} />} label="Fees Collection" active={location.pathname === '/fees'} hasSubmenu={true} />
              <SidebarLink to="/hr" icon={<Users size={20} />} label="Human Resource" active={location.pathname === '/hr'} />
              <SidebarLink to="/calendar" icon={<Calendar size={20} />} label="Annual Calendar" active={location.pathname === '/calendar'} />
              <SidebarLink to="/communications" icon={<Bell size={20} />} label="Communicate" active={location.pathname === '/communications'} />
              <SidebarLink to="/leave" icon={<FileText size={20} />} label="Leave Request" active={location.pathname === '/leave'} />
              <SidebarLink to="/library" icon={<BookOpen size={20} />} label="Library" active={location.pathname === '/library'} />
            </>
          )}

          {user?.role === 'PARENT' && (
            <>
               <SidebarLink to="/dashboard" icon={<History size={20} />} label="My Payment Ledger" active={location.pathname === '/dashboard'} />
               <SidebarLink to="/notifications" icon={<Bell size={20} />} label="School Alerts" active={location.pathname === '/notifications'} />
            </>
          )}
        </nav>

        <div className="p-5 mt-auto border-t border-white/5 bg-[#0D1629]">
           <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-black border border-blue-500/20 uppercase text-xs">
                 {user?.name?.charAt(0) || 'D'}
              </div>
              <div className="flex-1 overflow-hidden text-ellipsis">
                 <p className="text-xs font-black text-white uppercase tracking-tight truncate">{user?.name || 'DEMO ADMIN'}</p>
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{user?.role || 'Admin'}</p>
              </div>
              <button onClick={logout} className="p-2 text-slate-500 hover:text-rose-500 transition-colors">
                 <LogOut size={18} />
              </button>
           </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <header id="top-navbar" className="h-20 bg-[#0B1121] border-b border-white/5 flex items-center justify-between px-6 sm:px-10 flex-shrink-0">
          <div className="flex-1 flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:bg-white/5 rounded-lg"
            >
              <LayoutDashboard size={20} />
            </button>
            
            {/* Search Bar */}
            <div className="hidden sm:flex items-center gap-3 bg-[#1E293B]/50 border border-white/5 px-5 py-2.5 rounded-xl w-full max-w-md group focus-within:ring-2 ring-blue-500/20 transition-all">
               <Search size={18} className="text-slate-500 group-focus-within:text-blue-500 transition-colors" />
               <input 
                 type="text" 
                 placeholder="Search users..." 
                 className="bg-transparent border-none outline-none text-sm font-bold text-slate-400 w-full placeholder:text-slate-600"
               />
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <button 
              onClick={toggleTheme}
              className="p-2.5 text-slate-500 hover:text-blue-500 hover:bg-white/5 transition-all rounded-xl"
              title="Toggle Theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`transition-colors p-2.5 rounded-xl relative ${isNotifOpen ? 'bg-white/10 text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 border-2 border-[#0B1121] rounded-full" />
                )}
              </button>
              
              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-4 z-[60] animate-in fade-in slide-in-from-top-2">
                  <div className="px-6 pb-3 border-b border-slate-50 dark:border-slate-800/50 flex justify-between items-center">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Activity Hub</h3>
                    <Link to="/communications" className="text-[10px] font-bold text-blue-600 uppercase hover:underline">View All</Link>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs italic">No recent system activity</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n._id} className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/80 dark:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                          <p className="text-[11px] font-bold text-slate-900 dark:text-white line-clamp-1">{n.subject || 'System Alert'}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                          <p className="text-[9px] font-medium text-slate-300 mt-2 uppercase tracking-tighter">{new Date(n.sentAt).toLocaleString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Year Selector */}
            <div className="hidden md:flex items-center gap-2 bg-slate-900 text-slate-400 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10">
               2026-27
            </div>

            <div className="h-8 w-px bg-slate-100 dark:bg-white/5 hidden xs:block"></div>
            
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400">
               <Users size={20} />
            </div>
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

const SidebarLink = ({ to, icon, label, active, id, hasSubmenu }) => (
  <Link
    to={to}
    id={id}
    className={`flex items-center justify-between px-5 py-4 transition-all duration-200 rounded-2xl group mb-2
      ${active 
        ? 'text-blue-600 font-black bg-white shadow-xl shadow-blue-500/10' 
        : 'text-slate-500 hover:text-slate-300'
      }`}
  >
    <div className="flex items-center gap-4">
       <span className={`${active ? 'text-blue-600' : 'text-slate-500'} group-hover:scale-110 transition-transform`}>
         {icon}
       </span>
       <span className="text-[14px] font-bold tracking-tight">{label}</span>
    </div>
    {hasSubmenu && <ChevronRight size={14} className={`opacity-40 ${active ? 'text-blue-600' : ''}`} />}
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
    <ThemeProvider>
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
    </ThemeProvider>
  );
}

export default App;
