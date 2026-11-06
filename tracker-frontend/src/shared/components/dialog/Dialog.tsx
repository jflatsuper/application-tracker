import { useEffect, useId, useRef, type ReactNode } from "react";
import "./dialog.scss";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  // Buttons along the bottom, outside the scrolling area.
  footer?: ReactNode;
};

// A modal box over the page, built on the browser's own <dialog>: focus stays
// inside, Escape closes it and the page behind can't be reached. The content
// is only mounted while open, so anything it keeps in state starts fresh.
const Dialog = ({ open, onClose, title, children, footer }: Props) => {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        // A click on the backdrop lands on the <dialog> itself.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {open && (
        <div className="dialog__box">
          <h2 id={titleId} className="dialog__title">
            {title}
          </h2>
          <div className="dialog__body">{children}</div>
          {footer && <div className="dialog__footer">{footer}</div>}
        </div>
      )}
    </dialog>
  );
};

export default Dialog;
