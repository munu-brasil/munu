import {
  Button,
  Grid,
  Avatar,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import User from '@mui/icons-material/Person';
import ProfileButton from 'components/ProfileButton';
import { Theme } from '@/themes/mui/mui.theme';
import { useSessionStore } from '@munu/core-lib/repo/session';

export type ProfileMenuProps = {
  currentUser: any;
};

const Menu = (p: ProfileMenuProps) => {
  const { currentUser } = p;
  return (
    <>
      <Grid item>
        <ProfileButton
          profile={{ name: currentUser?.name ?? currentUser?.email ?? 'u' }}
          urls={{ signout: `admin/signout` }}
        />
      </Grid>
    </>
  );
};

export default Menu;

const styles = (theme: Theme) => ({
  buttonAvatar: {
    color: theme.palette.grey[500],
    '&:hover': {
      background: 'inherit',
    },
  },
  iconButtonAvatar: {
    padding: 4,
    color: theme.palette.primary.light,
    // overwrite material ui button styles
    '& > :first-child': {
      fontSize: 32,
    },
    [theme.breakpoints.down('sm')]: {
      margin: ' 0 10px',
    },
  },
  name: {
    marginLeft: theme.spacing(1),
  },
  layout: {
    display: 'flex' as 'flex',
    flexDirection: 'row' as 'row',
    marginLeft: theme.spacing(3),
    alignItems: 'center' as 'center',
  },
  avatar: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    color: theme.palette.primary.light,
    backgroundColor: theme.palette.primary.light,
    border: `1px solid ${theme.palette.primary.main}`,
  },
});

export type WideMenuProps = {};

const ResponsiveComponent = (props: {
  small?: boolean;
  src?: string;
  alt?: string;
  onClick?: (e: any) => void;
}) => {
  const { small, src, alt, onClick } = props;
  const theme = useTheme();
  const classes = styles(theme);

  const iconUser = (
    <Avatar css={classes.avatar} alt={alt} src={src}>
      <User />
    </Avatar>
  );
  if (small) {
    return (
      <IconButton css={classes.iconButtonAvatar} onClick={onClick}>
        {iconUser}
      </IconButton>
    );
  }
  return (
    <Grid item css={classes.layout}>
      {iconUser}
      <Button
        disableRipple
        variant="text"
        endIcon={<ExpandMore fontSize="large" />}
        classes={{ endIcon: classes.iconButtonAvatar as any }}
        css={classes.buttonAvatar}
        onClick={onClick}
      >
        <span css={classes.name}>{alt}</span>
      </Button>
    </Grid>
  );
};

const WideMenu = (p: WideMenuProps) => {
  const { user: currentUser } = useSessionStore();
  const theme = useTheme();
  const isSmallerScreen = useMediaQuery(theme.breakpoints.down('sm'), {
    noSsr: true,
  });

  return (
    <ProfileButton
      component={(p: any) => (
        <ResponsiveComponent small={isSmallerScreen} {...p} />
      )}
      profile={{
        name: currentUser?.name ?? 'u',
        avatar: currentUser?.avatar,
      }}
      urls={{ signout: `/admin/signout` }}
    />
  );
};

export const ExtendedMenu = WideMenu;
