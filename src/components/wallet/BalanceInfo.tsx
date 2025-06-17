import AvailableBalance from './AvailableBalance';
import PaymentMethods from './PaymentMethods';

const BalanceInfo = () => {
  return (
    <div className="space-y-6">
      <AvailableBalance />
      <PaymentMethods />
    </div>
  );
};

export default BalanceInfo;
