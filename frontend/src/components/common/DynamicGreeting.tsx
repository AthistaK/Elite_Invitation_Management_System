import React from 'react';

interface DynamicGreetingProps {
  name: string;
  isChairman?: boolean;
}

export const DynamicGreeting: React.FC<DynamicGreetingProps> = ({ name, isChairman }) => {
  const getGreetingPrefix = (): string => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  };

  const prefix = getGreetingPrefix();
  const displayName = isChairman ? `Chairman ${name}` : name;

  return (
    <span>
      {prefix}, <strong className="text-slate-800 font-semibold">{displayName || 'User'}</strong>
    </span>
  );
};
