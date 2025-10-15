import { QRCodeSVG } from 'qrcode.react';

const QRCodeDisplay = ({ value, size = 200 }) => {
  return (
    <div className="d-flex justify-content-center">
      <QRCodeSVG 
        value={value} 
        size={size}
        level="H"
        includeMargin={true}
      />
    </div>
  );
};

export default QRCodeDisplay;