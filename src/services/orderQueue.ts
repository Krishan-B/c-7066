import { Trade } from './trades/types';

interface QueuedOrder {
  id: string;
  symbol: string;
  direction: 'buy' | 'sell';
  units: number;
  price: number;
  remainingUnits: number;
  timestamp: number;
  userId: string;
  stopLoss?: number;
  takeProfit?: number;
  expiration?: string;
}

class OrderQueue {
  private marketOrders: QueuedOrder[] = [];
  private limitOrders: QueuedOrder[] = [];

  addMarketOrder(order: Omit<QueuedOrder, 'id' | 'timestamp' | 'remainingUnits'>) {
    const queuedOrder: QueuedOrder = {
      ...order,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      remainingUnits: order.units
    };
    this.marketOrders.push(queuedOrder);
    return queuedOrder.id;
  }

  addLimitOrder(order: Omit<QueuedOrder, 'id' | 'timestamp' | 'remainingUnits'>) {
    const queuedOrder: QueuedOrder = {
      ...order,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      remainingUnits: order.units
    };
    this.limitOrders.push(queuedOrder);
    this.limitOrders.sort((a, b) => {
      // Sort buy orders by highest price first
      if (a.direction === 'buy' && b.direction === 'buy') {
        return b.price - a.price;
      }
      // Sort sell orders by lowest price first
      if (a.direction === 'sell' && b.direction === 'sell') {
        return a.price - b.price;
      }
      return a.timestamp - b.timestamp;
    });
    return queuedOrder.id;
  }

  processMarketOrder(orderId: string, fillPrice: number, fillUnits: number): boolean {
    const orderIndex = this.marketOrders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) return false;

    const order = this.marketOrders[orderIndex];
    order.remainingUnits -= fillUnits;

    if (order.remainingUnits <= 0) {
      this.marketOrders.splice(orderIndex, 1);
    }

    return true;
  }

  processLimitOrder(orderId: string, fillPrice: number, fillUnits: number): boolean {
    const orderIndex = this.limitOrders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) return false;

    const order = this.limitOrders[orderIndex];
    order.remainingUnits -= fillUnits;

    if (order.remainingUnits <= 0) {
      this.limitOrders.splice(orderIndex, 1);
    }

    return true;
  }

  getMarketOrders(): QueuedOrder[] {
    return [...this.marketOrders];
  }

  getLimitOrders(): QueuedOrder[] {
    return [...this.limitOrders];
  }

  clearExpiredOrders(currentTime: number = Date.now()) {
    this.limitOrders = this.limitOrders.filter(order => {
      if (!order.expiration) return true;
      const expirationTime = new Date(order.expiration).getTime();
      return expirationTime > currentTime;
    });
  }
}

export const orderQueue = new OrderQueue();