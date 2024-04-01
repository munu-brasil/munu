import React from 'react';
import {
  IconButton,
  IconButtonProps,
  Popover,
  Tooltip,
  PopoverOrigin,
} from '@mui/material';
import HelpOutlineOutlined from '@mui/icons-material/HelpOutlineOutlined';

const HelpID = 'help_popover';

export type PopoverViewRef = {
  handlePopoverOpen: () => void;
  handlePopoverClose: () => void;
};

export type Props = {
  component?: React.ComponentType<any>;
  icon?: React.ReactNode;
  title?: string;
  children?: React.ReactNode | React.ReactNodeArray;
  anchorOrigin?: PopoverOrigin;
  transformOrigin?: PopoverOrigin;
  classes?: {
    iconButton?: string;
  };
  iconButtonProps?: Omit<IconButtonProps, 'onClick' | 'id' | 'aria-label'>;
  onOpen?: () => void;
  onClose?: () => void;
};

const HelpPopover = React.forwardRef(
  (props: Props, ref: React.Ref<PopoverViewRef>) => {
    const {
      icon,
      title = 'O que é isso?',
      children,
      classes,
      iconButtonProps,
      onOpen,
      onClose,
      component,
    } = props;
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    const handlePopoverOpen = (
      event: React.MouseEvent<HTMLElement, MouseEvent>
    ) => {
      event.preventDefault();
      event.stopPropagation();
      onOpen?.();
      setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = (e?: any) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      onClose?.();
      setAnchorEl(null);
    };

    React.useImperativeHandle(ref, () => ({
      handlePopoverOpen: () => {
        var element = document.getElementById(HelpID);
        if (element) {
          onOpen?.();
          setAnchorEl(element);
        }
      },
      handlePopoverClose,
    }));

    const Wrapper = component ?? 'div';

    return (
      <Wrapper>
        <Tooltip title={title}>
          <IconButton
            id={HelpID}
            className={classes?.iconButton}
            aria-label="help"
            onClick={handlePopoverOpen}
            {...iconButtonProps}
          >
            {icon ? icon : <HelpOutlineOutlined />}
          </IconButton>
        </Tooltip>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
            ...props?.anchorOrigin,
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
            ...props?.transformOrigin,
          }}
        >
          {children}
        </Popover>
      </Wrapper>
    );
  }
);

export default HelpPopover;
