
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Login from './pages/Admin/Login';
import AdminLayout from './pages/Admin/Layout';
import Dashboard from './pages/Admin/Dashboard';
import Products from './pages/Admin/Products';
import Orders from './pages/Admin/Orders';
import ProductPage from './pages/Product';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Contact from './pages/CustomerCare/Contact';

// New Pages
import Shipping from './pages/CustomerCare/Shipping';
import Returns from './pages/CustomerCare/Returns';
import SizeGuide from './pages/CustomerCare/SizeGuide';
import TrackOrder from './pages/CustomerCare/TrackOrder';
import FAQ from './pages/CustomerCare/FAQ';
import Terms from './pages/Legal/Terms';
import Privacy from './pages/Legal/Privacy';
import CookiesPage from './pages/Legal/Cookies';
import ReturnPolicy from './pages/Legal/ReturnPolicy';

import FloatingWhatsApp from './components/FloatingWhatsApp';
import CartDrawer from './components/CartDrawer';
import PublicLayout from './components/PublicLayout';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <CartProvider>
      <CartDrawer />
      <Router>
        <ScrollToTop />
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
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/contact" element={<Contact />} />

            {/* New Customer Care Pages */}
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/size-guide" element={<SizeGuide />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/faq" element={<FAQ />} />

            {/* New Legal Pages */}
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/cookies" element={<CookiesPage />} />
            <Route path="/return-policy" element={<ReturnPolicy />} />

            {/* New Arrivals */}
            <Route path="/new-arrivals" element={<Shop pageTitle="New Arrivals" pageDescription="Be the first to wear our latest designs." />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
          </Route>
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
