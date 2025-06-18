import { LineChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/auth';

const ApplicationLogo = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const linkTo = user ? '/dashboard' : '/';

  const handleLogoClick = () => {
    navigate(linkTo);
  };

  return (
    <div onClick={handleLogoClick} className="mr-4 flex cursor-pointer items-center space-x-2">
      <LineChart className="h-8 w-8 text-primary" />
      <span className="text-xl font-bold text-foreground sm:inline-block">TradePro</span>
    </div>
  );
};

export default ApplicationLogo;
