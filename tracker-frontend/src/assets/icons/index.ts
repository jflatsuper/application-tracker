import alertCircle from "./alert-circle.svg?raw";
import alertTriangle from "./alert-triangle.svg?raw";
import bell from "./bell.svg?raw";
import chart from "./chart.svg?raw";
import check from "./check.svg?raw";
import chevronDown from "./chevron-down.svg?raw";
import chevronsLeft from "./chevrons-left.svg?raw";
import chevronsRight from "./chevrons-right.svg?raw";
import code from "./code.svg?raw";
import compass from "./compass.svg?raw";
import creditCard from "./credit-card.svg?raw";
import info from "./info.svg?raw";
import logOut from "./log-out.svg?raw";
import logo from "./logo.svg?raw";
import menu from "./menu.svg?raw";
import minus from "./minus.svg?raw";
import plus from "./plus.svg?raw";
import sliders from "./sliders.svg?raw";
import userPlus from "./user-plus.svg?raw";
import user from "./user.svg?raw";
import x from "./x.svg?raw";

export const icons = {
  "alert-circle": alertCircle,
  "alert-triangle": alertTriangle,
  bell,
  chart,
  check,
  "chevron-down": chevronDown,
  "chevrons-left": chevronsLeft,
  "chevrons-right": chevronsRight,
  code,
  compass,
  "credit-card": creditCard,
  info,
  "log-out": logOut,
  logo,
  menu,
  minus,
  plus,
  sliders,
  "user-plus": userPlus,
  user,
  x,
} as const;

export type IconName = keyof typeof icons;
