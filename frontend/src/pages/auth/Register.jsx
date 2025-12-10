import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import authService from '../../services/authService';
import invitationService from '../../services/invitationService';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
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

const Register = () => {
  const [searchParams] = useSearchParams();
  const { user, login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: searchParams.get('email') || '',
    password: '',
    confirmPassword: '',
    phone: '',
    invitationCode: searchParams.get('code') || ''
  });
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [invitationValid, setInvitationValid] = useState(false);
  const [invitedBy, setInvitedBy] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (user && !searchParams.get('code')) {
      navigate('/dashboard');
    }
  }, [user, navigate, searchParams]);

  useEffect(() => {
    const code = searchParams.get('code');
    const email = searchParams.get('email');
    
    if (code && email) {
      verifyInvitation(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyInvitation = async (code) => {
    if (!code) return;

    setVerifying(true);
    try {
      const response = await invitationService.verifyInvitation(code);
      setFormData(prev => ({
        ...prev,
        email: response.invitation.email || prev.email,
        invitationCode: code
      }));
      setInvitationValid(true);
      setInvitedBy(response.invitation.invitedBy);
      toast.success('Valid invitation code!');
    } catch (error) {
      toast.error('Invalid or expired invitation code');
      setInvitationValid(false);
      setInvitedBy('');
    } finally {
      setVerifying(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleVerifyClick = () => {
    verifyInvitation(formData.invitationCode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!invitationValid) {
      setError('Please verify your invitation code first');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...submitData } = formData;
      const response = await authService.register(submitData);
      
      toast.success('Registration successful! Logging you in...');
      
      if (response.token) {
        login(response.token);
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="register-page-dark d-flex align-items-center justify-content-center">
        <div className="text-center text-white">
          <div className="spinner-border text-yellow" role="status" style={{width: '3rem', height: '3rem'}}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-light-gray">Verifying invitation...</p>
        </div>
        <style>{`
            .register-page-dark { background-color: #0a0a0a; min-height: 100vh; }
            .text-yellow { color: #FCD535 !important; }
            .text-light-gray { color: #b0b0b0 !important; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="register-page-dark">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="dark-card shadow-lg border-0 my-5">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <IsometricLogo />
                  <h2 className="fw-bold text-white">Student <span className="text-yellow">Registration</span></h2>
                  <p className="text-light-gray">Join Smart Inventory System</p>
                </div>

                {error && <Alert variant="danger" className="bg-danger bg-opacity-25 text-danger border-danger border-opacity-25">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  {/* Invitation Code Section */}
                  <Card className="mb-4 bg-dark-tertiary border-yellow-left">
                    <Card.Body>
                      <h6 className="mb-3 text-white">
                        <span className="badge bg-yellow text-dark me-2">Step 1</span> Verify Invitation Code
                      </h6>
                      <Form.Group className="mb-3">
                        <Form.Label className="text-light-gray">Invitation Code <span className="text-danger">*</span></Form.Label>
                        <InputGroup>
                          <Form.Control
                            type="text"
                            name="invitationCode"
                            className="dark-input"
                            placeholder="Enter code from email"
                            value={formData.invitationCode}
                            onChange={handleChange}
                            disabled={invitationValid}
                            required
                            style={{ textTransform: 'uppercase' }}
                            size="lg"
                          />
                          <Button 
                            variant={invitationValid ? "success" : "warning"}
                            className={invitationValid ? "btn-success" : "btn-yellow"}
                            onClick={handleVerifyClick}
                            disabled={loading || invitationValid || !formData.invitationCode}
                          >
                            {loading ? 'Verifying...' : invitationValid ? '✓ Verified' : 'Verify'}
                          </Button>
                        </InputGroup>
                        {invitationValid && (
                          <Form.Text className="text-success d-block mt-2">
                            <strong>✓ Verified!</strong> Invited by: {invitedBy}
                          </Form.Text>
                        )}
                        {!invitationValid && (
                          <Form.Text className="text-muted">
                            Check your email for the invitation code
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Card.Body>
                  </Card>

                  {/* Registration Form */}
                  {invitationValid && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.5 }}
                    >
                      <h6 className="mb-3 text-white">
                        <span className="badge bg-primary me-2">Step 2</span> Complete Your Profile
                      </h6>

                      <Form.Group className="mb-3">
                        <Form.Label className="text-light-gray">Full Name <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          className="dark-input"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          size="lg"
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="text-light-gray">Email Address <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          className="dark-input"
                          placeholder="Your email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          disabled
                          size="lg"
                        />
                        <Form.Text className="text-muted">
                          Email is pre-filled from your invitation
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="text-light-gray">Phone Number <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          className="dark-input"
                          placeholder="Enter your phone number"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          size="lg"
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="text-light-gray">Password <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          className="dark-input"
                          placeholder="Create a password (min 6 characters)"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          autoComplete="new-password"
                          size="lg"
                        />
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="text-light-gray">Confirm Password <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          className="dark-input"
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          autoComplete="new-password"
                          size="lg"
                        />
                      </Form.Group>

                      <Button 
                        variant="warning" 
                        type="submit" 
                        className="w-100 mb-3 btn-yellow btn-lg"
                        size="lg"
                        disabled={loading}
                      >
                        {loading ? 'Registering...' : 'Complete Registration'}
                      </Button>
                    </motion.div>
                  )}

                  <div className="text-center">
                    <p className="text-muted mb-2">
                      Already have an account? <Link to="/login" className="text-yellow text-decoration-none fw-bold">Login here</Link>
                    </p>
                    <p className="text-muted mb-0">
                      <Link to="/" className="text-light-gray text-decoration-none hover-white">← Back to Home</Link>
                    </p>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style>{`
        /* --- Dark Theme Styles --- */
        .register-page-dark {
            background-color: #0a0a0a;
            min-height: 100vh;
            color: #e0e0e0;
            display: flex;
            align-items: center;
            padding: 40px 0;
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
        .bg-dark-tertiary { background-color: #252525; border-radius: 8px; }
        .border-yellow-left { border-left: 4px solid #FCD535; }

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
        .dark-input:disabled {
            background-color: #151515;
            opacity: 0.7;
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
        
        .bg-yellow { background-color: #FCD535 !important; }
      `}</style>
    </div>
  );
};

export default Register;