import Navigator, { NavigatorProps } from 'components/UI/Navigator';
import { MenuCategories } from '@/lib/internal/constants';
import { validateResorcePermission } from '@munu/core-lib/repo/session';

export type MenuProps = NavigatorProps & {};

const Menu = ({ ...navprops }: MenuProps) => {
  const menu = MenuCategories.filter((qam) =>
    validateResorcePermission(qam?.permissions ?? [])
  ).map((qam) => {
    return {
      ...qam,
      children: qam.children.filter((q) =>
        validateResorcePermission(q?.permissions ?? [])
      ),
    };
  });

  return (
    <span className="no-print">
      <Navigator {...navprops} categories={menu} navigationPrefix="/" />
    </span>
  );
};

export default Menu;
