import BagIcon from '@/lib/internal/images/bag.png';
import CoinIcon from '@/lib/internal/images/coin_icon.png';
import { Avatar } from '@mui/material';

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

export const LateralMenu: MenuView[] = [
  {
    title: 'Página inicial',
    permissions: [],
    to: '/',
    children: [],
  },
  {
    title: 'Instituições',
    permissions: [],
    to: '/claims',
    children: [],
  },
  {
    title: 'Badges',
    permissions: [],
    to: '/badges',
    children: [],
  },
];

export const HeaderMenu: MenuView[] = [
  {
    title: '320,990 magiK',
    permissions: [],
    to: '/magik',
    icon: (
      <Avatar
        src={CoinIcon}
        alt="magiK"
        sx={{ width: '40px', height: '40px' }}
      />
    ),
    children: [],
  },
  {
    title: 'inventory',
    permissions: [],
    to: '/badges',
    icon: (
      <Avatar
        src={BagIcon}
        alt="bag_icon"
        sx={{ width: '50px', height: '50px' }}
      />
    ),
    children: [],
  },
  {
    title: 'claim',
    permissions: [],
    to: '/claims',
    icon: (
      <Avatar
        src=" "
        alt=" "
        sx={(theme) => ({
          backgroundColor: theme.palette.primary.main,
          width: '30px',
          height: '30px',
        })}
      />
    ),
    children: [],
  },
];
