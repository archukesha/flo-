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

// Guard for routes requiring onboarding
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
    // Telegram WebApp Initialization
    if (tg) {
      tg.ready();
      tg.expand();
      // Set header color to match theme
      tg.setHeaderColor(isDark ? '#000000' : '#ffffff');
      tg.setBackgroundColor(isDark ? '#000000' : '#F9FAFB');
    }
    
    // Apply dark mode class to html based on Telegram theme or system preference
    if (isDark || window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <HashRouter>
      <div className="max-w-md mx-auto min-h-screen bg-surface dark:bg-black text-gray-900 dark:text-white font-sans overflow-x-hidden">
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