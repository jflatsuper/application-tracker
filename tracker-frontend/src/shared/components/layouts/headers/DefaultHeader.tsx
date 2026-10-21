import type { FC } from "react";
import headerLinks from "../../../../constants/navLinks";
import "./style.scss";
import { Link, useNavigate } from "react-router";
import type { AuthNavOption, HeaderLink } from "../../../../types/layout";
import { useAuth } from "@/auth/useAuth";
const DefaultHeader: FC = () => {
  return (
    <nav className="default-header-nav">
      <header className="default-header">
        <ul className="default-header-links">
          {headerLinks.map((link) => (
            <DefaultHeaderLink key={link.label} {...link} />
          ))}
          <AccountSection />
        </ul>
      </header>
    </nav>
  );
};
export default DefaultHeader;
const AccountSection = () => {
  const { user, status, continueAsGuest, logout } = useAuth();
  const navigate = useNavigate();
  let options: AuthNavOption[] = [];
  if (status == "unauthenticated") {
    options = [
      { label: "Sign in", onClick: () => navigate("/login") },
      { label: "Continue as Guest", onClick: continueAsGuest },
    ];
  } else if (status == "authenticated") {
    options = [
      { label: "Logout", onClick: logout },
      { label: "Profile", onClick: () => navigate("/profile") },
    ];
  }
  return (
    <div>
      <li>
        <div>{status == "authenticated" ? user?.full_name : "RAHHH"}</div>

        <ul>
          {options.map(({ label, onClick }) => (
            <button onClick={onClick}>{label}</button>
          ))}
        </ul>
      </li>
    </div>
  );
};
const DefaultHeaderLink: FC<HeaderLink> = ({ to, label, children }) => {
  return (
    <li>
      <Link to={to}>{label}</Link>
      {children && (
        <ul>
          {children.map((child) => (
            <DefaultHeaderLink
              key={child.label}
              to={child.to}
              label={child.label}
            />
          ))}
        </ul>
      )}
    </li>
  );
};
const DefaultChildHeaderLink: FC<HeaderLink> = ({ to, label }) => {
  return (
    <li>
      <Link to={to}>{label}</Link>
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
