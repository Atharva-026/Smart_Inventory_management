import { useState, useRef } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import QRScanner from '../../components/QRScanner';
import transactionService from '../../services/transactionService';
import inventoryService from '../../services/inventoryService';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ScanItem = () => {
  const [scanning, setScanning] = useState(false);
  const [scannerStarting, setScannerStarting] = useState(false);
  const [scannedItem, setScannedItem] = useState(null);
  const [processing, setProcessing] = useState(false);
  const scannerKey = useRef(0);
  const navigate = useNavigate();

  const normalizeQR = (raw) => {
    if (!raw) return null;
    try {
      const url = new URL(raw);
      const codeFromQuery = url.searchParams.get('code');
      if (codeFromQuery) return codeFromQuery;
      const pathname = url.pathname || '';
      const lastSeg = pathname.split('/').filter(Boolean).pop();
      if (lastSeg) return lastSeg;
    } catch (e) {
      // not a valid URL, continue
    }
    const itemMatch = raw.match(/ITEM_[A-Za-z0-9_-]+/);
    if (itemMatch) return itemMatch[0];
    return raw.trim();
  };

  const handleScan = async (result) => {
    if (!result || processing) return;
    setProcessing(true);
    setScanning(false);

    const code = normalizeQR(result);
    if (!code) {
      toast.error('Scanned data invalid. Try again.');
      setProcessing(false);
      return;
    }

    try {
      const item = await inventoryService.getItemByQR(code);
      setScannedItem(item);
      toast.success('Item found');
    } catch (error) {
      if (error.status === 404) {
        toast.error('Item not found. Make sure this QR belongs to an item.');
      } else if (error.response?.status === 401 || error.status === 401) {
        toast.error('Unauthorized. Please login and try again.');
      } else {
        toast.error('Failed to fetch item. Try again.');
        console.error('Scan error:', error);
      }
      setScannedItem(null);
    } finally {
      setProcessing(false);
    }
  };

  const handleBorrow = async () => {
    if (!scannedItem) return;
    setProcessing(true);
    try {
      await transactionService.borrowItem(scannedItem._id);
      toast.success('Item borrowed successfully');
      navigate('/my-transactions');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to borrow item');
    } finally {
      setProcessing(false);
    }
  };

  const handleStartScanning = () => {
    if (scanning || scannerStarting || processing) return;
    setScannerStarting(true);
    scannerKey.current += 1;
    setScannedItem(null);

    setTimeout(() => {
      setScanning(true);
      setScannerStarting(false);
    }, 400);
  };

  const handleCancelScanning = () => {
    setScanning(false);
    setScannedItem(null);
  };

  return (
    <div className="page-dark">
      <Container className="pt-5 pb-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="dark-card shadow-lg border-0">
              <Card.Body className="p-4 text-center">
                <h3 className="mb-4 text-white fw-bold">📷 QR Code <span className="text-yellow">Scanner</span></h3>

                {!scanning && !scannedItem && (
                  <div>
                    <div style={{fontSize: '4rem', opacity: 0.8}} className="text-white mb-3">📱</div>
                    {/* Fixed visibility: Changed text-muted to text-light-gray */}
                    <p className="mb-4 text-light-gray fs-5">Scan a QR code to borrow or return an item</p>
                    <Button
                      variant="warning"
                      className="btn-yellow btn-lg px-5"
                      onClick={handleStartScanning}
                      disabled={processing || scannerStarting}
                    >
                      {scannerStarting ? 'Starting...' : 'Start Scanning'}
                    </Button>
                  </div>
                )}

                {scanning && !scannedItem && (
                  <div>
                    <div className="qr-container bg-black rounded overflow-hidden mb-3 border border-secondary">
                        <QRScanner key={scannerKey.current} onScan={handleScan} />
                    </div>
                    <Button variant="outline-light" onClick={handleCancelScanning}>
                      Cancel Scanning
                    </Button>
                  </div>
                )}

                {scannedItem && (
                  <div className="text-start">
                    <Alert variant="success" className="d-flex align-items-center mb-4 border-0">
                        <span className="me-2 fs-4">✅</span> 
                        <div>
                            <strong>Item Scanned Successfully</strong>
                        </div>
                    </Alert>

                    <Card className="mb-4 bg-dark-tertiary border border-secondary text-white">
                      <Card.Body>
                        <h4 className="text-yellow fw-bold mb-3">{scannedItem.name}</h4>
                        <div className="mt-3">
                            <p className="mb-2 text-white">
                                <strong className="text-light-gray">ID:</strong> <span className="font-monospace text-white ms-2">{scannedItem.itemId}</span>
                            </p>
                            <p className="mb-2 text-white">
                                <strong className="text-light-gray">Category:</strong> <span className="ms-2">{scannedItem.category}</span>
                            </p>
                            <p className="mb-2 text-white">
                                <strong className="text-light-gray">Status:</strong> 
                                <span className={`ms-2 fw-bold ${scannedItem.status === 'available' ? 'text-success' : 'text-warning'}`}>
                                    {scannedItem.status.toUpperCase()}
                                </span>
                            </p>
                            <p className="mb-0 text-white-50 mt-3 border-top border-secondary pt-2">
                                {scannedItem.description || "No description available."}
                            </p>
                        </div>
                      </Card.Body>
                    </Card>

                    <div className="d-flex gap-3 justify-content-center">
                      {scannedItem.status === 'available' && (
                        <Button variant="success" size="lg" className="px-4 fw-bold" onClick={handleBorrow} disabled={processing}>
                          {processing ? 'Processing...' : 'Borrow Item'}
                        </Button>
                      )}
                      <Button variant="outline-light" size="lg" onClick={handleStartScanning}>
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

      <style>{`
        .page-dark { background-color: #0a0a0a; min-height: 100vh; color: #e0e0e0; }
        .text-yellow { color: #FCD535 !important; }
        .text-light-gray { color: #b0b0b0 !important; } /* Custom high-contrast gray */
        
        .dark-card { background-color: #1a1a1a; border-radius: 12px; }
        .bg-dark-tertiary { background-color: #252525; }
        
        .btn-yellow { background-color: #FCD535; border: none; color: #000; font-weight: 600; }
        .btn-yellow:hover { background-color: #e0bc20; color: #000; transform: translateY(-2px); }
        
        /* QR Scanner Container Override */
        .qr-container video {
            border-radius: 8px;
            width: 100% !important;
            height: auto !important;
        }
      `}</style>
    </div>
  );
};

export default ScanItem;