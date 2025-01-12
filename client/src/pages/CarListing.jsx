import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, Carousel, ListGroup, Button, Alert, Spinner } from 'react-bootstrap';

const CarListing = () => {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCarDetails = useCallback(async () => {
    try {
      const res = await axios.get(`/api/cars/${id}`);
      setCar(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching car details:', error);
      setError('Failed to load car details. Please try again.');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCarDetails();
  }, [fetchCarDetails]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!car) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">Car not found.</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col md={8}>
          <Card>
            <Carousel>
              {car.images.map((image, index) => (
                <Carousel.Item key={index}>
                  <img
                    className="d-block w-100"
                    src={image}
                    alt={`${car.brand} ${car.model} - Image ${index + 1}`}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
            <Card.Body>
              <Card.Title className="h2">{car.brand} {car.model}</Card.Title>
              <Card.Text>{car.description}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title className="h3">Car Details</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>Year: {car.year}</ListGroup.Item>
                <ListGroup.Item>Mileage: {car.mileage.toLocaleString()} km</ListGroup.Item>
                <ListGroup.Item>Price: ${car.price.toLocaleString()}</ListGroup.Item>
                <ListGroup.Item>Condition: {car.condition}</ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
          <Card className="mt-3">
            <Card.Body>
              <Card.Title className="h3">Seller Information</Card.Title>
              <Card.Text>
                Name: {car.seller.name}<br />
                Email: {car.seller.email}
              </Card.Text>
              <Button variant="primary" block>Contact Seller</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CarListing;

