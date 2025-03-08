import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DappProvider } from "@multiversx/sdk-dapp/wrappers";
import { TransactionsToastList } from "@multiversx/sdk-dapp/UI";
import { SignTransactionsModals } from "@multiversx/sdk-dapp/UI";
import { NotificationModal } from "@multiversx/sdk-dapp/UI";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Custom network configuration with WalletConnect V2 Project ID
const customNetworkConfig = {
  name: 'customConfig',
  walletConnectV2ProjectId: '0ba22f1b579463656594825519834bb8'
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DappProvider
        environment="testnet"
        customNetworkConfig={customNetworkConfig}
      >
        <TransactionsToastList />
        <NotificationModal />
        <SignTransactionsModals />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DappProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
