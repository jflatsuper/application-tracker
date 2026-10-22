import Icon from "@/shared/components/Icon";
import type { Entitlements } from "@/features/billing/types";
import { featureRows } from "../entitlements";
import "../style.scss";

const PlanFeatures = ({ entitlements }: { entitlements: Entitlements }) => (
  <ul className="plan-features">
    {featureRows(entitlements).map(({ key, label, included, detail }) => (
      <li
        key={key}
        className={included ? "plan-feature" : "plan-feature plan-feature--off"}
      >
        <Icon name={included ? "check" : "minus"} />
        <span>
          {label}
          {detail && <span className="plan-feature__detail"> · {detail}</span>}
        </span>
        <span className="visually-hidden">
          {included ? "Included" : "Not included"}
        </span>
      </li>
    ))}
  </ul>
);

export default PlanFeatures;
