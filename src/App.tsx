import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductPage from './pages/Product';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import About from './pages/About';
import Contact from './pages/CustomerCare/Contact';

// Auth Pages
import CustomerLogin from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Account from './pages/Account/Profile';

// Admin Pages
import AdminLogin from './pages/Admin/Login';
import AdminLayout from './pages/Admin/Layout';
import Dashboard from './pages/Admin/Dashboard';
import Products from './pages/Admin/Products';
import Categories from './pages/Admin/Categories';
import Orders from './pages/Admin/Orders';
import Coupons from './pages/Admin/Coupons';
import Inventory from './pages/Admin/Inventory';
import Customers from './pages/Admin/Customers';
import ReviewsAdmin from './pages/Admin/Reviews';

// Customer Care Pages
import Shipping from './pages/CustomerCare/Shipping';
import Returns from './pages/CustomerCare/Returns';
import SizeGuide from './pages/CustomerCare/SizeGuide';
import TrackOrder from './pages/CustomerCare/TrackOrder';
import FAQ from './pages/CustomerCare/FAQ';

// Legal Pages
import Terms from './pages/Legal/Terms';
import Privacy from './pages/Legal/Privacy';
import CookiesPage from './pages/Legal/Cookies';
import ReturnPolicy from './pages/Legal/ReturnPolicy';

// Components
import FloatingWhatsApp from './components/FloatingWhatsApp';
import CartDrawer from './components/CartDrawer';
import PublicLayout from './components/PublicLayout';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <CartDrawer />
          <FloatingWhatsApp />
          <Routes>
            {/* Public Routes with Header & Footer */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/sarees" element={<Shop forcedCategory="sarees" pageTitle="Sarees" pageDescription="Beautiful handcrafted sarees." />} />
              <Route path="/kurtis" element={<Shop forcedCategory="kurtis" pageTitle="Kurtis" pageDescription="Stylish and comfortable kurtis." />} />
              <Route path="/dresses" element={<Shop forcedCategory="dresses" pageTitle="Dresses" pageDescription="Modest and elegant dresses." />} />
              <Route path="/coord-sets" element={<Shop forcedCategory="coord-sets" pageTitle="Co-ord Sets" pageDescription="Matching sets for easy style." />} />
              <Route path="/category/:slug" element={<Shop />} />
              <Route path="/product/:slug" element={<ProductPage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />

              {/* Customer Auth & Account Routes */}
              <Route path="/login" element={<CustomerLogin />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/account" element={<Account />} />
              <Route path="/account/orders" element={<Account />} />
              <Route path="/account/addresses" element={<Account />} />

              {/* Customer Care Pages */}
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/size-guide" element={<SizeGuide />} />
              <Route path="/track-order" element={<TrackOrder />} />
              <Route path="/faq" element={<FAQ />} />

              {/* Legal Pages */}
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/cookies" element={<CookiesPage />} />
              <Route path="/return-policy" element={<ReturnPolicy />} />

              {/* New Arrivals */}
              <Route path="/new-arrivals" element={<Shop pageTitle="New Arrivals" pageDescription="Be the first to wear our latest designs." />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="categories" element={<Categories />} />
              <Route path="orders" element={<Orders />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="coupons" element={<Coupons />} />
              <Route path="customers" element={<Customers />} />
              <Route path="reviews" element={<ReviewsAdmin />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
