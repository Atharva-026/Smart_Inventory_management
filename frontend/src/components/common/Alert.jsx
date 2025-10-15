import { Alert as BootstrapAlert } from 'react-bootstrap';

const Alert = ({ variant = 'info', message, onClose, dismissible = true }) => {
  if (!message) return null;

  return (
    <BootstrapAlert variant={variant} onClose={onClose} dismissible={dismissible}>
      {message}
    </BootstrapAlert>
  );
};

export default Alert;