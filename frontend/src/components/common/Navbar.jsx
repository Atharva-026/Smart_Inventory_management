import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';

const NavigationBar = () => {
  const { user, logout, isAdmin, isFaculty, isStudent } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determine dashboard link based on role
  const getDashboardLink = () => {
    if (isAdmin() || isFaculty()) return '/admin';
    return '/dashboard';
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to={getDashboardLink()}>
          📦 Smart Inventory
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {/* Admin Navigation */}
            {isAdmin() && (
              <>
                <Nav.Link as={Link} to="/admin">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/admin/inventory">Inventory</Nav.Link>
                <Nav.Link as={Link} to="/admin/qr-generator">QR Generator</Nav.Link>
                <Nav.Link as={Link} to="/admin/transactions">Transactions</Nav.Link>
                <Nav.Link as={Link} to="/admin/users">Users</Nav.Link>
                <Nav.Link as={Link} to="/admin/analytics">Analytics</Nav.Link>
                <NavDropdown title="More" id="admin-dropdown">
                  <NavDropdown.Item as={Link} to="/admin/register-faculty">
                    Register Faculty
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            )}

            {/* Faculty Navigation */}
            {isFaculty() && (
              <>
                <Nav.Link as={Link} to="/admin">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/admin/inventory">Inventory</Nav.Link>
                <Nav.Link as={Link} to="/admin/qr-generator">QR Generator</Nav.Link>
                <Nav.Link as={Link} to="/admin/transactions">Transactions</Nav.Link>
                <NavDropdown title="Students" id="faculty-dropdown">
                  <NavDropdown.Item as={Link} to="/admin/send-invitations">
                    Send Invitations
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/admin/my-students">
                    My Students
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            )}

            {/* Student Navigation */}
            {isStudent() && (
              <>
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/scan">Scan QR</Nav.Link>
                <Nav.Link as={Link} to="/my-transactions">My Transactions</Nav.Link>
              </>
            )}
            
            {/* User Dropdown (All roles) */}
            <NavDropdown title={user?.name || 'User'} id="user-dropdown">
              <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;