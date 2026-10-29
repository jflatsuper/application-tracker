import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { UserRead } from "@/features/auth/types";
import Icon from "@/shared/components/Icon";
import { useDismissOnOutside } from "@/shared/hooks/useDismissOnOutside";

const initialsOf = (label: string) =>
  label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("") || "?";

const AccountMenu = ({ user }: { user: UserRead }) => {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const name = user.is_anonymous
    ? "Guest"
    : user.full_name?.trim() || user.email || "Account";

  const close = useCallback(() => setOpen(false), []);
  useDismissOnOutside(open, close, rootRef, triggerRef);

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, [open]);

  const moveFocus = (event: React.KeyboardEvent) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    );
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? items.length - 1
          : event.key === "ArrowDown"
            ? (index + 1) % items.length
            : (index - 1 + items.length) % items.length;
    items[next]?.focus();
  };

  return (
    <div className="account-menu" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="account-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="account-menu__avatar" aria-hidden="true">
          {initialsOf(name)}
        </span>
        <span className="account-menu__name">{name}</span>
        <Icon name="chevron-down" />
      </button>

      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="Account"
          className="account-menu__menu"
          onKeyDown={moveFocus}
        >
          <div className="account-menu__who" role="none">
            <span>{name}</span>
            {user.email && <small>{user.email}</small>}
          </div>
          <Link
            role="menuitem"
            to="/profile"
            className="account-menu__item"
            onClick={close}
          >
            <Icon name="user" />
            Profile
          </Link>
          <Link
            role="menuitem"
            to="/profile/settings"
            className="account-menu__item"
            onClick={close}
          >
            <Icon name="sliders" />
            Settings
          </Link>
          <Link
            role="menuitem"
            to="/profile/billing"
            className="account-menu__item"
            onClick={close}
          >
            <Icon name="credit-card" />
            Billing
          </Link>
          {user.is_anonymous && (
            <Link
              role="menuitem"
              to="/register"
              className="account-menu__item"
              onClick={close}
            >
              <Icon name="user-plus" />
              Create account
            </Link>
          )}
          <button
            role="menuitem"
            type="button"
            className="account-menu__item account-menu__item--danger"
            onClick={() => {
              close();
              void logout();
            }}
          >
            <Icon name="log-out" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
};

export default AccountMenu;
