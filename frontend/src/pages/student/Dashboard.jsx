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
    <div className="page-dark">
      <Container className="pt-4 pb-5">
        <Row className="mb-4 align-items-center">
          <Col>
            <h2 className="text-white fw-bold">📦 Available <span className="text-yellow">Items</span></h2>
            <p className="text-light-gray mb-0">Browse and borrow items from our inventory</p>
          </Col>
          <Col xs="auto">
            <Link to="/scan">
              <Button variant="warning" className="btn-yellow btn-lg">
                📷 Scan QR Code
              </Button>
            </Link>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="dark-card shadow-lg mb-4 border-0">
          <Card.Body>
            <Row>
              <Col md={6} className="mb-3 mb-md-0">
                <InputGroup>
                  <InputGroup.Text className="bg-dark-tertiary border-secondary text-white">🔍</InputGroup.Text>
                  <Form.Control
                    className="dark-input"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={3} className="mb-3 mb-md-0">
                <Form.Select className="dark-input" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                  <option value="all">All Categories</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Books">Books</option>
                  <option value="Laboratory Equipment">Laboratory Equipment</option>
                  <option value="Sports Equipment">Sports Equipment</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Select className="dark-input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="borrowed">Borrowed</option>
                  <option value="maintenance">Maintenance</option>
                </Form.Select>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Items Grid */}
        <Row>
          {filteredItems.length === 0 ? (
            <Col>
              <Card className="text-center p-5 dark-card shadow-lg">
                <Card.Body>
                  <h4 className="text-white">No items found</h4>
                  <p className="text-light-gray">Try adjusting your filters</p>
                </Card.Body>
              </Card>
            </Col>
          ) : (
            filteredItems.map(item => (
              <Col md={6} lg={4} key={item._id} className="mb-4">
                <Card className="h-100 dark-card hover-lift shadow-sm border-0">
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      {/* Name - Forced White */}
                      <h5 className="mb-0 text-white fw-bold text-truncate" title={item.name}>{item.name}</h5>
                      <Badge bg={getStatusBadgeClass(item.status)} className={`bg-${getStatusBadgeClass(item.status)}-glow`}>
                        {item.status}
                      </Badge>
                    </div>
                    
                    {/* Category - Yellow */}
                    <p className="text-yellow small mb-2 fw-medium">{item.category}</p>
                    
                    {/* Description - Light Gray (Custom class to fix visibility) */}
                    <p className="mb-3 text-light-gray flex-grow-1 item-desc">
                      {item.description ? item.description : 'No description available.'}
                    </p>
                    
                    <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-secondary-custom">
                      {/* ID - Light Gray */}
                      <small className="text-light-gray font-monospace">ID: {item.itemId}</small>
                      
                      {item.status === 'available' && (
                        <Link to={`/scan?itemId=${item._id}`}>
                          <Button size="sm" variant="outline-warning" className="btn-outline-yellow">Borrow</Button>
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

      <style>{`
        /* --- Base Page Styling --- */
        .page-dark { 
            background-color: #0a0a0a; 
            min-height: 100vh; 
            color: #e0e0e0; 
        }
        
        /* --- Text Colors Override --- */
        .text-yellow { color: #FCD535 !important; }
        .text-white { color: #ffffff !important; }
        
        /* Custom Light Gray for descriptions to ensure visibility on black */
        .text-light-gray { color: #b0b0b0 !important; } 
        
        /* --- Card Styling --- */
        .dark-card { 
            background-color: #1a1a1a; 
            border-radius: 12px; 
            border: 1px solid rgba(255,255,255,0.1); 
        }
        
        .bg-dark-tertiary { background-color: #252525; }
        
        /* --- Form Inputs --- */
        .dark-input { 
            background-color: #252525; 
            border: 1px solid #444; 
            color: #ffffff; /* Input text white */
        }
        .dark-input:focus { 
            background-color: #252525; 
            color: #ffffff; 
            border-color: #FCD535; 
            box-shadow: 0 0 0 0.25rem rgba(252, 213, 53, 0.25); 
        }
        /* Override default placeholder color if needed */
        .dark-input::placeholder { color: #888; }
        
        /* --- Select Dropdown Options --- */
        .dark-input option {
            background-color: #1a1a1a;
            color: white;
        }

        /* --- Buttons --- */
        .btn-yellow { 
            background-color: #FCD535; 
            border: none; 
            color: #000; 
            font-weight: 600; 
        }
        .btn-yellow:hover { 
            background-color: #e0bc20; 
            color: #000; 
            transform: translateY(-2px); 
        }
        
        .btn-outline-yellow { 
            color: #FCD535; 
            border-color: #FCD535; 
        }
        .btn-outline-yellow:hover { 
            background-color: #FCD535; 
            color: #000; 
        }

        /* --- Hover Effects --- */
        .hover-lift:hover { 
            transform: translateY(-5px); 
            box-shadow: 0 10px 20px rgba(0,0,0,0.5); 
            background-color: #222; /* Slightly lighter on hover */
            transition: all 0.3s ease; 
        }
        
        /* --- Badges --- */
        .bg-success-glow { box-shadow: 0 0 8px rgba(25, 135, 84, 0.4); }
        .bg-warning-glow { box-shadow: 0 0 8px rgba(255, 193, 7, 0.4); }
        
        /* --- Utilities --- */
        .border-secondary-custom { border-color: rgba(255,255,255,0.1) !important; }
        .item-desc { 
            display: -webkit-box; 
            -webkit-line-clamp: 2; 
            -webkit-box-orient: vertical; 
            overflow: hidden; 
        }
      `}</style>
    </div>
  );
};

export default Dashboard;