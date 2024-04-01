import { Home, School, StyleRounded } from '@mui/icons-material';

export interface MenuItem {
  title: string;
  description?: string;
  to: string;
  icon: React.ReactNode;
  illustration?: string;
  permissions: string[];
  isActive?: (e: { url: string; query?: string }) => boolean;
}

export interface MenuView {
  title?: string;
  to?: string;
  icon?: React.ReactNode;
  illustration?: React.ReactNode;
  permissions?: string[];
  children: MenuItem[];
  isActive?: (e: { url: string; query?: string }) => boolean;
}

export const MenuCategories: MenuView[] = [
  {
    title: 'Página inicial',
    permissions: [],
    to: '/',
    icon: <Home />,
    children: [],
  },
  {
    title: 'Instituições',
    permissions: [],
    to: '/institutions',
    icon: <School />,
    children: [],
  },
  {
    title: 'Badges',
    permissions: [],
    to: '/badges',
    icon: <StyleRounded />,
    children: [],
  },
];
