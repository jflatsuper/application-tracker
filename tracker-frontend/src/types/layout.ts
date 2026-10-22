export interface HeaderLink {
  to: string;
  label: string;
  children?: HeaderLink[];
}
export interface AuthNavOption {
  label: string;
  onClick: VoidFunction;
}
export type NavGroup = HeaderLink[];
