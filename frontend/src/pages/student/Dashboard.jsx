import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import inventoryService from '../../services/inventoryService';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Temporary helper function
  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      available: 'success',
      borrowed: 'warning',
      maintenance: 'info',
      damaged: 'danger'
    };
    return statusClasses[status] || 'secondary';
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await inventoryService.getAllItems();
      setItems(data);
    } catch (error) {
      toast.error('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) return <Loader />;

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <h2>📦 Available Items</h2>
          <p className="text-muted">Browse and borrow items from our inventory</p>
        </Col>
        <Col xs="auto">
          <Link to="/scan">
            <Button variant="primary">
              📷 Scan QR Code
            </Button>
          </Link>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>🔍</InputGroup.Text>
            <Form.Control
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Books">Books</option>
            <option value="Laboratory Equipment">Laboratory Equipment</option>
            <option value="Sports Equipment">Sports Equipment</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="borrowed">Borrowed</option>
            <option value="maintenance">Maintenance</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Items Grid */}
      <Row>
        {filteredItems.length === 0 ? (
          <Col>
            <Card className="text-center p-5">
              <Card.Body>
                <h4>No items found</h4>
                <p className="text-muted">Try adjusting your filters</p>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          filteredItems.map(item => (
            <Col md={6} lg={4} key={item._id} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="mb-0">{item.name}</h5>
                    <Badge bg={getStatusBadgeClass(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-muted small mb-2">{item.category}</p>
                  <p className="mb-3">{item.description}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">ID: {item.itemId}</small>
                    {item.status === 'available' && (
                      <Link to={`/scan?itemId=${item._id}`}>
                        <Button size="sm" variant="primary">Borrow</Button>
                      </Link>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default Dashboard;