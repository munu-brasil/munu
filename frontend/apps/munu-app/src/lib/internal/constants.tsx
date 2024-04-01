import { School, StyleRounded } from '@mui/icons-material';
import Icons from '@munu/core-lib/components/Icons';

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
    icon: <Icons.Home8Bit />,
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
