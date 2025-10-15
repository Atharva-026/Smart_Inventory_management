import { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Modal } from 'react-bootstrap';
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
    <Container className="mt-4">
      <h2 className="mb-4">👥 User Management</h2>

      <Table responsive hover>
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>
                <Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>
                  {user.role}
                </Badge>
              </td>
              <td>
                <Badge bg={user.isActive ? 'success' : 'secondary'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td>{formatDate(user.createdAt)}</td>
              <td>
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

      {/* User Details Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <div>
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Phone:</strong> {selectedUser.phone}</p>
              <p><strong>Role:</strong> {selectedUser.role}</p>
              <p><strong>Status:</strong> {selectedUser.isActive ? 'Active' : 'Inactive'}</p>
              <p><strong>Joined:</strong> {formatDate(selectedUser.createdAt)}</p>
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
  );
};

export default UserManagement;