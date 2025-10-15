import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QRScanner = ({ onScan }) => {
  const html5QrCodeRef = useRef(null);
  const scannerStartedRef = useRef(false);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const config = { 
      fps: 10, 
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    };
    
    const startScanner = async () => {
      try {
        if (!html5QrCodeRef.current) {
          html5QrCodeRef.current = new Html5Qrcode("qr-reader");
        }

        if (!scannerStartedRef.current) {
          await html5QrCodeRef.current.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
              // Only process once
              if (isProcessingRef.current) return;
              isProcessingRef.current = true;

              if (scannerStartedRef.current) {
                html5QrCodeRef.current.stop().then(() => {
                  scannerStartedRef.current = false;
                  isProcessingRef.current = false;
                  onScan(decodedText);
                }).catch(err => {
                  console.error("Error stopping scanner:", err);
                  isProcessingRef.current = false;
                });
              }
            },
            (errorMessage) => {
              // Silently handle scan errors
            }
          );
          scannerStartedRef.current = true;
        }
      } catch (err) {
        console.error("Unable to start scanning", err);
      }
    };

    startScanner();

    return () => {
      if (html5QrCodeRef.current && scannerStartedRef.current) {
        html5QrCodeRef.current.stop()
          .then(() => {
            scannerStartedRef.current = false;
            html5QrCodeRef.current = null;
          })
          .catch(err => {
            console.error("Error during cleanup:", err);
            scannerStartedRef.current = false;
            html5QrCodeRef.current = null;
          });
      }
    };
  }, [onScan]);

  return (
    <div>
      <div id="qr-reader" style={{ width: '100%' }}></div>
    </div>
  );
};

export default QRScanner;