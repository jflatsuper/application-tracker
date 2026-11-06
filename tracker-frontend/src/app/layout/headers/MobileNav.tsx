import { useCallback, useId, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import headerLinks from "@/constants/navLinks";
import { useAuth } from "@/features/auth/hooks/useAuth";
import Icon from "@/shared/components/icon";
import { useDismissOnOutside } from "@/shared/hooks/useDismissOnOutside";

import Button from "@/shared/components/button";
// Every destination in one flat list: on a phone there's no hover to reveal
// the sub-links the desktop header shows.
const links = headerLinks.flatMap(({ to, label, children }) => [
  { to, label },
  ...(children ?? []).filter((child) => child.to !== to),
]);

const MobileNav = () => {
  const { status, continueAsGuest } = useAuth();
  const navigate = useNavigate();
  const [openAt, setOpenAt] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  // Tied to the page it was opened on, so navigating closes it.
  const { pathname } = useLocation();
  const open = openAt === pathname;
  const close = useCallback(() => setOpenAt(null), []);
  useDismissOnOutside(open, close, rootRef, triggerRef);

  return (
    <div className="mobile-nav" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="mobile-nav__trigger"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpenAt(open ? null : pathname)}
      >
        <Icon name={open ? "x" : "menu"} size={22} />
      </button>

      {open && (
        <nav id={panelId} aria-label="Main" className="mobile-nav__panel">
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === "/"}>
              {label}
            </NavLink>
          ))}
          {status === "unauthenticated" && (
            <div className="mobile-nav__actions">
              <Button type="button" onClick={() => navigate("/login")}>
                Sign in
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  close();
                  void continueAsGuest();
                }}
              >
                Continue as guest
              </Button>
            </div>
          )}
        </nav>
      )}
    </div>
  );
};

export default MobileNav;
