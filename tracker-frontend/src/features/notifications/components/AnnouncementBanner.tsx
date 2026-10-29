import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import Icon from "@/shared/components/Icon";
import {
  useActiveAnnouncements,
  useDismissAnnouncement,
} from "../hooks/useNotifications";
import type { AnnouncementLevel } from "../types";
import "./style.scss";

const ICONS = {
  info: "info",
  warning: "alert-triangle",
  critical: "alert-circle",
} as const satisfies Record<AnnouncementLevel, string>;

const SEVERITY: Record<AnnouncementLevel, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

const AnnouncementBanner = () => {
  const { status } = useAuth();
  const { data = [] } = useActiveAnnouncements(status === "authenticated");
  const dismiss = useDismissAnnouncement();
  const [expanded, setExpanded] = useState(false);

  if (data.length === 0) return null;

  const sorted = [...data].sort((a, b) => SEVERITY[a.level] - SEVERITY[b.level]);

  return (
    <div className="announcements" data-expanded={expanded}>
      {sorted.map(({ id, title, body, level }) => (
        <div
          key={id}
          className={`announcement announcement--${level}`}
          role={level === "critical" ? "alert" : "status"}
        >
          <Icon name={ICONS[level]} size={18} />
          <p className="announcement__text">
            <strong>{title}</strong> {body}
          </p>
          <button
            type="button"
            className="announcement__close"
            aria-label={`Dismiss ${title}`}
            disabled={dismiss.isPending}
            onClick={() => dismiss.mutate(id)}
          >
            <Icon name="x" size={16} />
          </button>
        </div>
      ))}
      {sorted.length > 1 && (
        <button
          type="button"
          className="announcements__more"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Show less" : `${sorted.length - 1} more`}
        </button>
      )}
    </div>
  );
};

export default AnnouncementBanner;
