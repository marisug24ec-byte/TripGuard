import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TripProvider } from './context/TripContext';
import { AppLayout } from './components/layout/AppLayout';
import { Home } from './pages/Home';
import { PlanTrip } from './pages/PlanTrip';
import { MyTrips } from './pages/MyTrips';
import { TripDashboard } from './pages/TripDashboard';
import { LiveMonitoring } from './pages/LiveMonitoring';
import { AIReplanning } from './pages/AIReplanning';
import { BudgetTracker } from './pages/BudgetTracker';
import { AgentActivity } from './pages/AgentActivity';
import { Settings } from './pages/Settings';

export function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="plan" element={<PlanTrip />} />
              <Route path="trips" element={<MyTrips />} />
              <Route path="dashboard" element={<TripDashboard />} />
              <Route path="monitoring" element={<LiveMonitoring />} />
              <Route path="replanning" element={<AIReplanning />} />
              <Route path="budget" element={<BudgetTracker />} />
              <Route path="agents" element={<AgentActivity />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TripProvider>
    </AuthProvider>
  );
}

export default App;
