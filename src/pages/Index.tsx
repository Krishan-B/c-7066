
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Search, Bell, UserCircle, Menu, LineChart, BarChart2, RefreshCw, TrendingUp, Star, Plus, DollarSign, ChevronDown, LogOut } from "lucide-react";
import MarketStats from "@/components/MarketStats";
import WatchlistTable from "@/components/WatchlistTable";
import CryptoList from "@/components/CryptoList";
import TradingViewChart from "@/components/TradingViewChart";
import QuickTradePanel from "@/components/QuickTradePanel";
import NewsWidget from "@/components/NewsWidget";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";

const Index = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState({
    name: "Bitcoin",
    symbol: "BTCUSD",
    price: 67543.21,
    change: 2.4
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    // Show welcome toast when dashboard loads
    toast({
      title: "Welcome to TradePro",
      description: "Your dashboard is ready with real-time market data",
      duration: 5000,
    });
  }, [toast]);

  const handleAssetSelect = (asset: any) => {
    setSelectedAsset(asset);
    toast({
      title: `${asset.name} selected`,
      description: "Chart and trade panel updated",
      duration: 2000,
    });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-secondary sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center">
              <LineChart className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold ml-2">TradePro</h1>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#" className="text-foreground">Dashboard</a>
            <a href="#">Markets</a>
            <a href="#">Orders</a>
            <a href="#">Portfolio</a>
            <a href="#">Wallet</a>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Bell className="h-5 w-5" />
            </Button>
            {user ? (
              <>
                <span className="text-sm hidden md:block">{user.email}</span>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <UserCircle className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-muted-foreground">
                  <LogOut className="h-5 w-5" />
                </Button>
                <Button onClick={() => navigate('/dashboard')} size="sm">
                  Dashboard
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate('/auth')} size="sm">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className={`w-64 border-r border-secondary bg-background fixed inset-y-0 top-[65px] transition-transform duration-300 ease-in-out z-40 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="py-4 h-full flex flex-col">
            <div className="px-4 py-3">
              <div className="glass-card rounded-lg p-4 mb-4">
                <div className="text-xs text-muted-foreground mb-1">Total Balance</div>
                <div className="text-xl font-bold">$24,692.57</div>
                <div className="text-success text-xs flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +5.23% today
                </div>
              </div>
            </div>
            
            <nav className="space-y-1 px-2">
              <Button variant="ghost" className="w-full justify-start">
                <BarChart2 className="h-4 w-4 mr-3" />
                Dashboard
              </Button>
              <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                <LineChart className="h-4 w-4 mr-3" />
                Markets
              </Button>
              <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                <DollarSign className="h-4 w-4 mr-3" />
                Orders
              </Button>
              <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                <Star className="h-4 w-4 mr-3" />
                Portfolio
              </Button>
              <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                <RefreshCw className="h-4 w-4 mr-3" />
                Transactions
              </Button>
            </nav>
            
            <div className="mt-auto px-4 pb-4">
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" /> 
                Deposit Funds
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
          <div className="p-4 md:p-6">
            <div className="flex flex-col lg:flex-row justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Market Overview</h1>
                <p className="text-muted-foreground">Track, analyze and trade global markets</p>
              </div>
              <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                <Button variant="outline" size="sm" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </Button>
                <Button variant="default" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span>New Trade</span>
                </Button>
              </div>
            </div>
            
            <MarketStats />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="glass-card rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <h2 className="text-xl font-semibold">{selectedAsset.name} Chart</h2>
                      <div className="ml-4 text-sm">
                        <span className={`${selectedAsset.change >= 0 ? 'text-success' : 'text-warning'} font-medium`}>
                          {selectedAsset.change >= 0 ? '+' : ''}{selectedAsset.change}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <Button variant="ghost" size="sm">
                        1D
                      </Button>
                      <Button variant="ghost" size="sm">
                        1W
                      </Button>
                      <Button variant="ghost" size="sm" className="bg-secondary text-foreground">
                        1M
                      </Button>
                      <Button variant="ghost" size="sm">
                        1Y
                      </Button>
                      <Button variant="ghost" size="sm">
                        ALL
                      </Button>
                    </div>
                  </div>
                  <TradingViewChart symbol={selectedAsset.symbol} />
                </div>
                
                <div className="glass-card rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Watchlist</h2>
                    <Button variant="ghost" size="sm">
                      <Plus className="h-4 w-4 mr-2" /> Add Asset
                    </Button>
                  </div>
                  <WatchlistTable onAssetSelect={handleAssetSelect} />
                </div>
              </div>
              
              <div>
                <QuickTradePanel asset={selectedAsset} />
                
                <div className="glass-card rounded-lg p-4 mt-6">
                  <h2 className="text-xl font-semibold mb-4">Market News</h2>
                  <NewsWidget />
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Tabs defaultValue="crypto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Top Markets</h2>
                  <TabsList>
                    <TabsTrigger value="crypto">Crypto</TabsTrigger>
                    <TabsTrigger value="stocks">Stocks</TabsTrigger>
                    <TabsTrigger value="forex">Forex</TabsTrigger>
                    <TabsTrigger value="commodities">Commodities</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="crypto">
                  <CryptoList />
                </TabsContent>
                <TabsContent value="stocks">
                  <div className="glass-card p-6 rounded-lg">
                    <p className="text-muted-foreground text-center">Connect your API key to access stocks data</p>
                  </div>
                </TabsContent>
                <TabsContent value="forex">
                  <div className="glass-card p-6 rounded-lg">
                    <p className="text-muted-foreground text-center">Connect your API key to access forex data</p>
                  </div>
                </TabsContent>
                <TabsContent value="commodities">
                  <div className="glass-card p-6 rounded-lg">
                    <p className="text-muted-foreground text-center">Connect your API key to access commodities data</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
