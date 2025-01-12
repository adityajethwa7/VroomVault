import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/authUtils';
import ImageUpload from '../components/ImageUpload';

const SellerDashboard = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [newCar, setNewCar] = useState({
    brand: '',
    model: '',
    year: '',
    mileage: '',
    price: '',
    condition: '',
    description: '',
    images: [],
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'seller') {
      navigate('/');
    } else {
      fetchSellerCars();
    }
  }, [user, navigate]);

  const fetchSellerCars = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/cars/seller', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCars(res.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching seller cars:', error.response ? error.response.data : error.message);
      setError('Failed to load your car listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingCar) {
      setEditingCar({ ...editingCar, [name]: value });
    } else {
      setNewCar({ ...newCar, [name]: value });
    }
  };

  const handleImageUpload = (uploadedImages) => {
    if (editingCar) {
      setEditingCar({ ...editingCar, images: [...editingCar.images, ...uploadedImages] });
    } else {
      setNewCar({ ...newCar, images: [...newCar.images, ...uploadedImages] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const carData = editingCar || newCar;
    if (carData.images.length === 0) {
      setError('Please upload at least one image of the car.');
      return;
    }
    try {
      const formData = new FormData();
      Object.keys(carData).forEach(key => {
        if (key === 'images') {
          carData.images.forEach((image) => {
            formData.append(`images`, image);
          });
        } else {
          formData.append(key, carData[key]);
        }
      });

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      let response;
      if (editingCar) {
        response = await axios.put(`/api/cars/${editingCar._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        response = await axios.post('/api/cars', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
      }
      console.log('Car operation successful:', response.data);
      setNewCar({
        brand: '',
        model: '',
        year: '',
        mileage: '',
        price: '',
        condition: '',
        description: '',
        images: [],
      });
      setEditingCar(null);
      setShowModal(false);
      fetchSellerCars();
    } catch (error) {
      console.error('Error with car operation:', error.response ? error.response.data : error.message);
      setError('Failed to perform car operation. Please try again.');
    }
  };

  const handleDelete = async (carId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      await axios.delete(`/api/cars/${carId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchSellerCars();
    } catch (error) {
      console.error('Error deleting car listing:', error.response ? error.response.data : error.message);
      setError('Failed to delete car listing. Please try again.');
    }
  };

  const handleEdit = (car) => {
    setEditingCar(car);
    setShowModal(true);
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

  return (
    <Container>
      <h2 className="mb-4">Seller Dashboard</h2>
      <Button variant="primary" className="mb-4" onClick={() => setShowModal(true)}>
        Add New Listing
      </Button>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        {cars.map((car) => (
          <Col key={car._id} md={4} className="mb-4">
            <Card>
              <Card.Img variant="top" src={car.images[0] || '/placeholder.svg'} />
              <Card.Body>
                <Card.Title>{car.brand} {car.model}</Card.Title>
                <Card.Text>
                  Year: {car.year}<br />
                  Price: ${car.price.toLocaleString()}<br />
                  Mileage: {car.mileage.toLocaleString()} km
                </Card.Text>
                <Button variant="primary" className="me-2" onClick={() => handleEdit(car)}>Edit</Button>
                <Button variant="danger" onClick={() => handleDelete(car._id)}>Delete</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingCar ? 'Edit Car Listing' : 'Add New Car Listing'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Brand</Form.Label>
                  <Form.Control
                    type="text"
                    name="brand"
                    value={editingCar ? editingCar.brand : newCar.brand}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Model</Form.Label>
                  <Form.Control
                    type="text"
                    name="model"
                    value={editingCar ? editingCar.model : newCar.model}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Year</Form.Label>
                  <Form.Control
                    type="number"
                    name="year"
                    value={editingCar ? editingCar.year : newCar.year}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mileage (km)</Form.Label>
                  <Form.Control
                    type="number"
                    name="mileage"
                    value={editingCar ? editingCar.mileage : newCar.mileage}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price ($)</Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={editingCar ? editingCar.price : newCar.price}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Condition</Form.Label>
                  <Form.Select
                    name="condition"
                    value={editingCar ? editingCar.condition : newCar.condition}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select condition</option>
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                    <option value="Certified Pre-Owned">Certified Pre-Owned</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={editingCar ? editingCar.description : newCar.description}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Images</Form.Label>
              <ImageUpload onUpload={handleImageUpload} />
            </Form.Group>
            <Button variant="primary" type="submit">
              {editingCar ? 'Update Listing' : 'Add Listing'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default SellerDashboard;

