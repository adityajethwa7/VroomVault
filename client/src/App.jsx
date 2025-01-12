
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BuyerDashboard from './pages/BuyerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CarListing from './pages/CarListing';
import AuthProvider from './context/AuthProvider';
import { useAuth } from './context/authUtils';
import 'bootstrap/dist/css/bootstrap.min.css';
import PropTypes from 'prop-types';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || (requiredRole && user.role !== requiredRole)) {
    return <Navigate to="/login" />;
  }

  return children;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.string
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Header />
          <Container className="flex-grow-1 mt-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/buyer-dashboard" 
                element={
                  <PrivateRoute requiredRole="buyer">
                    <BuyerDashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/seller-dashboard" 
                element={
                  <PrivateRoute requiredRole="seller">
                    <SellerDashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/admin-dashboard" 
                element={
                  <PrivateRoute requiredRole="admin">
                    <AdminDashboard />
                  </PrivateRoute>
                } 
              />
              <Route path="/car/:id" element={<CarListing />} />
            </Routes>
          </Container>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

