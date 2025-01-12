import  { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Table, Form, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/authUtils';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchUsers();
      fetchCars();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(res.data);
    } catch (error) {
      setError('Error fetching users');
      console.error('Error fetching users:', error);
    }
  };

  const fetchCars = async () => {
    try {
      const res = await axios.get('/api/cars', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCars(res.data);
    } catch (error) {
      setError('Error fetching cars');
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusChange = async (userId, newStatus) => {
    try {
      await axios.put(`/api/users/${userId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchUsers();
    } catch (error) {
      setError('Error updating user status');
      console.error('Error updating user status:', error);
    }
  };

  const handleCarStatusChange = async (carId, newStatus) => {
    try {
      await axios.put(`/api/cars/${carId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchCars();
    } catch (error) {
      setError('Error updating car status');
      console.error('Error updating car status:', error);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (user.role !== 'admin') {
    return <Alert variant="danger">Access denied. Admin privileges required.</Alert>;
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row className="mb-5">
        <Col>
          <h3>User Management</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.status}</td>
                  <td>
                    <Form.Select
                      value={user.status}
                      onChange={(e) => handleUserStatusChange(user._id, e.target.value)}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </Form.Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

      <Row>
        <Col>
          <h3>Car Listing Management</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Brand</th>
                <th>Model</th>
                <th>Year</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => (
                <tr key={car._id}>
                  <td>{car.brand}</td>
                  <td>{car.model}</td>
                  <td>{car.year}</td>
                  <td>${car.price}</td>
                  <td>{car.status}</td>
                  <td>
                    <Form.Select
                      value={car.status}
                      onChange={(e) => handleCarStatusChange(car._id, e.target.value)}
                    >
                      <option value="available">Available</option>
                      <option value="sold">Sold</option>
                      <option value="pending">Pending</option>
                    </Form.Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;

