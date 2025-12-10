import { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Modal, Card } from 'react-bootstrap';
import userService from '../../services/userService';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/helpers';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleToggleStatus = async (userId) => {
    try {
      await userService.toggleUserStatus(userId);
      toast.success('User status updated!');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(userId);
        toast.success('User deleted successfully!');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="page-dark">
      <Container className="pt-4 pb-5">
        <h2 className="mb-4 text-white fw-bold">👥 User <span className="text-yellow">Management</span></h2>

        <Card className="dark-card shadow-lg border-0">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="custom-dark-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td className="text-white fw-bold">{user.name}</td>
                      <td className="text-light-gray">{user.email}</td>
                      <td className="text-light-gray">{user.phone}</td>
                      <td>
                        <Badge bg={user.role === 'admin' ? 'danger' : 'primary'} className="border border-light-subtle">
                          {user.role}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={user.isActive ? 'success' : 'secondary'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="text-light-gray">{formatDate(user.createdAt)}</td>
                      <td className="text-center">
                        <Button 
                          size="sm" 
                          variant="outline-info" 
                          className="me-2"
                          onClick={() => handleShowModal(user)}
                        >
                          View
                        </Button>
                        {user.role !== 'admin' && (
                          <>
                            <Button 
                              size="sm" 
                              variant={user.isActive ? 'outline-warning' : 'outline-success'}
                              className="me-2"
                              onClick={() => handleToggleStatus(user._id)}
                            >
                              {user.isActive ? 'Block' : 'Activate'}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline-danger"
                              onClick={() => handleDeleteUser(user._id)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        {/* User Details Modal */}
        <Modal show={showModal} onHide={handleCloseModal} contentClassName="modal-dark">
          <Modal.Header closeButton closeVariant="white">
            <Modal.Title className="text-white">User Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedUser && (
              <div className="text-light-gray">
                <p><strong className="text-white">Name:</strong> {selectedUser.name}</p>
                <p><strong className="text-white">Email:</strong> {selectedUser.email}</p>
                <p><strong className="text-white">Phone:</strong> {selectedUser.phone}</p>
                <p><strong className="text-white">Role:</strong> <span className="text-yellow">{selectedUser.role}</span></p>
                <p><strong className="text-white">Status:</strong> {selectedUser.isActive ? 'Active' : 'Inactive'}</p>
                <p><strong className="text-white">Joined:</strong> {formatDate(selectedUser.createdAt)}</p>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>

      <style>{`
        .page-dark { background-color: #0a0a0a; min-height: 100vh; color: #e0e0e0; }
        .text-yellow { color: #FCD535 !important; }
        .text-light-gray { color: #b0b0b0 !important; }
        
        .dark-card { background-color: #1a1a1a; border-radius: 12px; }

        /* --- Dark Table Overrides --- */
        .custom-dark-table { 
            --bs-table-bg: transparent; 
            --bs-table-color: #e0e0e0; 
            color: #e0e0e0; 
            margin-bottom: 0;
            background-color: transparent !important;
        }
        .custom-dark-table thead th { 
            background-color: #252525 !important; 
            color: #FCD535 !important; 
            border-bottom: 2px solid rgba(255,255,255,0.1); 
            padding: 1rem; 
            font-weight: 600;
            border-top: none !important;
        }
        .custom-dark-table tbody td { 
            background-color: #1a1a1a !important; 
            color: #e0e0e0;
            border-bottom: 1px solid rgba(255,255,255,0.05); 
            padding: 1rem; 
        }
        .custom-dark-table tbody tr:hover td {
            background-color: rgba(252, 213, 53, 0.08) !important;
            color: #ffffff;
            transition: background-color 0.2s ease-in-out;
        }

        /* Modal Styling */
        .modal-dark { background-color: #1a1a1a; color: #fff; border: 1px solid #333; }
        .modal-dark .modal-header { border-bottom: 1px solid #333; }
        .modal-dark .modal-footer { border-top: 1px solid #333; }
        .modal-dark .btn-close { filter: invert(1); }
      `}</style>
    </div>
  );
};

export default UserManagement;