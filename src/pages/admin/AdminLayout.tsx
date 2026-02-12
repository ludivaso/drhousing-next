import { useState } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Home, Users, UserCircle, UsersRound, LogOut, Menu, X, Loader2, Globe, Settings, History, MonitorPlay } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useAuth, AppRole } from '@/hooks/useAuth';
import { useCurrentProfile } from '@/hooks/useProfiles';

interface NavItem {
  nameKey: string;
  href: string;
  icon: typeof LayoutDashboard;
  requiredRoles: AppRole[];
}

const adminNav: NavItem[] = [
  { nameKey: 'admin.nav.dashboard', href: '/admin', icon: LayoutDashboard, requiredRoles: ['admin', 'listing_editor', 'agent'] },
  { nameKey: 'admin.nav.listings', href: '/admin/listings', icon: Home, requiredRoles: ['admin', 'listing_editor', 'agent'] },
  { nameKey: 'admin.nav.agents', href: '/admin/agents', icon: UserCircle, requiredRoles: ['admin'] },
  { nameKey: 'admin.nav.users', href: '/admin/users', icon: UsersRound, requiredRoles: ['admin'] },
  { nameKey: 'admin.nav.leads', href: '/admin/leads', icon: Users, requiredRoles: ['admin', 'agent'] },
  { nameKey: 'admin.nav.activity', href: '/admin/activity', icon: History, requiredRoles: ['admin'] },
  { nameKey: 'admin.nav.hero', href: '/admin/hero', icon: MonitorPlay, requiredRoles: ['admin'] },
];

export default function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAdmin, hasAnyRole, isLoading, signOut } = useAuth();
  const { data: profile } = useCurrentProfile();
  const { t, i18n } = useTranslation();

  // Check if user has any admin-level role
  const hasAdminAccess = hasAnyRole(['admin', 'listing_editor', 'agent']);

  const getInitials = () => {
    if (profile?.fullName) {
      return profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'A';
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to login if not authenticated or doesn't have admin access
  if (!user || !hasAdminAccess) {
    return <Navigate to="/admin/login" replace />;
  }

  // Filter nav items based on user's roles
  const visibleNavItems = adminNav.filter(item => 
    item.requiredRoles.some(role => hasAnyRole([role]))
  );

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transform transition-transform lg:translate-x-0 lg:static",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-sidebar-primary flex items-center justify-center">
                <span className="text-sidebar-primary-foreground font-serif font-bold">DR</span>
              </div>
              <span className="font-serif font-semibold">Admin</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            {visibleNavItems.map((item) => (
              <Link
                key={item.nameKey}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  location.pathname === item.href
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="w-5 h-5" />
                {t(item.nameKey)}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-sidebar-border space-y-3">
            {/* Current User Profile */}
            <Link 
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-sidebar-accent/50"
            >
              <Avatar className="w-8 h-8">
                {profile?.avatarUrl ? (
                  <AvatarImage src={profile.avatarUrl} alt={profile.fullName || ''} />
                ) : null}
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sidebar-foreground truncate">
                  {profile?.fullName || t('admin.users.noName')}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {user?.email}
                </p>
              </div>
              <Settings className="w-4 h-4 text-sidebar-foreground/50" />
            </Link>

            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-sidebar-foreground/70" />
              <Select value={i18n.language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="flex-1 h-9 bg-sidebar-accent/30 border-sidebar-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">{t('admin.spanish')}</SelectItem>
                  <SelectItem value="en">{t('admin.english')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground/70" asChild>
              <Link to="/"><Home className="w-4 h-4" />{t('admin.backToSite')}</Link>
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2 text-sidebar-foreground/70"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />{t('admin.signOut')}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-card flex items-center px-4 lg:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-4 font-serif font-semibold">DR Housing Admin</span>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
