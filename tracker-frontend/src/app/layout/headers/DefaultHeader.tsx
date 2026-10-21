import type { FC } from "react";
import headerLinks from "@/constants/navLinks";
import "./style.scss";
import { Link, NavLink, useNavigate } from "react-router";
import type { AuthNavOption, HeaderLink } from "@/types/layout";
import { useAuth } from "@/features/auth/hooks/useAuth";
import AccountMenu from "./AccountMenu";
import Icon from "@/shared/components/Icon";
const DefaultHeader: FC = () => {
  return (
    <header className="default-header-nav">
      <nav className="default-header" aria-label="Main">
        <Link to="/" className="default-header__brand">
          <Icon name="logo" size={22} />
          Refresha
        </Link>
        <ul className="default-header-links">
          {headerLinks.map((link) => (
            <DefaultHeaderLink key={link.label} {...link} />
          ))}
        </ul>
        <AccountSection />
      </nav>
    </header>
  );
};
export default DefaultHeader;
const AccountSection = () => {
  const { user, status, continueAsGuest } = useAuth();
  const navigate = useNavigate();

  if (status === "authenticated" && user) {
    return (
      <div className="default-header-account">
        <AccountMenu user={user} />
      </div>
    );
  }

  const options: AuthNavOption[] =
    status === "unauthenticated"
      ? [
          { label: "Sign in", onClick: () => navigate("/login") },
          { label: "Continue as Guest", onClick: continueAsGuest },
        ]
      : [];

  return (
    <div className="default-header-account">
      <div className="default-header-account__actions">
        {options.map(({ label, onClick }) => (
          <button
            key={label}
            type="button"
            className="default-header-btn"
            onClick={onClick}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};
const DefaultHeaderLink: FC<HeaderLink> = ({ to, label, children }) => {
  const subLinks = children?.filter((child) => child.to !== to) ?? [];
  return (
    <li className="default-header-link">
      <NavLink to={to} end={to === "/"}>
        {label}
      </NavLink>
      {subLinks.length > 0 && (
        <ul className="default-header-sub">
          {subLinks.map((child) => (
            <li key={child.label}>
              <NavLink to={child.to}>{child.label}</NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};
// interface RouteNode {
//     name: string;
//     path: string;
//     children?: RouteNode[];
//   }

//   function RouteTreeNode({ node, depth = 0 }: { node: RouteNode; depth?: number }) {
//     const [expanded, setExpanded] = useState(true);
//     const hasChildren = !!node.children?.length;

//     return (
//       <div style={{ marginLeft: depth * 20 }}>
//         <div onClick={() => hasChildren && setExpanded(!expanded)}>
//           {hasChildren && <span>{expanded ? "▾" : "▸"}</span>}
//           <strong>{node.name}</strong>
//           <code>{node.path || "index"}</code>
//         </div>

//         {expanded && hasChildren && node.children!.map((child) => (
//           <RouteTreeNode key={child.name} node={child} depth={depth + 1} />
//         ))}
//       </div>
//     );
//   }
