import type { HeaderLink } from "../types/layout";

const headerLinks: HeaderLink[] = [
  {
    label: "Home",
    to: "/",
    children: [
      {
        label: "Home",
        to: "/",
      },
    ],
  },
  {
    label: "Applications",
    to: "/applications",
    children: [
      {
        label: "New Applications",
        to: "/applications/create",
      },
    ],
  },
  {
    label: "Pricing",
    to: "/pricing",
  },
];
export default headerLinks;
