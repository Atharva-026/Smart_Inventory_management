import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge, Alert } from 'react-bootstrap';
import invitationService from '../../services/invitationService';
import { toast } from 'react-toastify';
import { formatDateTime } from '../../utils/helpers';

const SendInvitations = () => {
  const [singleEmail, setSingleEmail] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, expired: 0 });
  const [singleName, setSingleName] = useState('');
  const [resending, setResending] = useState(null);

  useEffect(() => {
    fetchInvitations();
    fetchStats();
  }, []);

  const fetchInvitations = async () => {
    try {
      const data = await invitationService.getMyInvitations();
      setInvitations(data);
    } catch (error) {
      console.error('Fetch invitations error:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await invitationService.getInvitationStats();
      setStats(data);
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const handleSendSingle = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await invitationService.sendInvitation(singleEmail, singleName);
      toast.success(`Invitation email sent to ${singleEmail}!`);
      setSingleEmail('');
      setSingleName('');
      fetchInvitations();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleSendBulk = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const emailArray = bulkEmails
        .split('\n')
        .map(email => email.trim())
        .filter(email => email && email.includes('@'));

      if (emailArray.length === 0) {
        toast.error('Please enter valid email addresses');
        setLoading(false);
        return;
      }

      const result = await invitationService.sendBulkInvitations(emailArray);
      toast.success(result.message);
      setBulkEmails('');
      fetchInvitations();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (invitationId, email) => {
    setResending(invitationId);
    try {
      await invitationService.resendInvitation(invitationId);
      toast.success(`Invitation email resent to ${email}!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend invitation');
    } finally {
      setResending(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invitation?')) {
      try {
        await invitationService.deleteInvitation(id);
        toast.success('Invitation deleted');
        fetchInvitations();
        fetchStats();
      } catch (error) {
        toast.error('Failed to delete invitation');
      }
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      accepted: 'success',
      expired: 'danger'
    };
    return variants[status] || 'secondary';
  };

  return (
    <div className="page-dark">
      <Container className="pt-4 pb-5">
        <h2 className="mb-4 text-white fw-bold">✉️ Send Student <span className="text-yellow">Invitations</span></h2>

        {/* Statistics */}
        <Row className="mb-4">
          <Col md={3} className="mb-3 mb-md-0">
            <Card className="dark-card border-blue-left shadow-sm h-100">
              <Card.Body>
                <h6 className="text-light-gray mb-2">Total Sent</h6>
                <h3 className="text-white fw-bold mb-0">{stats.total}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3 mb-md-0">
            <Card className="dark-card border-yellow-left shadow-sm h-100">
              <Card.Body>
                <h6 className="text-light-gray mb-2">Pending</h6>
                <h3 className="text-warning fw-bold mb-0">{stats.pending}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3 mb-md-0">
            <Card className="dark-card border-green-left shadow-sm h-100">
              <Card.Body>
                <h6 className="text-light-gray mb-2">Accepted</h6>
                <h3 className="text-success fw-bold mb-0">{stats.accepted}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="dark-card border-red-left shadow-sm h-100">
              <Card.Body>
                <h6 className="text-light-gray mb-2">Expired</h6>
                <h3 className="text-danger fw-bold mb-0">{stats.expired}</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          {/* Single Invitation */}
          <Col md={6} className="mb-4">
            <Card className="dark-card shadow-lg h-100 border-0">
              <Card.Header className="bg-transparent border-0 pt-4 px-4">
                <h5 className="mb-0 text-white fw-bold">Send Single Invitation</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Form onSubmit={handleSendSingle}>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-light-gray">Student Name</Form.Label>
                    <Form.Control
                      type="text"
                      className="dark-input"
                      placeholder="Student's full name"
                      value={singleName}
                      onChange={(e) => setSingleName(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-4">
                    <Form.Label className="text-light-gray">Student Email</Form.Label>
                    <Form.Control
                      type="email"
                      className="dark-input"
                      placeholder="student@example.com"
                      value={singleEmail}
                      onChange={(e) => setSingleEmail(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Button type="submit" variant="primary" className="btn-blue-glow w-100" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Invitation Email'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Bulk Invitations */}
          <Col md={6} className="mb-4">
            <Card className="dark-card shadow-lg h-100 border-0">
              <Card.Header className="bg-transparent border-0 pt-4 px-4">
                <h5 className="mb-0 text-white fw-bold">Send Bulk Invitations</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Form onSubmit={handleSendBulk}>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-light-gray">Email Addresses (one per line)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      className="dark-input"
                      placeholder="student1@example.com&#10;student2@example.com&#10;student3@example.com"
                      value={bulkEmails}
                      onChange={(e) => setBulkEmails(e.target.value)}
                    />
                    <Form.Text className="text-muted small">
                      Enter one email address per line
                    </Form.Text>
                  </Form.Group>
                  <Button type="submit" variant="success" className="btn-green-glow w-100" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Bulk Invitations'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Invitations List */}
        <Row className="mt-2">
          <Col>
            <Card className="dark-card shadow-lg border-0">
              <Card.Header className="bg-transparent border-0 pt-4 px-4">
                <h5 className="mb-0 text-white fw-bold">📋 Sent Invitations History</h5>
              </Card.Header>
              <Card.Body className="p-0">
                {invitations.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover className="custom-dark-table align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Email</th>
                          <th>Status</th>
                          <th>Sent Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invitations.map((invitation) => (
                          <tr key={invitation._id}>
                            <td className="text-white fw-bold">{invitation.studentName || 'N/A'}</td>
                            <td className="text-light-gray">{invitation.email}</td>
                            <td>
                              <Badge bg={getStatusBadge(invitation.status)}>
                                {invitation.status}
                              </Badge>
                            </td>
                            <td className="text-light-gray">{formatDateTime(invitation.createdAt)}</td>
                            <td>
                              <Button
                                size="sm"
                                variant="outline-info"
                                onClick={() => handleResend(invitation._id, invitation.email)}
                                disabled={resending === invitation._id}
                                className="me-2"
                              >
                                {resending === invitation._id ? 'Resending...' : 'Resend'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleDelete(invitation._id)}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-4">
                    <Alert variant="dark" className="bg-dark-tertiary border-0 text-white mb-0">
                      No invitations sent yet.
                    </Alert>
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
        .text-light-gray { color: #b0b0b0 !important; }
        
        .dark-card { background-color: #1a1a1a; border-radius: 12px; }
        .bg-dark-tertiary { background-color: #252525; }
        
        .border-blue-left { border-left: 4px solid #0d6efd; }
        .border-yellow-left { border-left: 4px solid #ffc107; }
        .border-green-left { border-left: 4px solid #198754; }
        .border-red-left { border-left: 4px solid #dc3545; }

        /* Form Inputs */
        .dark-input { background-color: #252525; border: 1px solid #444; color: #fff; }
        .dark-input:focus { background-color: #252525; color: #fff; border-color: #FCD535; box-shadow: 0 0 0 0.25rem rgba(252, 213, 53, 0.25); }
        
        /* Dark Table Overrides */
        .custom-dark-table { --bs-table-bg: transparent; --bs-table-color: #e0e0e0; color: #e0e0e0; margin-bottom: 0; background-color: transparent !important; }
        .custom-dark-table thead th { background-color: #252525 !important; color: #FCD535 !important; border-bottom: 2px solid rgba(255,255,255,0.1); padding: 1rem; font-weight: 600; border-top: none !important; }
        .custom-dark-table tbody td { background-color: #1a1a1a !important; color: #e0e0e0; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 1rem; }
        .custom-dark-table tbody tr:hover td { background-color: rgba(252, 213, 53, 0.08) !important; color: #ffffff; transition: background-color 0.2s ease-in-out; }

        /* Buttons */
        .btn-blue-glow:hover { box-shadow: 0 0 10px rgba(13, 110, 253, 0.5); }
        .btn-green-glow:hover { box-shadow: 0 0 10px rgba(25, 135, 84, 0.5); }
      `}</style>
    </div>
  );
};

export default SendInvitations;