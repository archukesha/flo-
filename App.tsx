
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { CalendarPage } from './pages/Calendar';
import { Onboarding } from './pages/Onboarding';
import { LogPage } from './pages/Log';
import { Insights } from './pages/Insights';
import { Paywall } from './pages/Paywall';
import { Advice } from './pages/Advice';
import { Settings } from './pages/Settings';
import { Navigation } from './components/Navigation';
import { useStore } from './store';
import { tg } from './lib/utils';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isOnboarded = useStore((state) => state.profile.isOnboarded);
  if (!isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  const isDark = tg?.colorScheme === 'dark';

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      // Transparent header to let background shine through
      tg.setHeaderColor(isDark ? '#000000' : '#ffffff'); 
      tg.setBackgroundColor(isDark ? '#000000' : '#ffffff'); 
    }
    
    if (isDark || window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <HashRouter>
      <div className="relative max-w-md mx-auto min-h-screen font-sans overflow-x-hidden selection:bg-primary/20">
        
        {/* Ambient Background Blobs */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
           <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 dark:bg-primary/10 rounded-full blur-[100px] opacity-70 animate-blob" />
           <div className="absolute top-[20%] right-[-20%] w-[400px] h-[400px] bg-secondary/20 dark:bg-secondary/10 rounded-full blur-[100px] opacity-60 animate-blob animation-delay-2000" />
           <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-[120px] opacity-50 animate-blob animation-delay-4000" />
        </div>

        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/log/:date" element={<ProtectedRoute><LogPage /></ProtectedRoute>} />
          <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
          <Route path="/advice" element={<ProtectedRoute><Advice /></ProtectedRoute>} />
          <Route path="/paywall" element={<Paywall />} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
        <Navigation />
      </div>
    </HashRouter>
  );
};

export default App;
