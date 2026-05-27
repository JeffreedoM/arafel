import { Routes, Route, Navigate } from "react-router";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import Dashboard from "./pages/admin/Dashboard";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import NotFound from "./pages/public/NotFound";
import Products from "./pages/admin/Products/Products";
import CreateProduct from "./pages/admin/Products/CreateProduct";
import ProductDetails from "./pages/admin/Products/ProductDetails";
import EditProduct from "./pages/admin/Products/EditProduct";
import PageBuilder from "./pages/admin/PageBuilder/PageBuilder";
import Home from "./pages/public/Home/Home";
import CampaignPage from "./pages/public/CampaignPage/CampaignPage";
import Campaign from "./pages/admin/Campaigns/Campaign";
import NewCampaign from "./pages/admin/Campaigns/NewCampaign";
import CampaignDetails from "./pages/admin/Campaigns/CampaignDetails";
import ProductPage from "./pages/public/ProductPage/ProductPage";
import ProductsPage from "./pages/public/Products/Products";
import CategoriesPage from "./pages/public/Products/Categories";
import TransactionManager from "./pages/admin/TransactionManager/TransactionManager";
import SalesHistory from "./pages/admin/TransactionManager/SalesHistory";

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/admin" element={<Navigate to="/login" replace />} />

      <Route
        path="/login"
        element={user ? <Navigate to="/admin/dashboard" replace /> : <Login />}
      />

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/" element={<Home />} />
      <Route path="/campaign/:id" element={<CampaignPage />} />
      <Route path="/product/:id" element={<ProductPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/categories" element={<CategoriesPage />} />

      {/* Protected dashboard */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          {/* URL nito ay magiging: /admin/dashboard */}
          <Route path="dashboard" element={<Dashboard />} />

          {/* URL Prefix: /admin/transactions/* */}
          <Route path="transactions">
            <Route index element={<TransactionManager />} />
            <Route path="orders" element={<TransactionManager />} />
            <Route path="sales-history" element={<SalesHistory />} />
            {/* /admin/transactions */}
          </Route>

          {/* URL Prefix: /admin/products/* */}
          <Route path="products">
            <Route index element={<Products />} /> {/* /admin/products */}
            <Route path="create" element={<CreateProduct />} />
            {/* /admin/products/create */}
            <Route path=":id/edit" element={<EditProduct />} />
            {/* /admin/products/:id/edit */}
            <Route path=":id" element={<ProductDetails />} />
            {/* /admin/products/:id */}
          </Route>

          {/* URL Prefix: /admin/campaigns/* */}
          <Route path="campaigns">
            <Route index element={<Campaign />} /> {/* /admin/campaigns */}
            <Route path="new" element={<NewCampaign />} />
            {/* /admin/campaigns/new */}
            <Route path=":id" element={<CampaignDetails />} />
            {/* /admin/campaigns/:id */}
          </Route>

          {/* URL Prefix: /admin/page-builder */}
          <Route path="page-builder">
            <Route index element={<PageBuilder />} />
            {/* /admin/page-builder */}
          </Route>
        </Route>
      </Route>
      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
