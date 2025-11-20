import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'interactive' | 'highlighted';
  className?: string;
}

export function Card({ children, variant = 'default', className = '' }: CardProps) {
  const baseStyles = 'bg-white rounded-lg border border-gray-200';

  const variantStyles = {
    default: 'shadow-sm',
    interactive: 'shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer',
    highlighted: 'shadow-md border-blue-300 bg-blue-50',
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`p-6 border-b border-gray-200 ${className}`}>{children}</div>;
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg ${className}`}>{children}</div>;
}
