export interface NavItem {
  title: string;
  path: string;
  icon?: string;
  active: boolean;
  collapsible: boolean;
  sublist?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: 'Home',
    path: '/',
    icon: 'ion:home-sharp',
    active: true,
    collapsible: false,
    sublist: [
      {
        title: 'Dashboard',
        path: '/',
        active: false,
        collapsible: false,
      },
      {
        title: 'Sales',
        path: '/',
        active: false,
        collapsible: false,
      },
    ],
  },
  {
    title: 'Users',
    path: '/users',
    icon: 'icomoon-free:drawer',
    active: true,
    collapsible: false,
  },
  {
    title: 'Labels',
    path: '/labels',
    icon: 'mdi:label',
    active: true,
    collapsible: false,
  },
  {
    title: 'Newsletters',
    path: '/newsletters',
    icon: 'mdi:email-newsletter',
    active: true,
    collapsible: false,
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: 'mdi:cog',
    active: true,
    collapsible: false,
  },
];

export default navItems;
