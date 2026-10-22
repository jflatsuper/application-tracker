import { useState } from "react";
import { NavLink, Outlet } from "react-router";
import type { IconName } from "@/assets/icons";
import Icon from "@/shared/components/Icon";
import "../style.scss";

const STORAGE_KEY = "profile-nav-collapsed";

const readCollapsed = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

type NavItem = { to: string; label: string; end?: boolean; icon: IconName };

const NAV_ITEMS: NavItem[] = [
  { to: "/profile", label: "Profile", end: true, icon: "user" },
  { to: "/profile/settings", label: "Settings", icon: "sliders" },
  { to: "/profile/billing", label: "Billing", icon: "credit-card" },
  { to: "/profile/usage", label: "Usage", icon: "chart" },
  ...(import.meta.env.DEV
    ? [{ to: "/profile/developer", label: "Developer", icon: "code" as const }]
    : []),
];

const ProfileLayout = () => {
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      // The sidebar still works, it just won't remember its state.
    }
  };

  return (
    <div className={collapsed ? "profile-shell is-collapsed" : "profile-shell"}>
      <aside className="profile-sidebar">
        <nav className="profile-nav" aria-label="Account sections">
          {NAV_ITEMS.map(({ to, label, end, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={collapsed ? label : undefined}
              className="profile-nav__link"
            >
              <Icon name={icon} size={18} />
              <span className="profile-nav__label">{label}</span>
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          className="profile-nav__toggle"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : undefined}
          onClick={toggle}
        >
          <Icon name={collapsed ? "chevrons-right" : "chevrons-left"} size={18} />
          <span className="profile-nav__label">Collapse</span>
        </button>
      </aside>

      <div className="profile-content">
        <Outlet />
      </div>
    </div>
  );
};

export default ProfileLayout;
