import { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Badge, InputGroup, Row, Col, Card } from 'react-bootstrap';
import inventoryService from '../../services/inventoryService';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';
import { getStatusBadgeClass } from '../../utils/helpers';
import { ITEM_CATEGORIES } from '../../utils/constants';

const InventoryManagement = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    itemId: '',
    category: '',
    description: '',
    status: 'available',
    quantity: 1
  });
  const [formErrors, setFormErrors] = useState({});

 useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, searchTerm, filterCategory, filterStatus]);
  const fetchItems = async () => {
    try {
      const data = await inventoryService.getAllItems();
      setItems(data);
    } catch (error) {
      toast.error('Failed to fetch items');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...items];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    setFilteredItems(filtered);
  };

  const handleShowModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        itemId: item.itemId,
        category: item.category,
        description: item.description || '',
        status: item.status,
        quantity: item.quantity || 1
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        itemId: '',
        category: '',
        description: '',
        status: 'available',
        quantity: 1
      });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.itemId.trim()) {
      errors.itemId = 'Item ID is required';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    if (!formData.status) {
      errors.status = 'Status is required';
    }

    if (formData.quantity < 1) {
      errors.quantity = 'Quantity must be at least 1';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    try {
      if (editingItem) {
        await inventoryService.updateItem(editingItem._id, formData);
        toast.success('Item updated successfully!');
      } else {
        await inventoryService.createItem(formData);
        toast.success('Item created successfully!');
      }
      fetchItems();
      handleCloseModal();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Operation failed';
      toast.error(errorMessage);
      console.error('Submit error:', error);
    }
  };

  const handleDelete = async (id, itemName) => {
    if (window.confirm(`Are you sure you want to delete "${itemName}"?`)) {
      try {
        await inventoryService.deleteItem(id);
        toast.success('Item deleted successfully!');
        fetchItems();
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to delete item';
        toast.error(errorMessage);
        console.error('Delete error:', error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-dark">
      <Container className="pt-4 pb-5">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="text-white fw-bold">📦 Inventory <span className="text-yellow">Management</span></h2>
            <p className="text-light-gray mb-0">Manage your inventory items</p>
          </div>
          <Button variant="warning" className="btn-yellow" onClick={() => handleShowModal()} size="lg">
            + Add New Item
          </Button>
        </div>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3} sm={6} className="mb-3">
            <Card className="dark-card h-100 border-yellow-left shadow-lg">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-light-gray mb-1 small">Total Items</p>
                    <h4 className="mb-0 text-white">{items.length}</h4>
                  </div>
                  <div className="text-white" style={{ fontSize: '2rem' }}>📦</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <Card className="dark-card h-100 border-green-left shadow-lg">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-light-gray mb-1 small">Available</p>
                    <h4 className="mb-0 text-success">
                      {items.filter(i => i.status === 'available').length}
                    </h4>
                  </div>
                  <div className="text-white" style={{ fontSize: '2rem' }}>✅</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <Card className="dark-card h-100 border-orange-left shadow-lg">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-light-gray mb-1 small">Borrowed</p>
                    <h4 className="mb-0 text-warning">
                      {items.filter(i => i.status === 'borrowed').length}
                    </h4>
                  </div>
                  <div className="text-white" style={{ fontSize: '2rem' }}>📤</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <Card className="dark-card h-100 border-blue-left shadow-lg">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-light-gray mb-1 small">Maintenance</p>
                    <h4 className="mb-0 text-info">
                      {items.filter(i => i.status === 'maintenance').length}
                    </h4>
                  </div>
                  <div className="text-white" style={{ fontSize: '2rem' }}>🔧</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="mb-4 dark-card shadow-lg">
          <Card.Body>
            <Row>
              <Col md={6} className="mb-3 mb-md-0">
                <InputGroup>
                  <InputGroup.Text className="bg-dark-tertiary border-secondary text-white">🔍</InputGroup.Text>
                  <Form.Control
                    className="dark-input"
                    placeholder="Search by name, ID, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
                      ✕
                    </Button>
                  )}
                </InputGroup>
              </Col>
              <Col md={3} className="mb-3 mb-md-0">
                <Form.Select className="dark-input" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                  <option value="all">All Categories</option>
                  {ITEM_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Select className="dark-input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="borrowed">Borrowed</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="damaged">Damaged</option>
                </Form.Select>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Items Table */}
        <Card className="dark-card shadow-lg border-0 overflow-hidden">
          <Card.Body className="p-0">
            {filteredItems.length === 0 ? (
              <div className="text-center py-5">
                <h4 className="text-white">No items found</h4>
                <p className="text-light-gray">
                  {items.length === 0 
                    ? 'Add your first item to get started' 
                    : 'Try adjusting your filters'}
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                {/* Updated Table Styling */}
                <Table className="custom-dark-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Item ID</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Quantity</th>
                      <th>Status</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map(item => (
                      <tr key={item._id}>
                        <td>
                          <code className="bg-dark-tertiary text-yellow px-2 py-1 rounded border border-secondary">{item.itemId}</code>
                        </td>
                        <td>
                          <strong className="text-white">{item.name}</strong>
                        </td>
                        <td>
                          <Badge bg="dark" className="border border-secondary text-white">{item.category}</Badge>
                        </td>
                        <td>
                          <span className="text-light-gray">
                            {item.description?.substring(0, 50)}
                            {item.description?.length > 50 && '...'}
                          </span>
                        </td>
                        <td>
                          <Badge bg="info" className="text-dark">{item.quantity || 1}</Badge>
                        </td>
                        <td>
                          <Badge bg={getStatusBadgeClass(item.status).replace('bg-', '')}>
                            {item.status}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <Button 
                            size="sm" 
                            variant="outline-primary" 
                            className="me-2"
                            onClick={() => handleShowModal(item)}
                          >
                            ✏️ Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline-danger"
                            onClick={() => handleDelete(item._id, item.name)}
                          >
                            🗑️ Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Add/Edit Modal */}
        <Modal show={showModal} onHide={handleCloseModal} size="lg" contentClassName="modal-dark">
          <Modal.Header closeButton closeVariant="white">
            <Modal.Title className="text-white">
              {editingItem ? '✏️ Edit Item' : '➕ Add New Item'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-light-gray">Item ID <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="itemId"
                      className="dark-input"
                      placeholder="e.g., ITEM001"
                      value={formData.itemId}
                      onChange={handleInputChange}
                      disabled={editingItem !== null}
                      isInvalid={!!formErrors.itemId}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.itemId}
                    </Form.Control.Feedback>
                    {editingItem && (
                      <Form.Text className="text-muted">Item ID cannot be changed</Form.Text>
                    )}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-light-gray">Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      className="dark-input"
                      placeholder="e.g., Laptop Dell XPS 15"
                      value={formData.name}
                      onChange={handleInputChange}
                      isInvalid={!!formErrors.name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.name}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-light-gray">Category <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      name="category"
                      className="dark-input"
                      value={formData.category}
                      onChange={handleInputChange}
                      isInvalid={!!formErrors.category}
                    >
                      <option value="">Select Category</option>
                      {ITEM_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.category}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-light-gray">Quantity <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="number"
                      name="quantity"
                      className="dark-input"
                      min="1"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      isInvalid={!!formErrors.quantity}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.quantity}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="text-light-gray">Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  className="dark-input"
                  placeholder="Add item description, specifications, or notes..."
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-light-gray">Status <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="status"
                  className="dark-input"
                  value={formData.status}
                  onChange={handleInputChange}
                  isInvalid={!!formErrors.status}
                >
                  <option value="available">Available</option>
                  <option value="borrowed">Borrowed</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="damaged">Damaged</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {formErrors.status}
                </Form.Control.Feedback>
              </Form.Group>

              <div className="d-flex gap-2 mt-4">
                <Button variant="warning" type="submit" className="flex-grow-1 btn-yellow">
                  {editingItem ? '💾 Update Item' : '➕ Create Item'}
                </Button>
                <Button variant="outline-light" onClick={handleCloseModal}>
                  Cancel
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>

      <style>{`
        .page-dark { background-color: #0a0a0a; min-height: 100vh; color: #e0e0e0; }
        .text-yellow { color: #FCD535 !important; }
        .text-light-gray { color: #b0b0b0 !important; }
        .text-white { color: #ffffff !important; }
        
        /* Dark Cards */
        .dark-card { background-color: #1a1a1a; border-radius: 12px; }
        .border-yellow-left { border-left: 4px solid #FCD535; }
        .border-green-left { border-left: 4px solid #00E676; }
        .border-orange-left { border-left: 4px solid #FF9100; }
        .border-blue-left { border-left: 4px solid #2979FF; }
        
        /* Inputs & BG */
        .bg-dark-tertiary { background-color: #252525; }
        .dark-input { background-color: #252525; border: 1px solid #444; color: #fff; }
        .dark-input:focus { background-color: #252525; color: #fff; border-color: #FCD535; box-shadow: 0 0 0 0.25rem rgba(252, 213, 53, 0.25); }
        .dark-input:disabled { background-color: #151515; opacity: 0.7; }

        /* --- STRONG DARK TABLE OVERRIDES --- */
        .custom-dark-table { 
            --bs-table-bg: transparent; 
            --bs-table-accent-bg: transparent;
            --bs-table-striped-bg: transparent;
            --bs-table-border-color: rgba(255,255,255,0.1);
            color: #e0e0e0;
            margin-bottom: 0;
            background-color: transparent !important;
        }
        .custom-dark-table thead th { 
            background-color: #252525 !important;
            color: #FCD535 !important; 
            border-bottom: 2px solid rgba(255,255,255,0.1); 
            padding: 1rem; 
            font-weight: 600;
            border-top: none !important;
        }
        .custom-dark-table tbody td { 
            background-color: #1a1a1a !important; 
            color: #e0e0e0 !important; /* Force text color */
            border-bottom: 1px solid rgba(255,255,255,0.05); 
            padding: 1rem; 
        }
        .custom-dark-table tbody tr:hover td {
            background-color: rgba(252, 213, 53, 0.08) !important; 
            color: #ffffff !important;
            transition: background-color 0.2s ease-in-out;
        }

        /* Modal Styling */
        .modal-dark { background-color: #1a1a1a; color: #fff; border: 1px solid #333; }
        .modal-dark .modal-header { border-bottom: 1px solid #333; }
        .modal-dark .btn-close { filter: invert(1); } /* Make close button white */

        /* Button */
        .btn-yellow { background-color: #FCD535; border: none; color: #000; font-weight: 600; }
        .btn-yellow:hover { background-color: #e0bc20; color: #000; }
      `}</style>
    </div>
  );
};

export default InventoryManagement;