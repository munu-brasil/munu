import Navigator, { NavigatorProps } from 'components/UI/Navigator';
import { MenuCategories } from '@/lib/internal/constants';

export type MenuProps = NavigatorProps & {};

const Menu = ({ ...navprops }: MenuProps) => {
  return (
    <span className="no-print">
      <Navigator
        {...navprops}
        categories={MenuCategories}
        navigationPrefix="/"
      />
    </span>
  );
};

export default Menu;
