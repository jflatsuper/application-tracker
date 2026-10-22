import type { ApplicationStatus } from "../ApplicationSchema";
import { STATUS_LABELS } from "../applicationStatus";
import "../style.scss";

const StatusChip = ({ status }: { status: ApplicationStatus }) => (
  <span className={`status-chip status-chip--${status}`}>
    {STATUS_LABELS[status] ?? status}
  </span>
);

export default StatusChip;
