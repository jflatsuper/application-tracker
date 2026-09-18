export interface HeaderLink {
  to: string;
  label: string;
  children?: HeaderLink[];
}
export type NavGroup = HeaderLink[];
