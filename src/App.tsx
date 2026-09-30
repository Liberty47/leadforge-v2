import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Layout from './components/Layout';
import Activation from './pages/Activation';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import LeadDetails from './pages/LeadDetails';
import FindLeads from './pages/FindLeads';
import Campaigns from './pages/Campaigns';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDetails from './pages/CampaignDetails';
import ReviewEmails from './pages/ReviewEmails';
import EmailDetails from './pages/EmailDetails';
import Activity from './pages/Activity';
import Settings from './pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isActivated = useStore((state) => state.isActivated);
  if (!isActivated) {
    return <Navigate to="/activation" replace />;
  }
  return <>{children}</>;
}

function App() {
  const isActivated = useStore((state) => state.isActivated);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/activation" element={isActivated ? <Navigate to="/dashboard" replace /> : <Activation />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="leads/:id" element={<LeadDetails />} />
          <Route path="find-leads" element={<FindLeads />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="campaigns/create" element={<CreateCampaign />} />
          <Route path="campaigns/:id" element={<CampaignDetails />} />
          <Route path="review" element={<ReviewEmails />} />
          <Route path="emails/:id" element={<EmailDetails />} />
          <Route path="activity" element={<Activity />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
