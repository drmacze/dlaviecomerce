import { Switch, Route, Router as WouterRouter } from 'wouter';
import { DlavieProviders } from '@/components/dlavie-providers';
import { DlavieExperienceShell } from '@/components/dlavie-experience-shell';
import { AmbientBg } from '@/components/ambient-bg';
import { DlavieAlertCenter } from '@/components/dlavie-alert-center';
import { RuntimeControlBanner } from '@/components/runtime-control-banner';
import { DlavieAssetBoot } from '@/components/dlavie-asset-boot';
import { AccountShortcut } from '@/components/account-shortcut';
import { DlavieErrorBoundary } from '@/components/dlavie-error-boundary';
import { AuthRouteGuard } from '@/components/auth-route-guard';

import Home from '@/pages/index';
import Login from '@/pages/login';
import Dashboard from '@/pages/dashboard';
import Products from '@/pages/products';
import ProductDetail from '@/pages/product/[slug]';
import Cart from '@/pages/cart';
import Checkout from '@/pages/checkout';
import Orders from '@/pages/orders';
import OrderSuccess from '@/pages/order/success';
import Wallet from '@/pages/wallet';
import WalletFinish from '@/pages/wallet/finish';
import Profile from '@/pages/profile';
import Security from '@/pages/security';
import Rewards from '@/pages/rewards';
import Referral from '@/pages/referral';
import Affiliate from '@/pages/affiliate';
import Premium from '@/pages/premium';
import Gift from '@/pages/gift';
import Checkin from '@/pages/checkin';
import Ai from '@/pages/ai';
import AiHistory from '@/pages/ai/history';
import Panel from '@/pages/panel';
import AdminDashboard from '@/pages/admin';
import AdminHub from '@/pages/admin/hub';
import AdminOrders from '@/pages/admin/orders';
import AdminPanelOrders from '@/pages/admin/panel-orders';
import AdminProducts from '@/pages/admin/products';
import AdminProductEdit from '@/pages/admin/products/[id]';
import AdminUsers from '@/pages/admin/users';
import AdminTopups from '@/pages/admin/topups';
import AdminCoupons from '@/pages/admin/coupons';
import AdminReferrals from '@/pages/admin/referrals';
import AdminSecurity from '@/pages/admin/security';
import AdminSignal from '@/pages/admin/signal';
import AdminSec from '@/pages/admin/sec';
import AdminIntelligence from '@/pages/admin/intelligence';
import AdminOrderPulse from '@/pages/admin/order-pulse';
import AuthConfirmed from '@/pages/auth/confirmed';
import ResetPassword from '@/pages/reset-password';
import TelegramLogin from '@/pages/telegram-login';
import TelegramAdmin from '@/pages/telegram-admin';
import Ppob from '@/pages/ppob';
import PpobOrders from '@/pages/ppob/orders';
import Maintenance from '@/pages/maintenance';
import PreviewAmbient from '@/pages/preview/ambient';
import NotFound from '@/pages/not-found';

import './styles/globals.css';
import './styles/ambient.css';
import './styles/cosmic.css';
import './styles/dlavie-system.css';
import './styles/dlavie-experience.css';
import './styles/dlavie-premium-v2.css';
import './styles/auth-motion.css';

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <DlavieProviders>
      <DlavieExperienceShell>
        <AmbientBg />
        <DlavieAlertCenter />
        <RuntimeControlBanner />
        <DlavieAssetBoot routeLoading={false} authChecking={false} />
        <AccountShortcut />
        <DlavieErrorBoundary>
          <AuthRouteGuard>
            <div className="relative z-10 transition-opacity duration-300">
              {children}
            </div>
          </AuthRouteGuard>
        </DlavieErrorBoundary>
      </DlavieExperienceShell>
    </DlavieProviders>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/products" component={Products} />
      <Route path="/product/:slug" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/orders" component={Orders} />
      <Route path="/order/success" component={OrderSuccess} />
      <Route path="/wallet" component={Wallet} />
      <Route path="/wallet/finish" component={WalletFinish} />
      <Route path="/profile" component={Profile} />
      <Route path="/security" component={Security} />
      <Route path="/rewards" component={Rewards} />
      <Route path="/referral" component={Referral} />
      <Route path="/affiliate" component={Affiliate} />
      <Route path="/premium" component={Premium} />
      <Route path="/gift" component={Gift} />
      <Route path="/checkin" component={Checkin} />
      <Route path="/ai" component={Ai} />
      <Route path="/ai/history" component={AiHistory} />
      <Route path="/panel" component={Panel} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/hub" component={AdminHub} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/panel-orders" component={AdminPanelOrders} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/products/:id" component={AdminProductEdit} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/topups" component={AdminTopups} />
      <Route path="/admin/coupons" component={AdminCoupons} />
      <Route path="/admin/referrals" component={AdminReferrals} />
      <Route path="/admin/security" component={AdminSecurity} />
      <Route path="/admin/signal" component={AdminSignal} />
      <Route path="/admin/sec" component={AdminSec} />
      <Route path="/admin/intelligence" component={AdminIntelligence} />
      <Route path="/admin/order-pulse" component={AdminOrderPulse} />
      <Route path="/auth/confirmed" component={AuthConfirmed} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/telegram-login" component={TelegramLogin} />
      <Route path="/telegram-admin" component={TelegramAdmin} />
      <Route path="/ppob" component={Ppob} />
      <Route path="/ppob/orders" component={PpobOrders} />
      <Route path="/maintenance" component={Maintenance} />
      <Route path="/preview/ambient" component={PreviewAmbient} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, '') || ''}>
      <AppShell>
        <Router />
      </AppShell>
    </WouterRouter>
  );
}
