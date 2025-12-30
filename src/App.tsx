
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
import Contact from './pages/Contact';

import FloatingWhatsApp from './components/FloatingWhatsApp';
import CartDrawer from './components/CartDrawer';

function App() {
  return (
    <CartProvider>
      <CartDrawer />
      <Router>
        <FloatingWhatsApp />
        <Routes>
          {/* Public Routes */}
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

          {/* New Arrivals */}
          <Route path="/new-arrivals" element={<Shop pageTitle="New Arrivals" pageDescription="Be the first to wear our latest designs." />} />

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
