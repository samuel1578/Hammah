export interface NavLink {
  label: string;
  href: string;
}

export interface NavGroup {
  title: string;
  items: NavLink[];
}

export const primaryNavigation: NavLink[] = [
  { label: "Shop", href: "/shop" },
  { label: "Collections", href: "/collections" },
  { label: "Our Story", href: "/our-story" },
  { label: "The Hammah Legacy", href: "/legacy" },
];

export const utilityNavigation: NavLink[] = [
  { label: "Saved", href: "/saved" },
  { label: "Account", href: "/login" },
  { label: "Track Order", href: "/track" },
];

export const categoryNavigation: NavLink[] = [
  { label: "Trousers", href: "/collections/collection-001" },
  { label: "Kaftans", href: "/collections/kaftans" },
  { label: "African-made Footwear", href: "/collections/footwear" },
];

export const footerNavigation: NavGroup[] = [
  {
    title: "Shop",
    items: [
      { label: "Shop", href: "/shop" },
      { label: "Collections", href: "/collections" },
    ],
  },
  {
    title: "Collections",
    items: [
      { label: "Collection 001", href: "/collections/collection-001" },
      { label: "Kaftans", href: "/collections/kaftans" },
      { label: "African-made Footwear", href: "/collections/footwear" },
    ],
  },
  {
    title: "About",
    items: [
      { label: "Our Story", href: "/our-story" },
      { label: "The Hammah Legacy", href: "/legacy" },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Track Order", href: "/track" },
      { label: "Delivery", href: "/delivery" },
      { label: "Returns", href: "/returns" },
      { label: "Size Guide", href: "/size-guide" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
    ],
  },
];
