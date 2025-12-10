import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import authService from '../../services/authService';

const RegisterFaculty = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    department: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setSuccess('');

    // Validation
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
      await authService.registerFaculty(submitData);
      
      setSuccess(`Faculty member ${formData.name} registered successfully!`);
      toast.success('Faculty registered successfully!');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        department: ''
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-dark">
      <Container className="pt-5 pb-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="dark-card shadow-lg">
              <Card.Header className="bg-yellow text-dark py-3">
                <h4 className="mb-0 fw-bold">➕ Register New Faculty</h4>
              </Card.Header>
              <Card.Body className="p-4">
                <Alert variant="dark" className="mb-4 bg-dark-tertiary border-0 text-white">
                  <strong className="text-yellow">Admin Only:</strong> Use this form to register faculty members who can manage inventory and send student invitations.
                </Alert>

                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-light">Full Name <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      className="dark-input"
                      placeholder="Enter faculty member's full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="text-light">Email Address <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      className="dark-input"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="text-light">Phone Number <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      className="dark-input"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="text-light">Department</Form.Label>
                    <Form.Control
                      type="text"
                      name="department"
                      className="dark-input"
                      placeholder="e.g., Computer Science, Physics (Optional)"
                      value={formData.department}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="text-light">Password <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      className="dark-input"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                    <Form.Text className="text-muted">
                      Minimum 6 characters
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="text-light">Confirm Password <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      className="dark-input"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Button 
                    variant="warning" 
                    type="submit" 
                    className="w-100 btn-yellow"
                    disabled={loading}
                  >
                    {loading ? 'Registering...' : 'Register Faculty Member'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style>{`
        .page-dark { background-color: #0a0a0a; min-height: 100vh; color: #e0e0e0; }
        .bg-yellow { background-color: #FCD535; }
        .text-yellow { color: #FCD535 !important; }
        
        .dark-card { background-color: #1a1a1a; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); }
        .bg-dark-tertiary { background-color: #252525; }
        
        .dark-input { background-color: #252525; border: 1px solid #444; color: #fff; }
        .dark-input:focus { background-color: #252525; color: #fff; border-color: #FCD535; box-shadow: 0 0 0 0.25rem rgba(252, 213, 53, 0.25); }
        
        .btn-yellow { background-color: #FCD535; border: none; color: #000; font-weight: 600; padding: 10px; }
        .btn-yellow:hover { background-color: #e0bc20; color: #000; transform: translateY(-2px); }
      `}</style>
    </div>
  );
};

export default RegisterFaculty;