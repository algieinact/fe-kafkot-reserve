import { ReactNode } from "react";

// Props interfaces for Card, CardTitle, and CardDescription
interface CardProps {
  children?: ReactNode; // Optional additional content
}

interface CardTitleProps {
  children: ReactNode;
}

interface CardDescriptionProps {
  children: ReactNode;
}

// Card Component
const Card: React.FC<CardProps> = ({ children }) => {
  return (
    <div className="rounded-[1rem] xl:rounded-[1.5rem] border border-brand-100 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden p-6">
      {children}
    </div>
  );
};

// CardTitle Component
const CardTitle: React.FC<CardTitleProps> = ({ children }) => {
  return (
    <h4 className="mb-1 font-medium text-gray-800 text-theme-xl dark:text-white/90">
      {children}
    </h4>
  );
};

// CardDescription Component
const CardDescription: React.FC<CardDescriptionProps> = ({ children }) => {
  return <p className="text-sm text-gray-500 dark:text-gray-400">{children}</p>;
};

// Named exports for better flexibility
export { Card, CardTitle, CardDescription };
