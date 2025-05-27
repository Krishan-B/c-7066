type RouteKey = keyof typeof ROUTE_CONFIG;

// Routes configuration with their corresponding import functions
const ROUTE_CONFIG = {
  'markets': () => import(/* webpackChunkName: "markets" */ '@/pages/Markets'),
  'portfolio': () => import(/* webpackChunkName: "portfolio" */ '@/pages/Portfolio'),
  'orders': () => import(/* webpackChunkName: "orders" */ '@/pages/Orders'),
  'news': () => import(/* webpackChunkName: "news" */ '@/pages/News'),
  'wallet': () => import(/* webpackChunkName: "wallet" */ '@/pages/Wallet'),
  'account': () => import(/* webpackChunkName: "account" */ '@/pages/Account'),
  'profile': () => import(/* webpackChunkName: "profile" */ '@/pages/ProfilePage')
} as const;

// Priority order for preloading routes
const PRELOAD_PRIORITY: RouteKey[] = ['markets', 'portfolio', 'orders'];

export const preloadRoute = (route: RouteKey | string | null | undefined) => {
  if (!route || !(route in ROUTE_CONFIG)) return;
  
  const importFn = ROUTE_CONFIG[route as RouteKey];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  importFn()
    .catch((error: unknown) => {
      if (!controller.signal.aborted) {
        console.warn(`Failed to preload route ${route}:`, error);
      }
    })
    .finally(() => clearTimeout(timeoutId));
};

export const preloadRoutes = () => {
  // Preload high-priority routes during idle time
  let index = 0;
  const preloadNext = () => {
    if (index < PRELOAD_PRIORITY.length) {
      const route = PRELOAD_PRIORITY[index++];
      preloadRoute(route);
      window.requestIdleCallback(preloadNext, { timeout: 1000 });
    }
  };

  // Start preloading
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preloadNext, { timeout: 1000 });
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(preloadNext, 1000);
  }
};
