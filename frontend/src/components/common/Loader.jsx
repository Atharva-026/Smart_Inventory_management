import { Spinner } from 'react-bootstrap';

const Loader = ({ size = 'lg', text = 'Loading...' }) => {
  return (
    <div className="spinner-container d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '400px' }}>
      <Spinner animation="border" variant="primary" size={size} />
      {text && <p className="mt-3 text-muted">{text}</p>}
    </div>
  );
};

export default Loader;