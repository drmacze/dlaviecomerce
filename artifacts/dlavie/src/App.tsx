import { Switch, Route, Router as WouterRouter } from "wouter";
import { DlavieProviders } from "@/components/dlavie-providers";
import { DlavieExperienceShell } from "@/components/dlavie-experience-shell";
import { AmbientBg } from "@/components/ambient-bg";
import { DlavieAlertCenter } from "@/components/dlavie-alert-center";
import { RuntimeControlBanner } from "@/components/runtime-control-banner";
import { DlavieAssetBoot } from "@/components/dlavie-asset-boot";
import { AccountShortcut } from "@/components/account-shortcut";
import { DlavieErrorBoundary } from "@/components/dlavie-error-boundary";
import { AuthRouteGuard } from "@/components/auth-route-guard";

import { lazy, Suspense, type ReactNode } from "react";

const Home = lazy(() => import("@/pages/index"));
const Login = lazy(() => import("@/pages/login"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Products = lazy(() => import("@/pages/products"));
const ProductDetail = lazy(() => import("@/pages/product/[slug]"));
const Cart = lazy(() => import("@/pages/cart"));
const Checkout = lazy(() => import("@/pages/checkout"));
const Orders = lazy(() => import("@/pages/orders"));
const OrderSuccess = lazy(() => import("@/pages/order/success"));
const Wallet = lazy(() => import("@/pages/wallet"));
const WalletFinish = lazy(() => import("@/pages/wallet/finish"));
const Profile = lazy(() => import("@/pages/profile"));
const Security = lazy(() => import("@/pages/security"));
const Rewards = lazy(() => import("@/pages/rewards"));
const Referral = lazy(() => import("@/pages/referral"));
const Affiliate = lazy(() => import("@/pages/affiliate"));
const Premium = lazy(() => import("@/pages/premium"));
const Gift = lazy(() => import("@/pages/gift"));
const Checkin = lazy(() => import("@/pages/checkin"));
const Ai = lazy(() => import("@/pages/ai"));
const AiHistory = lazy(() => import("@/pages/ai/history"));
const Panel = lazy(() => import("@/pages/panel"));
const AdminDashboard = lazy(() => import("@/pages/admin"));
const AdminHub = lazy(() => import("@/pages/admin/hub"));
const AdminOrders = lazy(() => import("@/pages/admin/orders"));
const AdminPanelOrders = lazy(() => import("@/pages/admin/panel-orders"));
const AdminProducts = lazy(() => import("@/pages/admin/products"));
const AdminProductEdit = lazy(() => import("@/pages/admin/products/[id]"));
const AdminUsers = lazy(() => import("@/pages/admin/users"));
const AdminTopups = lazy(() => import("@/pages/admin/topups"));
const AdminCoupons = lazy(() => import("@/pages/admin/coupons"));
const AdminReferrals = lazy(() => import("@/pages/admin/referrals"));
const AdminSecurity = lazy(() => import("@/pages/admin/security"));
const AdminSignal = lazy(() => import("@/pages/admin/signal"));
const AdminSec = lazy(() => import("@/pages/admin/sec"));
const AdminIntelligence = lazy(() => import("@/pages/admin/intelligence"));
const AdminOrderPulse = lazy(() => import("@/pages/admin/order-pulse"));
const AuthConfirmed = lazy(() => import("@/pages/auth/confirmed"));
const ResetPassword = lazy(() => import("@/pages/reset-password"));
const TelegramLogin = lazy(() => import("@/pages/telegram-login"));
const TelegramAdmin = lazy(() => import("@/pages/telegram-admin"));
const Ppob = lazy(() => import("@/pages/ppob"));
const PpobOrders = lazy(() => import("@/pages/ppob/orders"));
const Maintenance = lazy(() => import("@/pages/maintenance"));
const PreviewAmbient = lazy(() => import("@/pages/preview/ambient"));
const NotFound = lazy(() => import("@/pages/not-found"));

function RouteFallback() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#050504] p-6 text-[#e5e4e2]">
      <div className="dlv-command-card rounded-[2rem] px-6 py-5 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c7a329]">
          DLAVIE
        </p>
        <p className="mt-2 text-sm font-black">Memuat pengalaman...</p>
      </div>
    </main>
  );
}

import "./styles/globals.css";
import "./styles/ambient.css";
import "./styles/cosmic.css";
import "./styles/dlavie-system.css";
import "./styles/dlavie-experience.css";
import "./styles/dlavie-premium-v2.css";
import "./styles/auth-motion.css";
import "./styles/dlavie-hypermotion.css";

function AppShell({ children }: { children: ReactNode }) {
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
    <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
      <AppShell>
        <Suspense fallback={<RouteFallback />}>
          <Router />
        </Suspense>
      </AppShell>
    </WouterRouter>
  );
}
