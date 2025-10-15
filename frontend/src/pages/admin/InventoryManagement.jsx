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
    <Container className="mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>📦 Inventory Management</h2>
          <p className="text-muted mb-0">Manage your inventory items</p>
        </div>
        <Button variant="primary" onClick={() => handleShowModal()} size="lg">
          + Add New Item
        </Button>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Total Items</p>
                  <h4 className="mb-0">{items.length}</h4>
                </div>
                <div style={{ fontSize: '2rem' }}>📦</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Available</p>
                  <h4 className="mb-0 text-success">
                    {items.filter(i => i.status === 'available').length}
                  </h4>
                </div>
                <div style={{ fontSize: '2rem' }}>✅</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Borrowed</p>
                  <h4 className="mb-0 text-warning">
                    {items.filter(i => i.status === 'borrowed').length}
                  </h4>
                </div>
                <div style={{ fontSize: '2rem' }}>📤</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-1 small">Maintenance</p>
                  <h4 className="mb-0 text-info">
                    {items.filter(i => i.status === 'maintenance').length}
                  </h4>
                </div>
                <div style={{ fontSize: '2rem' }}>🔧</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body>
          <Row>
            <Col md={6} className="mb-3 mb-md-0">
              <InputGroup>
                <InputGroup.Text>🔍</InputGroup.Text>
                <Form.Control
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
              <Form.Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="all">All Categories</option>
                {ITEM_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
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
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {filteredItems.length === 0 ? (
            <div className="text-center py-5">
              <h4 className="text-muted">No items found</h4>
              <p className="text-muted">
                {items.length === 0 
                  ? 'Add your first item to get started' 
                  : 'Try adjusting your filters'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
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
                        <code className="bg-light px-2 py-1 rounded">{item.itemId}</code>
                      </td>
                      <td>
                        <strong>{item.name}</strong>
                      </td>
                      <td>
                        <Badge bg="secondary" pill>{item.category}</Badge>
                      </td>
                      <td>
                        <span className="text-muted">
                          {item.description?.substring(0, 50)}
                          {item.description?.length > 50 && '...'}
                        </span>
                      </td>
                      <td>
                        <Badge bg="info">{item.quantity || 1}</Badge>
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
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingItem ? '✏️ Edit Item' : '➕ Add New Item'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Item ID <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="itemId"
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
                  <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
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
                  <Form.Label>Category <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="category"
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
                  <Form.Label>Quantity <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
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
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                placeholder="Add item description, specifications, or notes..."
                value={formData.description}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="status"
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
              <Button variant="primary" type="submit" className="flex-grow-1">
                {editingItem ? '💾 Update Item' : '➕ Create Item'}
              </Button>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default InventoryManagement;