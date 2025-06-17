import * as React from 'react';

import { useAuth } from '@/hooks/auth';

import AccountMetricsHeader from './AccountMetricsHeader';

const MainNav = (_props: React.HTMLAttributes<HTMLElement>) => {
  const { user } = useAuth();

  // Don't display metrics if user is not logged in
  if (!user) {
    return <div className="hidden flex-1 md:flex"></div>;
  }

  return (
    <div className="hidden flex-1 items-center justify-end pr-8 md:flex">
      <AccountMetricsHeader />
    </div>
  );
};

export default MainNav;
