import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import AdminLayout from './components/Admin/AdminLayout'
import AdminRoute from './components/Admin/AdminRoute'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import CheckoutSuccess from './pages/CheckoutSuccess'
import Payment from './pages/Payment'
import PaymentSuccess from './pages/PaymentSuccess'
import Profile from './pages/Profile'
import Stores from './pages/Stores'
import Login from './pages/Login'
import Register from './pages/Register'
import Favorites from './pages/Favorites'
import AdminDashboard from './pages/Admin/AdminDashboard'
import AdminProducts from './pages/Admin/AdminProducts'
import AdminProductForm from './pages/Admin/AdminProductForm'
import AdminCategories from './pages/Admin/AdminCategories'
import AdminBrands from './pages/Admin/AdminBrands'
import AdminOrders from './pages/Admin/AdminOrders'
import AdminOrderDetail from './pages/Admin/AdminOrderDetail'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { FavoritesProvider } from './context/FavoritesContext'
import TelegramWrapper from './components/TelegramWrapper/TelegramWrapper'

function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <CartProvider>
        <TelegramWrapper>
        <Router>
          <Routes>
            {/* Admin routes */}
            <Route path="/admin/*" element={
              <AdminRoute>
                <AdminLayout>
                  <Routes>
                    <Route path="" element={<AdminDashboard />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="products/new" element={<AdminProductForm />} />
                    <Route path="products/:id/edit" element={<AdminProductForm />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="brands" element={<AdminBrands />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="orders/:id" element={<AdminOrderDetail />} />
                  </Routes>
                </AdminLayout>
              </AdminRoute>
            } />
            
            {/* Public routes */}
            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/catalog/:category" element={<Catalog />} />
                  <Route path="/product/:id" element={<Product />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/checkout/success" element={<CheckoutSuccess />} />
                  <Route path="/payment" element={<Payment />} />
                  <Route path="/payment/success" element={<PaymentSuccess />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/stores" element={<Stores />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Routes>
              </Layout>
            } />
          </Routes>
        </Router>
        </TelegramWrapper>
        </CartProvider>
      </FavoritesProvider>
    </AuthProvider>
  )
}

export default App
