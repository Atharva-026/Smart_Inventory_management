import { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import QRScanner from '../../components/QRScanner';
import transactionService from '../../services/transactionService';
import inventoryService from '../../services/inventoryService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ScanItem = () => {
  const [scanning, setScanning] = useState(false);
  const [scannedItem, setScannedItem] = useState(null);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const handleScan = async (result) => {
    if (result && !processing) {
      setProcessing(true);
      setScanning(false); // Stop showing scanner
      
      try {
        // Extract item ID from QR code
        const qrData = result;
        const item = await inventoryService.getItemByQR(qrData);
        setScannedItem(item);
        toast.success('Item scanned successfully!');
      } catch (error) {
        toast.error('Failed to find item. Please try again.');
        setScanning(false);
        setScannedItem(null);
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleBorrow = async () => {
    if (!scannedItem) return;
    
    setProcessing(true);
    try {
      await transactionService.borrowItem(scannedItem._id);
      toast.success('Item borrowed successfully!');
      navigate('/my-transactions');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to borrow item');
    } finally {
      setProcessing(false);
    }
  };

  const handleStartScanning = () => {
    setScanning(true);
    setScannedItem(null);
  };

  const handleCancelScanning = () => {
    setScanning(false);
    setScannedItem(null);
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <h3 className="text-center mb-4">📷 QR Code Scanner</h3>

              {!scanning && !scannedItem && (
                <div className="text-center">
                  <p className="mb-4">Scan a QR code to borrow or return an item</p>
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={handleStartScanning}
                  >
                    Start Scanning
                  </Button>
                  <div className="mt-3">
                    <Button 
                      variant="secondary"
                      onClick={() => navigate('/dashboard')}
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </div>
              )}

              {scanning && !scannedItem && (
                <div>
                  <QRScanner onScan={handleScan} />
                  <div className="text-center mt-3">
                    <Button 
                      variant="secondary"
                      onClick={handleCancelScanning}
                    >
                      Cancel Scanning
                    </Button>
                  </div>
                </div>
              )}

              {scannedItem && !scanning && (
                <div>
                  <Alert variant="success">
                    <h5>✅ Item Scanned Successfully!</h5>
                  </Alert>
                  
                  <Card className="mb-3">
                    <Card.Body>
                      <h5>{scannedItem.name}</h5>
                      <p className="mb-2"><strong>ID:</strong> {scannedItem.itemId}</p>
                      <p className="mb-2"><strong>Category:</strong> {scannedItem.category}</p>
                      <p className="mb-2"><strong>Status:</strong> {scannedItem.status}</p>
                      <p className="mb-0">{scannedItem.description}</p>
                    </Card.Body>
                  </Card>

                  <div className="d-flex gap-2">
                    {scannedItem.status === 'available' && (
                      <Button 
                        variant="success" 
                        onClick={handleBorrow}
                        disabled={processing}
                        className="flex-grow-1"
                      >
                        {processing ? 'Processing...' : 'Borrow Item'}
                      </Button>
                    )}
                    <Button 
                      variant="secondary"
                      onClick={handleStartScanning}
                      className="flex-grow-1"
                    >
                      Scan Another
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ScanItem;