export type NotificationAction = {
  name: string;
  onClick?: () => void;
  href?: string;
  prefix?: string;
  suffix?: string;
  rel?: string;
};

export type NotificationMessage = {
  message: string;
  actions?: Array<NotificationAction>;
  type?: string;
  temporary?: boolean;
};
