import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ScrollToTop } from "@/components/ScrollToTop";
import LocaleLayout from "@/components/LocaleLayout";
import HomePage from "./pages/HomePage";
import PropertiesPage from "./pages/PropertiesPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import AgentsPage from "./pages/AgentsPage";
import AgentProfilePage from "./pages/AgentProfilePage";
import ToolsPage from "./pages/ToolsPage";
import ServicesPage from "./pages/ServicesPage";
import FamilyAffairsPage from "./pages/FamilyAffairsPage";
import ContactPage from "./pages/ContactPage";
import WestGAMComprehensiveGuidePage from "./pages/WestGAMComprehensiveGuidePage";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminListings from "./pages/admin/AdminListings";
import AdminListingNew from "./pages/admin/AdminListingNew";
import AdminListingEdit from "./pages/admin/AdminListingEdit";
import AdminAgents from "./pages/admin/AdminAgents";
import AdminAgentNew from "./pages/admin/AdminAgentNew";
import AdminAgentEdit from "./pages/admin/AdminAgentEdit";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminHeroControls from "./pages/admin/AdminHeroControls";
import NotFound from "./pages/NotFound";
import DebugSupabase from "./pages/DebugSupabase";
import Diagnostic from "./pages/Diagnostic";
import { normalizeLang } from "./lib/i18nUtils";

const queryClient = new QueryClient();

/**
 * Redirects bare paths (no /en or /es prefix) to the user's saved locale.
 * e.g. /properties → /en/properties
 */
function BarePathRedirect() {
  const savedLang = normalizeLang(localStorage.getItem('i18nextLng'));
  const path = window.location.pathname + window.location.search + window.location.hash;
  return <Navigate to={`/${savedLang}${path}`} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Locale-prefixed public routes */}
            <Route path="/:lang" element={<LocaleLayout />}>
              <Route index element={<HomePage />} />
              <Route path="properties" element={<PropertiesPage />} />
              <Route path="properties/:id" element={<PropertyDetailPage />} />
              <Route path="agents" element={<AgentsPage />} />
              <Route path="agents/:id" element={<AgentProfilePage />} />
              <Route path="tools" element={<ToolsPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="family-affairs" element={<FamilyAffairsPage />} />
              <Route path="west-gam-guide" element={<WestGAMComprehensiveGuidePage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="profile" element={<ProfileSettingsPage />} />
            </Route>

            {/* Admin routes — no locale prefix */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="listings" element={<AdminListings />} />
              <Route path="listings/new" element={<AdminListingNew />} />
              <Route path="listings/:id" element={<AdminListingEdit />} />
              <Route path="agents" element={<AdminAgents />} />
              <Route path="agents/new" element={<AdminAgentNew />} />
              <Route path="agents/:id" element={<AdminAgentEdit />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="leads" element={<AdminLeads />} />
              <Route path="activity" element={<AdminAuditLogs />} />
              <Route path="hero" element={<AdminHeroControls />} />
            </Route>

            <Route path="/debug-supabase" element={<DebugSupabase />} />
            <Route path="/diagnostic" element={<Diagnostic />} />

            {/* Bare path redirects — old URLs without locale prefix */}
            <Route path="/" element={<BarePathRedirect />} />
            <Route path="/properties" element={<BarePathRedirect />} />
            <Route path="/properties/:id" element={<BarePathRedirect />} />
            <Route path="/agents" element={<BarePathRedirect />} />
            <Route path="/agents/:id" element={<BarePathRedirect />} />
            <Route path="/tools" element={<BarePathRedirect />} />
            <Route path="/services" element={<BarePathRedirect />} />
            <Route path="/family-affairs" element={<BarePathRedirect />} />
            <Route path="/west-gam-guide" element={<BarePathRedirect />} />
            <Route path="/contact" element={<BarePathRedirect />} />
            <Route path="/profile" element={<BarePathRedirect />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
