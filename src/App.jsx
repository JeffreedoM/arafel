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

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/admin" element={<Navigate to="/login" replace />} />

      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/" element={<Home />} />
      <Route path="/campaign/:id" element={<CampaignPage />} />
      <Route path="/product/:id" element={<ProductPage />} />

      {/* Protected dashboard */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="products">
            <Route index element={<Products />} />
            <Route path="create" element={<CreateProduct />} />
            <Route path=":id/edit" element={<EditProduct />} />
            <Route path=":id" element={<ProductDetails />} />
          </Route>

          <Route path="campaigns">
            <Route index element={<Campaign />} />
            <Route path="new" element={<NewCampaign />} />
            <Route path=":id" element={<CampaignDetails />} />
          </Route>

          <Route path="page-builder">
            <Route index element={<PageBuilder />} />
            {/* <Route path="create" element={<CreateProduct />} />
            <Route path=":id/edit" element={<EditProduct />} />
            <Route path=":id" element={<ProductDetails />} /> */}
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
