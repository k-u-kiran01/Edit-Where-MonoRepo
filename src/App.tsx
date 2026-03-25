import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { WorkspaceOverview } from './components/views/WorkspaceOverview';
import { WorkspaceDetail } from './components/views/WorkspaceDetail';
import { ApiKeysView } from './components/views/ApiKeysView';
import { FileEditView } from './components/views/FileEditView';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { useLoginHook } from './hooks/useLoginHook';
import { Loader2 } from 'lucide-react';

export function App() {
  // 1. ALL hooks must be at the very top
  const { isLoggedIn, setIsLoggedIn, isCheckingSession } = useLoginHook();

  // 2. Early returns go AFTER all hooks
  if (isCheckingSession) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // 3. App.tsx just maps out the routes, it doesn't navigate itself.
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - Redirect to workspaces if already logged in */}
        <Route 
          path="/" 
          element={isLoggedIn ? <Navigate to="/workspaces" replace /> : <LandingPage />} 
        />
        <Route 
          path="/login" 
          element={isLoggedIn ? <Navigate to="/workspaces" replace /> : <LoginPage setIsLoggedIn={setIsLoggedIn}/>} 
        />

        {/* Protected Dashboard Routes (Wrapped in the Layout) */}
        {isLoggedIn ? (
          <Route element={<DashboardLayout />}>
            {/* /workspaces */}
            <Route path="/workspaces" element={<WorkspaceOverview />} />
            
            {/* /workspaces/123 */}
            <Route path="/workspaces/:workspaceId" element={<WorkspaceDetail />} />
            
            {/* /workspaces/123/edit/456 */}
            <Route path="/workspaces/:workspaceId/edit/:fileId" element={<FileEditView />} />
            
            {/* /api-keys */}
            <Route path="/api-keys" element={<ApiKeysView />} />
            
            {/* Catch-all redirects back to workspaces for logged-in users */}
            <Route path="*" element={<Navigate to="/workspaces" replace />} />
          </Route>
        ) : (
          // Catch-all for logged-out users trying to access protected URLs
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}