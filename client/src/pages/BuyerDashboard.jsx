import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, InputGroup, Button, Alert, Spinner } from 'react-bootstrap';

const BuyerDashboard = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    brand: '',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
    condition: '',
  });

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/cars');
      if (Array.isArray(res.data)) {
        setCars(res.data);
      } else {
        console.error('Unexpected data format:', res.data);
        setCars([]);
        setError('Unexpected data format received from server');
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
      setError('Failed to load car listings. Please try again.');
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredCars = cars.filter((car) => {
    return (
      car.brand.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filters.brand === '' || car.brand === filters.brand) &&
      (filters.minPrice === '' || car.price >= parseInt(filters.minPrice)) &&
      (filters.maxPrice === '' || car.price <= parseInt(filters.maxPrice)) &&
      (filters.minYear === '' || car.year >= parseInt(filters.minYear)) &&
      (filters.maxYear === '' || car.year <= parseInt(filters.maxYear)) &&
      (filters.condition === '' || car.condition === filters.condition)
    );
  });

  const uniqueBrands = [...new Set(cars.map((car) => car.brand))];
  const conditions = ['New', 'Used', 'Certified Pre-Owned'];

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
    <Container className="mt-4">
      <h2 className="mb-4">Find Your Perfect Car</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form className="mb-4">
        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search cars..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <Button variant="outline-secondary">
                  Search
                </Button>
              </InputGroup>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Select
                name="brand"
                value={filters.brand}
                onChange={handleFilterChange}
              >
                <option value="">All Brands</option>
                {uniqueBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Select
                name="condition"
                value={filters.condition}
                onChange={handleFilterChange}
              >
                <option value="">All Conditions</option>
                {conditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Control
                type="number"
                name="minPrice"
                placeholder="Min Price"
                value={filters.minPrice}
                onChange={handleFilterChange}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Control
                type="number"
                name="maxPrice"
                placeholder="Max Price"
                value={filters.maxPrice}
                onChange={handleFilterChange}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Control
                type="number"
                name="minYear"
                placeholder="Min Year"
                value={filters.minYear}
                onChange={handleFilterChange}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Control
                type="number"
                name="maxYear"
                placeholder="Max Year"
                value={filters.maxYear}
                onChange={handleFilterChange}
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>

      <Row>
        {filteredCars.map((car) => (
          <Col key={car._id} md={4} className="mb-4">
            <Card>
              <Card.Img variant="top" src={car.images[0] || '/placeholder.svg'} />
              <Card.Body>
                <Card.Title>{car.brand} {car.model}</Card.Title>
                <Card.Text>
                  Year: {car.year}<br />
                  Price: ${car.price.toLocaleString()}<br />
                  Mileage: {car.mileage.toLocaleString()} km<br />
                  Condition: {car.condition}
                </Card.Text>
                <Link to={`/car/${car._id}`} className="btn btn-primary">
                  View Details
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default BuyerDashboard;

