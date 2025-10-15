import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import inventoryService from '../../services/inventoryService';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import { toast } from 'react-toastify';

const QRGenerator = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [qrValue, setQrValue] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await inventoryService.getAllItems();
      setItems(data);
    } catch (error) {
      toast.error('Failed to fetch items');
    }
  };

  const handleGenerateQR = () => {
    if (!selectedItem) {
      toast.error('Please select an item');
      return;
    }
    const item = items.find(i => i._id === selectedItem);
    setQrValue(`ITEM_${item.itemId}_${item._id}`);
    toast.success('QR Code generated!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">🔲 QR Code Generator</h2>

      <Row>
        <Col md={6}>
          <Card>
            <Card.Body>
              <h5 className="mb-3">Generate QR Code</h5>
              
              <Form.Group className="mb-3">
                <Form.Label>Select Item</Form.Label>
                <Form.Select
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                >
                  <option value="">Choose an item...</option>
                  {items.map(item => (
                    <option key={item._id} value={item._id}>
                      {item.itemId} - {item.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Button 
                variant="primary" 
                onClick={handleGenerateQR}
                className="w-100"
              >
                Generate QR Code
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          {qrValue && (
            <Card>
              <Card.Body className="text-center">
                <h5 className="mb-3">Generated QR Code</h5>
                <QRCodeDisplay value={qrValue} size={256} />
                
                <div className="mt-3">
                  <p className="mb-2">
                    <strong>Item:</strong> {items.find(i => i._id === selectedItem)?.name}
                  </p>
                  <p className="mb-3">
                    <strong>Item ID:</strong> {items.find(i => i._id === selectedItem)?.itemId}
                  </p>
                  
                  <Button variant="success" onClick={handlePrint}>
                    🖨️ Print QR Code
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Bulk Generate */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Body>
              <h5 className="mb-3">Bulk Generate QR Codes</h5>
              <p className="text-muted mb-3">Generate QR codes for all items</p>
              <Button variant="outline-primary">
                Generate All QR Codes
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default QRGenerator;