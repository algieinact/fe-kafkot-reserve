import { ReactNode } from "react";

// Props interface for MenuCard
interface MenuCardProps {
  children?: ReactNode;
}

// MenuCard Component - Specialized for menu items
const MenuCard: React.FC<MenuCardProps> = ({ children }) => {
  return (
    <div className="rounded-[1rem] xl:rounded-[2rem] border border-brand-100 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
      {children}
    </div>
  );
};

export default MenuCard;
