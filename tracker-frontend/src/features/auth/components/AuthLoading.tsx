import Icon from "@/shared/components/Icon";
import "@/app/layout/style.scss";
import "@/app/layout/headers/style.scss";
import "./authLoading.scss";

const NAV_PLACEHOLDERS = [56, 96, 72, 64];

// The app shell with placeholders where the account area and page content
// will be, shown while the session is being checked. It sits outside the
// router and the auth context, so it uses plain markup (no links).
function AuthLoading() {
  return (
    <div className="base-layout" role="status" aria-live="polite">
      <span className="visually-hidden">Loading your account…</span>
      <div className="default-header-nav" aria-hidden="true">
        <div className="default-header">
          <div className="mobile-nav">
            <span className="skeleton skeleton--icon" />
          </div>
          <span className="default-header__brand">
            <Icon name="logo" size={22} />
            Refresha
          </span>
          <div className="default-header-links">
            {NAV_PLACEHOLDERS.map((width) => (
              <span
                key={width}
                className="skeleton skeleton--nav"
                style={{ width }}
              />
            ))}
          </div>
          <div className="default-header-account">
            <span className="skeleton skeleton--avatar" />
          </div>
        </div>
      </div>
      <main className="base-layout__main auth-loading" aria-hidden="true">
        <span className="skeleton skeleton--title" />
        <span className="skeleton skeleton--line" />
        <div className="auth-loading__cards">
          <span className="skeleton skeleton--card" />
          <span className="skeleton skeleton--card" />
          <span className="skeleton skeleton--card" />
        </div>
        <span className="skeleton skeleton--block" />
      </main>
    </div>
  );
}

export default AuthLoading;
