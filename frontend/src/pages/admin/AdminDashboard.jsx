import { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import inventoryService from '../../services/inventoryService';
import transactionService from '../../services/transactionService';
import userService from '../../services/userService';
import authService from '../../services/authService';
import invitationService from '../../services/invitationService';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const { isAdmin, isFaculty } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalItems: 0,
    availableItems: 0,
    borrowedItems: 0,
    totalUsers: 0,
    activeTransactions: 0,
    overdueTransactions: 0,
    myStudents: 0,
    invitationsSent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      if (isAdmin()) {
        // Admin sees everything
        const [items, transactions, users] = await Promise.all([
          inventoryService.getAllItems(),
          transactionService.getAllTransactions().catch(() => []),
          userService.getAllUsers()
        ]);

        setStats({
          totalItems: items.length,
          availableItems: items.filter(i => i.status === 'available').length,
          borrowedItems: items.filter(i => i.status === 'borrowed').length,
          totalUsers: users.length,
          activeTransactions: transactions.filter(t => t.status === 'active').length,
          overdueTransactions: transactions.filter(t => t.status === 'overdue').length
        });
      } else if (isFaculty()) {
        // Faculty sees their own data
        const [items, students, invitationStats] = await Promise.all([
          inventoryService.getAllItems(),
          authService.getMyStudents().catch(() => []),
          invitationService.getInvitationStats().catch(() => ({ total: 0, accepted: 0 }))
        ]);

        setStats({
          totalItems: items.length,
          availableItems: items.filter(i => i.status === 'available').length,
          borrowedItems: items.filter(i => i.status === 'borrowed').length,
          myStudents: students.length,
          invitationsSent: invitationStats.total || 0,
          invitationsAccepted: invitationStats.accepted || 0
        });
      }
    } catch (error) {
      toast.error('Failed to fetch statistics');
      console.error('Stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  // Different stat cards for Admin vs Faculty
  // THEME UPDATE: Updated bgGradient to use CSS variables/classes logic or darker gradients
  const statCards = isAdmin() ? [
    { 
      title: 'Total Items', 
      value: stats.totalItems, 
      icon: '📦', 
      color: 'primary', 
      link: '/admin/inventory',
      borderClass: 'border-yellow'
    },
    { 
      title: 'Available Items', 
      value: stats.availableItems, 
      icon: '✅', 
      color: 'success', 
      link: '/admin/inventory',
      borderClass: 'border-green'
    },
    { 
      title: 'Borrowed Items', 
      value: stats.borrowedItems, 
      icon: '📤', 
      color: 'warning', 
      link: '/admin/transactions',
      borderClass: 'border-blue'
    },
    { 
      title: 'Total Users', 
      value: stats.totalUsers, 
      icon: '👥', 
      color: 'info', 
      link: '/admin/users',
      borderClass: 'border-purple'
    },
    { 
      title: 'Active Transactions', 
      value: stats.activeTransactions, 
      icon: '🔄', 
      color: 'primary', 
      link: '/admin/transactions',
      borderClass: 'border-orange'
    },
    { 
      title: 'Overdue Items', 
      value: stats.overdueTransactions, 
      icon: '⚠️', 
      color: 'danger', 
      link: '/admin/transactions',
      borderClass: 'border-red'
    }
  ] : [
    { 
      title: 'My Items', 
      value: stats.totalItems, 
      icon: '📦', 
      color: 'primary', 
      link: '/admin/inventory',
      borderClass: 'border-yellow'
    },
    { 
      title: 'Available Items', 
      value: stats.availableItems, 
      icon: '✅', 
      color: 'success', 
      link: '/admin/inventory',
      borderClass: 'border-green'
    },
    { 
      title: 'Borrowed Items', 
      value: stats.borrowedItems, 
      icon: '📤', 
      color: 'warning', 
      link: '/admin/transactions',
      borderClass: 'border-blue'
    },
    { 
      title: 'My Students', 
      value: stats.myStudents, 
      icon: '👥', 
      color: 'info', 
      link: '/admin/my-students',
      borderClass: 'border-purple'
    },
    { 
      title: 'Invitations Sent', 
      value: stats.invitationsSent, 
      icon: '✉️', 
      color: 'primary', 
      link: '/admin/send-invitations',
      borderClass: 'border-orange'
    },
    { 
      title: 'Students Joined', 
      value: stats.invitationsAccepted, 
      icon: '✓', 
      color: 'success', 
      link: '/admin/my-students',
      borderClass: 'border-cyan'
    }
  ];

  return (
    <div className="admin-dashboard-dark">
      <Container className="pt-4 pb-5">
        <div className="mb-4 d-flex align-items-center justify-content-between">
          <div>
            <h2 className="text-white fw-bold mb-1">
              {isAdmin() ? '🎛️ Admin Dashboard' : '🎓 Faculty Dashboard'}
            </h2>
            <p className="text-muted-light mb-0">
              {isAdmin() ? 'Overview of your inventory management system' : 'Manage your inventory and students'}
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <Row>
          {statCards.map((stat, index) => (
            <Col md={6} lg={4} key={index} className="mb-4">
              <Link to={stat.link} style={{ textDecoration: 'none' }}>
                <Card 
                  className={`h-100 dark-card hover-lift ${stat.borderClass}`}
                >
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <p className="mb-1 text-muted-light fw-medium" style={{ fontSize: '0.9rem' }}>
                          {stat.title}
                        </p>
                        <h2 className="mb-0 text-white fw-bold" style={{ fontSize: '2.5rem' }}>
                          {stat.value}
                        </h2>
                      </div>
                      <div className="stat-icon-container">
                        {stat.icon}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>

        {/* Quick Actions */}
        <Row className="mt-2">
          <Col>
            <Card className="dark-card border-0 shadow-lg">
              <Card.Header className="bg-transparent border-0 pt-4 px-4">
                <h5 className="mb-0 text-white fw-bold">⚡ Quick Actions</h5>
              </Card.Header>
              <Card.Body className="pb-4 px-4">
                <Row>
                  {/* Common actions for both */}
                  <Col md={6} lg={4} className="mb-3">
                    <Link to="/admin/inventory" style={{ textDecoration: 'none' }}>
                      <div className="d-grid">
                        <button className="btn btn-action btn-blue-glow">
                          📦 Manage Inventory
                        </button>
                      </div>
                    </Link>
                  </Col>
                  <Col md={6} lg={4} className="mb-3">
                    <Link to="/admin/qr-generator" style={{ textDecoration: 'none' }}>
                      <div className="d-grid">
                        <button className="btn btn-action btn-green-glow">
                          🔲 Generate QR Codes
                        </button>
                      </div>
                    </Link>
                  </Col>
                  <Col md={6} lg={4} className="mb-3">
                    <Link to="/admin/transactions" style={{ textDecoration: 'none' }}>
                      <div className="d-grid">
                        <button className="btn btn-action btn-purple-glow">
                          📋 View Transactions
                        </button>
                      </div>
                    </Link>
                  </Col>

                  {/* Admin-only actions */}
                  {isAdmin() && (
                    <>
                      <Col md={6} lg={4} className="mb-3">
                        <Link to="/admin/users" style={{ textDecoration: 'none' }}>
                          <div className="d-grid">
                            <button className="btn btn-action btn-yellow-glow">
                              👥 Manage Users
                            </button>
                          </div>
                        </Link>
                      </Col>
                      <Col md={6} lg={4} className="mb-3">
                        <Link to="/admin/analytics" style={{ textDecoration: 'none' }}>
                          <div className="d-grid">
                            <button className="btn btn-action btn-orange-glow">
                              📊 View Analytics
                            </button>
                          </div>
                        </Link>
                      </Col>
                      <Col md={6} lg={4} className="mb-3">
                        <Link to="/admin/register-faculty" style={{ textDecoration: 'none' }}>
                          <div className="d-grid">
                            <button className="btn btn-action btn-red-glow">
                              ➕ Register Faculty
                            </button>
                          </div>
                        </Link>
                      </Col>
                    </>
                  )}

                  {/* Faculty-only actions */}
                  {isFaculty() && (
                    <>
                      <Col md={6} lg={4} className="mb-3">
                        <Link to="/admin/send-invitations" style={{ textDecoration: 'none' }}>
                          <div className="d-grid">
                            <button className="btn btn-action btn-yellow-glow">
                              ✉️ Send Invitations
                            </button>
                          </div>
                        </Link>
                      </Col>
                      <Col md={6} lg={4} className="mb-3">
                        <Link to="/admin/my-students" style={{ textDecoration: 'none' }}>
                          <div className="d-grid">
                            <button className="btn btn-action btn-cyan-glow">
                              👥 My Students
                            </button>
                          </div>
                        </Link>
                      </Col>
                    </>
                  )}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style>{`
        :root {
            --theme-bg-main: #0a0a0a;
            --theme-bg-card: #1a1a1a;
            --theme-text-muted: #a0a0a0;
            
            --color-yellow: #FCD535;
            --color-green: #00E676;
            --color-blue: #2979FF;
            --color-purple: #E040FB;
            --color-orange: #FF9100;
            --color-red: #FF1744;
            --color-cyan: #00BCD4;
        }

        .admin-dashboard-dark {
            background-color: var(--theme-bg-main);
            min-height: 100vh;
            color: #e0e0e0;
            width: 100%;
        }

        .text-white { color: #ffffff !important; }
        .text-muted-light { color: var(--theme-text-muted) !important; }

        /* Card Styles */
        .dark-card {
            background-color: var(--theme-bg-card);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 12px;
            transition: all 0.3s ease;
        }

        .hover-lift:hover {
            transform: translateY(-5px);
            background-color: #222;
            box-shadow: 0 10px 20px rgba(0,0,0,0.5);
        }

        /* Stat Card Borders (Left border accent) */
        .border-yellow { border-left: 4px solid var(--color-yellow); }
        .border-green { border-left: 4px solid var(--color-green); }
        .border-blue { border-left: 4px solid var(--color-blue); }
        .border-purple { border-left: 4px solid var(--color-purple); }
        .border-orange { border-left: 4px solid var(--color-orange); }
        .border-red { border-left: 4px solid var(--color-red); }
        .border-cyan { border-left: 4px solid var(--color-cyan); }

        .stat-icon-container {
            font-size: 3rem;
            opacity: 0.8;
            filter: drop-shadow(0 0 10px rgba(255,255,255,0.1));
        }

        /* Action Buttons */
        .btn-action {
            padding: 15px;
            font-size: 1.1rem;
            font-weight: 600;
            border: none;
            border-radius: 8px;
            color: white;
            background-color: #252525;
            transition: all 0.3s ease;
            text-align: center;
        }

        .btn-action:hover {
            transform: translateY(-2px);
            color: #000;
        }

        /* Button Glow Colors on Hover */
        .btn-blue-glow:hover { background-color: var(--color-blue); box-shadow: 0 0 15px rgba(41, 121, 255, 0.4); }
        .btn-green-glow:hover { background-color: var(--color-green); box-shadow: 0 0 15px rgba(0, 230, 118, 0.4); }
        .btn-purple-glow:hover { background-color: var(--color-purple); box-shadow: 0 0 15px rgba(224, 64, 251, 0.4); }
        .btn-yellow-glow:hover { background-color: var(--color-yellow); box-shadow: 0 0 15px rgba(252, 213, 53, 0.4); }
        .btn-orange-glow:hover { background-color: var(--color-orange); box-shadow: 0 0 15px rgba(255, 145, 0, 0.4); }
        .btn-red-glow:hover { background-color: var(--color-red); box-shadow: 0 0 15px rgba(255, 23, 68, 0.4); }
        .btn-cyan-glow:hover { background-color: var(--color-cyan); box-shadow: 0 0 15px rgba(0, 188, 212, 0.4); }

      `}</style>
    </div>
  );
};

export default AdminDashboard;