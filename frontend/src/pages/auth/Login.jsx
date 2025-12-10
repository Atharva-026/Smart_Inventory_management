import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import authService from '../../services/authService';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

// --- Custom 3D SVG Logo Component ---
const IsometricLogo = () => (
  <svg width="80" height="80" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-3">
    <motion.g
      animate={{ translateY: [-5, 5, -5] }}
      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
    >
      <path d="M60 85L10 60L60 35L110 60L60 85Z" fill="#cca914" opacity="0.5" />
      <path d="M10 60V90L60 115V85L10 60Z" fill="#cca914" opacity="0.7" />
      <path d="M110 60V90L60 115V85L110 60Z" fill="#FCD535" opacity="0.8" />
    </motion.g>
    <motion.g
      animate={{ translateY: [-10, 10, -10] }}
      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
    >
      <path d="M60 65L25 47.5L60 30L95 47.5L60 65Z" fill="#FCD535" />
      <path d="M45 42H55V52H45V42Z" fill="#121212" />
      <path d="M65 42H75V52H65V42Z" fill="#121212" />
      <path d="M45 56H55V60H65V56H75V62H45V56Z" fill="#121212" />
    </motion.g>
  </svg>
);

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(formData);
      login(response.token);
      toast.success('Login successful!');
      
      // Navigate based on role
      if (response.user.role === 'admin' || response.user.role === 'faculty') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-dark">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md={6} lg={5}>
            <Card className="dark-card shadow-lg border-0">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <IsometricLogo />
                  <h2 className="fw-bold text-white">Smart <span className="text-yellow">Inventory</span></h2>
                  <p className="text-muted">Login to your account</p>
                </div>

                {error && <Alert variant="danger" className="bg-danger bg-opacity-25 text-danger border-danger border-opacity-25">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-light-gray">Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      className="dark-input"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      size="lg"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="text-light-gray">Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      className="dark-input"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      autoComplete="current-password"
                      size="lg"
                    />
                  </Form.Group>

                  <Button 
                    variant="warning" 
                    type="submit" 
                    className="w-100 mb-3 btn-yellow btn-lg"
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>

                  <div className="text-center">
                    <p className="text-muted mb-2">
                      Student with invitation? <Link to="/register" className="text-yellow text-decoration-none fw-bold">Register here</Link>
                    </p>
                    <p className="text-muted mb-0">
                      <Link to="/" className="text-light-gray text-decoration-none hover-white">← Back to Home</Link>
                    </p>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {/* Info Cards */}
            <Row className="mt-4">
              <Col>
                <Card className="bg-dark-tertiary border-0 text-white shadow-sm">
                  <Card.Body className="text-center py-3">
                    <small className="text-light-gray">
                      <strong className="text-white">Admin/Faculty?</strong> Use your registered credentials
                    </small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>

      <style>{`
        /* --- Dark Theme Styles --- */
        .login-page-dark {
            background-color: #0a0a0a;
            min-height: 100vh;
            color: #e0e0e0;
            display: flex;
            align-items: center;
        }

        /* --- Text Colors --- */
        .text-yellow { color: #FCD535 !important; }
        .text-white { color: #ffffff !important; }
        .text-light-gray { color: #b0b0b0 !important; }
        .hover-white:hover { color: #fff !important; }

        /* --- Card Styling --- */
        .dark-card {
            background-color: #1a1a1a;
            border-radius: 16px;
            border: 1px solid rgba(255,255,255,0.05);
        }
        .bg-dark-tertiary { background-color: #252525; border-radius: 12px; }

        /* --- Form Inputs --- */
        .dark-input {
            background-color: #252525;
            border: 1px solid #444;
            color: #ffffff;
        }
        .dark-input:focus {
            background-color: #252525;
            color: #ffffff;
            border-color: #FCD535;
            box-shadow: 0 0 0 0.25rem rgba(252, 213, 53, 0.25);
        }
        .dark-input::placeholder { color: #6c757d; }

        /* --- Buttons --- */
        .btn-yellow {
            background-color: #FCD535;
            border: none;
            color: #000;
            font-weight: 700;
            transition: all 0.3s ease;
        }
        .btn-yellow:hover {
            background-color: #e0bc20;
            color: #000;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(252, 213, 53, 0.3);
        }
      `}</style>
    </div>
  );
};

export default Login;