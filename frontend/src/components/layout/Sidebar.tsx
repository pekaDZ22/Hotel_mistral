import { NavLink, useLocation } from 'react-router-dom';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Hotel,
  Users,
  Calendar,
  Bed,
  Settings,
  BarChart3,
  CreditCard,
  Building2,
  Home
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles?: UserRole[];
}

const getNavItems = (role: UserRole): NavItem[] => {
  const commonItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: `/${role.toLowerCase().replace('_', '-')}/dashboard`,
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
  ];

  const roleSpecificItems: Record<UserRole, NavItem[]> = {
    [UserRole.CUSTOMER]: [
      {
        title: 'Home',
        href: '/',
        icon: <Home className="h-4 w-4" />,
      },
      {
        title: 'Browse Hotels',
        href: '/hotels',
        icon: <Hotel className="h-4 w-4" />,
      },
      {
        title: 'My Bookings',
        href: '/bookings',
        icon: <Calendar className="h-4 w-4" />,
      },
    ],
    [UserRole.STAFF]: [
      {
        title: 'Bookings',
        href: '/staff/bookings',
        icon: <Calendar className="h-4 w-4" />,
      },
    ],
    [UserRole.HOTEL_ADMIN]: [
      {
        title: 'Rooms',
        href: '/hotel-admin/rooms',
        icon: <Bed className="h-4 w-4" />,
      },
      {
        title: 'Bookings',
        href: '/hotel-admin/bookings',
        icon: <Calendar className="h-4 w-4" />,
      },
      {
        title: 'Staff',
        href: '/hotel-admin/staff',
        icon: <Users className="h-4 w-4" />,
      },
    ],
    [UserRole.PLATFORM_ADMIN]: [
      {
        title: 'Hotels',
        href: '/platform-admin/hotels',
        icon: <Building2 className="h-4 w-4" />,
      },
      {
        title: 'Users',
        href: '/platform-admin/users',
        icon: <Users className="h-4 w-4" />,
      },
      {
        title: 'Analytics',
        href: '/platform-admin/analytics',
        icon: <BarChart3 className="h-4 w-4" />,
      },
    ],
  };

  return [...commonItems, ...roleSpecificItems[role]];
};

export const Sidebar = ({ role }: SidebarProps) => {
  const location = useLocation();
  const navItems = getNavItems(role);

  return (
    <div className="w-64 bg-card border-r min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-primary">
          Hotel Management
        </h2>
        <p className="text-sm text-muted-foreground">
          {role.replace('_', ' ')}
        </p>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || 
              location.pathname.startsWith(`${item.href}/`);
            
            return (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {item.icon}
                  {item.title}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
