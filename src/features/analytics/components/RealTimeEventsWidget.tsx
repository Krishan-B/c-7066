import { useWebSocket } from "@/hooks/useWebSocket";

const RealTimeEventsWidget = () => {
  const { accountMetrics, orderUpdates, positionUpdates } = useWebSocket();

  return (
    <div className="glass-card p-4 rounded-lg mb-4">
      <h2 className="text-lg font-semibold mb-2">Real-Time Events</h2>
      <div className="mb-2">
        <strong>Account Metrics:</strong>
        <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
          {JSON.stringify(accountMetrics, null, 2)}
        </pre>
      </div>
      <div className="mb-2">
        <strong>Order Updates:</strong>
        <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
          {JSON.stringify(orderUpdates, null, 2)}
        </pre>
      </div>
      <div>
        <strong>Position Updates:</strong>
        <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
          {JSON.stringify(positionUpdates, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default RealTimeEventsWidget;
