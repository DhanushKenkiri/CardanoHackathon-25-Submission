import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import MapView from "./pages/MapView";
import NotFound from "./pages/NotFound";
import DisputeManagementPage from "@/pages/dispute-management/DisputeManagementPage";

// Initialize the query client for React Query
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster /> {/* Toast notification setup */}
      <BrowserRouter>
        <Routes>
          {/* Landing Page with 3D parking visualization */}
          <Route path="/" element={<LandingPage />} />

          {/* Dashboard - Main parking app (NO LOGIN REQUIRED) */}
          <Route path="/dashboard" element={<Dashboard />}>
            {/* Nested route for Dispute Management inside Dashboard */}
            <Route path="dispute-management" element={<DisputeManagementPage />} />
          </Route>

          {/* 3D Map View - Parking spot navigation */}
          <Route path="/map" element={<MapView />} />

          {/* Fallback route for undefined paths */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
