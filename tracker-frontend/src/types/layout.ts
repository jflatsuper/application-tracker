export interface HeaderLink {
  to: string;
  label: string;
  children?: HeaderLink[];
}
export interface AuthNavOption {
  label: string;
  onClick: VoidFunction;
  className?: string;
}
export type NavGroup = HeaderLink[];
