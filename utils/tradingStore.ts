export function loadStorageItem<T = any>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (item === null || item === undefined) return defaultValue;
    return JSON.parse(item);
  } catch (e) {
    return defaultValue;
  }
}

export function saveStorageItem<T = any>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to storage:', e);
  }
}

export function getTraderStats() {
  const balance = loadStorageItem('rwams_wallet_balance', 10000.00);
  const closedTrades: any[] = loadStorageItem('rwams_closed_trades', []);
  const openOrders: any[] = loadStorageItem('rwams_open_positions', []);
  
  const trades = closedTrades.length + openOrders.length;
  const wins = closedTrades.filter((t: any) => t.result === 'WIN').length;
  const losses = closedTrades.filter((t: any) => t.result === 'LOSS').length;

  return {
    balance,
    trades,
    wins,
    losses
  };
}
