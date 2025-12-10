import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import authService from '../../services/authService';
import { toast } from 'react-toastify';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    role: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await authService.getProfile();
      setProfile(data);
    } catch (error) {
      toast.error('Failed to fetch profile');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.updateProfile(profile);
      toast.success('Profile updated successfully!');
      setEditMode(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-dark">
      <Container className="pt-4 pb-5">
        <h2 className="mb-4 text-white fw-bold">👤 My <span className="text-yellow">Profile</span></h2>

        <Row>
          <Col md={6} className="mb-4">
            <Card className="dark-card shadow-lg h-100">
              <Card.Header className="bg-transparent border-0 pt-4 px-4">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 text-white">Profile Information</h5>
                  {!editMode && (
                    <Button size="sm" variant="outline-warning" className="btn-outline-yellow" onClick={() => setEditMode(true)}>
                      Edit
                    </Button>
                  )}
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                <Form onSubmit={handleProfileUpdate}>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-muted">Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      className="dark-input"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      disabled={!editMode}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="text-muted">Email</Form.Label>
                    <Form.Control
                      type="email"
                      className="dark-input"
                      value={profile.email}
                      disabled
                    />
                    <Form.Text className="text-muted small">Email cannot be changed</Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="text-muted">Phone</Form.Label>
                    <Form.Control
                      type="tel"
                      className="dark-input"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      disabled={!editMode}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="text-muted">Role</Form.Label>
                    <Form.Control
                      type="text"
                      className="dark-input"
                      value={profile.role}
                      disabled
                    />
                  </Form.Group>

                  {editMode && (
                    <div className="d-flex gap-2">
                      <Button type="submit" variant="warning" className="btn-yellow" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button variant="outline-light" onClick={() => {
                        setEditMode(false);
                        fetchProfile();
                      }}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} className="mb-4">
            <Card className="dark-card shadow-lg h-100">
              <Card.Header className="bg-transparent border-0 pt-4 px-4">
                <h5 className="mb-0 text-white">Change Password</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <Form onSubmit={handlePasswordChange}>
                  <Form.Group className="mb-3">
                    <Form.Label className="text-muted">Current Password</Form.Label>
                    <Form.Control
                      type="password"
                      className="dark-input"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="text-muted">New Password</Form.Label>
                    <Form.Control
                      type="password"
                      className="dark-input"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="text-muted">Confirm New Password</Form.Label>
                    <Form.Control
                      type="password"
                      className="dark-input"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      required
                    />
                  </Form.Group>

                  <Button type="submit" variant="warning" className="btn-yellow w-100" disabled={loading}>
                    {loading ? 'Changing...' : 'Change Password'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style>{`
        .page-dark { background-color: #0a0a0a; min-height: 100vh; color: #e0e0e0; }
        .text-yellow { color: #FCD535 !important; }
        
        .dark-card { background-color: #1a1a1a; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); }
        
        .dark-input { background-color: #252525; border: 1px solid #444; color: #fff; }
        .dark-input:focus { background-color: #252525; color: #fff; border-color: #FCD535; box-shadow: 0 0 0 0.25rem rgba(252, 213, 53, 0.25); }
        .dark-input:disabled { background-color: #151515; opacity: 0.7; }
        
        .btn-yellow { background-color: #FCD535; border: none; color: #000; font-weight: 600; }
        .btn-yellow:hover { background-color: #e0bc20; color: #000; transform: translateY(-2px); }
        
        .btn-outline-yellow { color: #FCD535; border-color: #FCD535; }
        .btn-outline-yellow:hover { background-color: #FCD535; color: #000; }
      `}</style>
    </div>
  );
};

export default Profile;