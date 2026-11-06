import "./switch.scss";

type Props = {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  // Names the switch for screen readers; the visible text sits beside it.
  label: string;
  disabled?: boolean;
};

// An on/off toggle. Pass no onChange (or disabled) for one that can't change.
const Switch = ({ checked, onChange, label, disabled }: Props) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    className="switch"
    onClick={() => onChange?.(!checked)}
  >
    <span className="switch__thumb" />
  </button>
);

export default Switch;
