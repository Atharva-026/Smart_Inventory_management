import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import inventoryService from '../../services/inventoryService';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import { toast } from 'react-toastify';

const QRGenerator = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [selectedItemData, setSelectedItemData] = useState(null);

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
    
    if (!item.qrCode) {
      toast.error('This item does not have a QR code. Please regenerate it.');
      return;
    }
    
    // ✅ USE THE STORED QR CODE FROM BACKEND
    setQrValue(item.qrCode);
    setSelectedItemData(item);
    toast.success('QR Code generated!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-dark">
      <Container className="pt-4 pb-5">
        <h2 className="mb-4 text-white fw-bold">🔲 QR Code <span className="text-yellow">Generator</span></h2>

        {/* Info Alert */}
        <Alert variant="info" className="mb-4 bg-dark-tertiary border-0 text-white shadow-sm">
          <strong className="text-yellow">📌 How it works:</strong> Select an item from the inventory to generate its QR code. 
          Students can scan this code to borrow the item.
        </Alert>

        <Row>
          <Col md={6}>
            <Card className="dark-card shadow-lg mb-4">
              <Card.Body className="p-4">
                <h5 className="mb-3 text-white">Generate QR Code</h5>
                
                <Form.Group className="mb-3">
                  <Form.Label className="text-muted">Select Item</Form.Label>
                  <Form.Select
                    className="dark-input"
                    value={selectedItem}
                    onChange={(e) => {
                      setSelectedItem(e.target.value);
                      setQrValue(''); // Clear previous QR
                    }}
                  >
                    <option value="">Choose an item...</option>
                    {items.map(item => (
                      <option key={item._id} value={item._id}>
                        {item.itemId} - {item.name} ({item.status})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Button 
                  variant="warning" 
                  onClick={handleGenerateQR}
                  className="w-100 btn-yellow"
                  disabled={!selectedItem}
                >
                  Generate QR Code
                </Button>

                {selectedItemData && (
                  <div className="mt-3 p-3 bg-dark-tertiary rounded border border-secondary">
                    <small className="text-muted">
                      <strong className="text-yellow">QR Code Value:</strong><br/>
                      <code className="d-block mt-1 p-2 bg-black rounded text-break" style={{fontSize: '10px'}}>
                        {qrValue}
                      </code>
                    </small>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            {qrValue ? (
              <Card className="dark-card shadow-lg">
                <Card.Body className="text-center p-4">
                  <h5 className="mb-3 text-white">Generated QR Code</h5>
                  
                  {/* Container for white background behind QR */}
                  <div className="bg-white p-4 rounded d-inline-block shadow-sm mb-3">
                    <QRCodeDisplay value={qrValue} size={256} />
                  </div>
                  
                  <div className="mt-3">
                    <p className="mb-2 text-white">
                      <strong className="text-muted">Item:</strong> {selectedItemData?.name}
                    </p>
                    <p className="mb-2 text-white">
                      <strong className="text-muted">Item ID:</strong> <span className="text-yellow font-monospace">{selectedItemData?.itemId}</span>
                    </p>
                    <p className="mb-3 text-white">
                      <strong className="text-muted">Category:</strong> {selectedItemData?.category}
                    </p>
                    
                    <div className="d-flex gap-2 justify-content-center">
                      <Button variant="success" onClick={handlePrint} className="btn-success-glow">
                        🖨️ Print QR Code
                      </Button>
                      <Button 
                        variant="outline-light"
                        onClick={() => {
                          navigator.clipboard.writeText(qrValue);
                          toast.success('QR code value copied!');
                        }}
                      >
                        📋 Copy Code
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ) : (
              <Card className="dark-card shadow-lg h-100">
                <Card.Body className="text-center py-5 d-flex flex-column justify-content-center align-items-center">
                  <div style={{fontSize: '4rem', opacity: 0.2}} className="text-white">🔲</div>
                  <p className="text-muted mt-3">Select an item to generate QR code</p>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>

        {/* Bulk Generate */}
        <Row className="mt-4">
          <Col>
            <Card className="dark-card shadow-lg">
              <Card.Body className="p-4">
                <h5 className="mb-3 text-white">📦 Bulk Operations</h5>
                <p className="text-muted mb-3">
                  Download all QR codes at once for printing
                </p>
                <Button 
                  variant="outline-warning"
                  onClick={() => toast.info('Bulk generation coming soon!')}
                >
                  Generate All QR Codes (Coming Soon)
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style>{`
        .page-dark { background-color: #0a0a0a; min-height: 100vh; color: #e0e0e0; }
        .text-yellow { color: #FCD535 !important; }
        .bg-dark-tertiary { background-color: #252525; }
        
        .dark-card { background-color: #1a1a1a; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); }
        
        .dark-input { background-color: #252525; border: 1px solid #444; color: #fff; }
        .dark-input:focus { background-color: #252525; color: #fff; border-color: #FCD535; box-shadow: 0 0 0 0.25rem rgba(252, 213, 53, 0.25); }
        
        .btn-yellow { background-color: #FCD535; border: none; color: #000; font-weight: 600; }
        .btn-yellow:hover { background-color: #e0bc20; color: #000; }
        .btn-success-glow { box-shadow: 0 0 10px rgba(25, 135, 84, 0.4); }

        @media print {
          body { background-color: white !important; color: black !important; }
          .page-dark { background-color: white !important; }
          .container > *:not(.row:has(canvas), .col-md-6:has(canvas)) {
            display: none !important;
          }
          .btn, .navbar, .sidebar { display: none !important; }
          .card { border: none !important; box-shadow: none !important; background: white !important; }
          h2, .alert { display: none !important; }
          .text-white, .text-muted { color: black !important; }
        }
      `}</style>
    </div>
  );
};

export default QRGenerator;