import { useMemo } from "react";
import { Link, useLocation } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import {
  TableIcon,
  CalenderIcon as CalendarIcon,
  TaskIcon as ClipboardIcon,
  ListIcon as MenuIcon,
  HorizontaLDots
} from "../icons";

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
}

// Menu untuk user public/kasir
const publicMenuItems: NavItem[] = [
  {
    name: "Menu",
    icon: <MenuIcon />,
    path: "/",
  },
  {
    name: "Reservasi",
    icon: <CalendarIcon />,
    path: "/reservation",
  },
  {
    name: "Riwayat",
    icon: <ClipboardIcon />,
    path: "/history",
  },
];

// Menu untuk admin
const adminMenuItems: NavItem[] = [
  {
    name: "Kelola Reservasi",
    icon: <CalendarIcon />,
    path: "/dashboard/reservations",
  },
  {
    name: "Kelola Menu",
    icon: <MenuIcon />,
    path: "/dashboard/menus",
  },
  {
    name: "Kelola Meja",
    icon: <TableIcon />,
    path: "/dashboard/tables",
  },
];

// Menu untuk staff (hanya Kelola Reservasi)
const staffMenuItems: NavItem[] = [
  {
    name: "Kelola Reservasi",
    icon: <CalendarIcon />,
    path: "/dashboard/reservations",
  },
];

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Determine which menu items to show based on user role
  const menuItems = useMemo(() => {
    if (!isAuthenticated || !user) {
      return publicMenuItems;
    }

    // Staff only gets access to Kelola Reservasi
    if (user.role === "staff") {
      return staffMenuItems;
    }

    // Admin and super_admin get full access
    return adminMenuItems;
  }, [isAuthenticated, user]);

  const isActive = (path?: string) => {
    if (!path) return false;
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname === path;
  };

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav) => (
        <li key={nav.name}>
          {nav.path && (
            <Link
              to={nav.path}
              className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
            >
              <span
                className={`menu-item-icon-size ${isActive(nav.path)
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex items-center">
              <img
                src="/images/logo/logo-icon.svg"
                alt="Logo"
                className="w-8 h-8"
              />
              <span className="ml-3 text-xl font-semibold">Kafkot Reserve</span>
            </div>
          ) : (
            <img
              src="/images/logo/logo-icon.svg"
              alt="Logo"
              className="w-8 h-8"
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  isAuthenticated ? (user?.role === "staff" ? "Staff Panel" : "Admin Panel") : "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(menuItems)}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;