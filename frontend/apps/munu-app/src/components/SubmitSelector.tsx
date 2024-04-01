import React from 'react';
import {
  Button,
  CircularProgress,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { KeyboardArrowDown } from '@mui/icons-material';
import type { MenuProps } from '@mui/material';

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color:
      theme.palette.mode === 'light'
        ? 'rgb(55, 65, 81)'
        : theme.palette.grey[300],
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity
        ),
      },
    },
  },
}));

const SubmitSelector = (props: {
  loading?: boolean;
  title?: string;
  submitLabel?: string;
  disabled?: boolean;
  submittingOptions?: { value: string; label: string }[];
  onClick?: (value?: string) => void;
}) => {
  const {
    title,
    loading,
    disabled,
    submitLabel = 'Salvar',
    submittingOptions = [],
    onClick,
  } = props;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (submittingOptions.length > 0) {
        setAnchorEl(e.currentTarget);
        return;
      }
      onClick?.();
    },
    [onClick, submittingOptions]
  );

  const handleChange = React.useCallback(
    (value: string) => {
      setAnchorEl(null);
      onClick?.(value);
    },
    [onClick]
  );

  return (
    <>
      <Tooltip title={title} disableHoverListener={open}>
        <Button
          size="large"
          title={title}
          color="primary"
          variant="contained"
          disableElevation
          onClick={handleClick}
          disabled={disabled || loading}
          {...(submittingOptions.length > 0
            ? {
                id: 'draft-selector',
                'aria-haspopup': 'true',
                'aria-expanded': open ? 'true' : undefined,
                'aria-controls': open ? 'playlist-draft-selector' : undefined,
                endIcon: loading ? (
                  <CircularProgress size={15} />
                ) : (
                  <KeyboardArrowDown />
                ),
              }
            : {
                type: 'submit',
                endIcon: loading ? <CircularProgress size={15} /> : null,
              })}
        >
          {submitLabel}
        </Button>
      </Tooltip>

      <StyledMenu
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        id="playlist-draft-selector"
        MenuListProps={{ 'aria-labelledby': 'draft-selector' }}
      >
        {submittingOptions.map((sub) => (
          <MenuItem
            disableRipple
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleChange(sub.value);
            }}
          >
            {sub.label}
          </MenuItem>
        ))}
      </StyledMenu>
    </>
  );
};

export default SubmitSelector;
