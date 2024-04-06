import { useCallback } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import Navigator, { NavigatorProps } from 'components/UI/Navigator';
import { LateralMenu, HeaderMenu, MenuView } from '@/lib/internal/constants';
import { Box, Button, Typography, BoxProps } from '@mui/material';

export type MenuProps = NavigatorProps & {};

const Menu = ({ ...navprops }: MenuProps) => {
  return (
    <span className="no-print">
      <Navigator {...navprops} categories={LateralMenu} navigationPrefix="/" />
    </span>
  );
};

export const TopBarMenu = (props: BoxProps) => {
  const history = useHistory();

  const getActive = useCallback(
    (cb: MenuView['isActive']) => {
      const { pathname, search } = history.location;
      return () => cb?.({ url: pathname, query: search }) ?? false;
    },
    [history]
  );

  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        '& > *:nth-child(n+2)': {
          marginLeft: theme.spacing(),
        },
      })}
      {...props}
    >
      {HeaderMenu.map((item, index) => (
        <TopBarMenuItem key={index} item={item} getActive={getActive} />
      ))}
    </Box>
  );
};

const TopBarMenuItem = ({
  item,
  getActive,
}: {
  item: MenuView;
  getActive: (cb: MenuView['isActive']) => () => boolean;
}) => {
  const { title, to, icon: parentIcon, isActive } = item;

  return (
    <Button
      {...(to
        ? {
            component: NavLink,
            exact: true,
            to,
            ...(isActive
              ? {
                  isActive: getActive(isActive),
                }
              : {}),
          }
        : {})}
    >
      {parentIcon}
      <Typography
        fontWeight="700"
        sx={(theme) => ({
          marginLeft: theme.spacing(),
          color: theme.palette.common.black,
        })}
      >
        {title}
      </Typography>
    </Button>
  );
};

export default Menu;
