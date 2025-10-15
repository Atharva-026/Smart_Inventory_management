import { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import inventoryService from '../../services/inventoryService';
import transactionService from '../../services/transactionService';
import userService from '../../services/userService';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    availableItems: 0,
    borrowedItems: 0,
    totalUsers: 0,
    activeTransactions: 0,
    overdueTransactions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [items, transactions, users] = await Promise.all([
        inventoryService.getAllItems(),
        transactionService.getAllTransactions(),
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
    } catch (error) {
      toast.error('Failed to fetch statistics');
      console.error('Stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  const statCards = [
    { 
      title: 'Total Items', 
      value: stats.totalItems, 
      icon: '📦', 
      color: 'primary', 
      link: '/admin/inventory',
      bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    { 
      title: 'Available Items', 
      value: stats.availableItems, 
      icon: '✅', 
      color: 'success', 
      link: '/admin/inventory',
      bgGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    { 
      title: 'Borrowed Items', 
      value: stats.borrowedItems, 
      icon: '📤', 
      color: 'warning', 
      link: '/admin/transactions',
      bgGradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    { 
      title: 'Total Users', 
      value: stats.totalUsers, 
      icon: '👥', 
      color: 'info', 
      link: '/admin/users',
      bgGradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    { 
      title: 'Active Transactions', 
      value: stats.activeTransactions, 
      icon: '🔄', 
      color: 'primary', 
      link: '/admin/transactions',
      bgGradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    { 
      title: 'Overdue Items', 
      value: stats.overdueTransactions, 
      icon: '⚠️', 
      color: 'danger', 
      link: '/admin/transactions',
      bgGradient: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)'
    }
  ];

  return (
    <Container className="mt-4">
      <div className="mb-4">
        <h2>🎛️ Admin Dashboard</h2>
        <p className="text-muted">Overview of your inventory management system</p>
      </div>

      {/* Statistics Cards */}
      <Row>
        {statCards.map((stat, index) => (
          <Col md={6} lg={4} key={index} className="mb-4">
            <Link to={stat.link} style={{ textDecoration: 'none' }}>
              <Card 
                className="h-100 border-0 shadow-sm" 
                style={{ 
                  background: stat.bgGradient,
                  color: 'white',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="mb-1" style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                        {stat.title}
                      </p>
                      <h2 className="mb-0" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                        {stat.value}
                      </h2>
                    </div>
                    <div style={{ fontSize: '3.5rem', opacity: 0.8 }}>
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
      <Row className="mt-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 pt-4">
              <h5 className="mb-0">⚡ Quick Actions</h5>
            </Card.Header>
            <Card.Body className="pb-4">
              <Row>
                <Col md={6} lg={4} className="mb-3">
                  <Link to="/admin/inventory" style={{ textDecoration: 'none' }}>
                    <div className="d-grid">
                      <button className="btn btn-primary btn-lg">
                        📦 Manage Inventory
                      </button>
                    </div>
                  </Link>
                </Col>
                <Col md={6} lg={4} className="mb-3">
                  <Link to="/admin/qr-generator" style={{ textDecoration: 'none' }}>
                    <div className="d-grid">
                      <button className="btn btn-success btn-lg">
                        🔲 Generate QR Codes
                      </button>
                    </div>
                  </Link>
                </Col>
                <Col md={6} lg={4} className="mb-3">
                  <Link to="/admin/transactions" style={{ textDecoration: 'none' }}>
                    <div className="d-grid">
                      <button className="btn btn-info btn-lg">
                        📋 View Transactions
                      </button>
                    </div>
                  </Link>
                </Col>
                <Col md={6} lg={4} className="mb-3">
                  <Link to="/admin/users" style={{ textDecoration: 'none' }}>
                    <div className="d-grid">
                      <button className="btn btn-warning btn-lg">
                        👥 Manage Users
                      </button>
                    </div>
                  </Link>
                </Col>
                <Col md={6} lg={4} className="mb-3">
                  <Link to="/admin/analytics" style={{ textDecoration: 'none' }}>
                    <div className="d-grid">
                      <button className="btn btn-secondary btn-lg">
                        📊 View Analytics
                      </button>
                    </div>
                  </Link>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row className="mt-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 pt-4">
              <h5 className="mb-0">📌 System Status</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4} className="text-center mb-3">
                  <div className="p-3">
                    <div className="mb-2" style={{ fontSize: '2rem' }}>
                      {stats.overdueTransactions > 0 ? '⚠️' : '✅'}
                    </div>
                    <h6>
                      {stats.overdueTransactions > 0 
                        ? `${stats.overdueTransactions} Overdue Items` 
                        : 'No Overdue Items'}
                    </h6>
                    <p className="text-muted small mb-0">
                      {stats.overdueTransactions > 0 
                        ? 'Requires attention' 
                        : 'All items returned on time'}
                    </p>
                  </div>
                </Col>
                <Col md={4} className="text-center mb-3">
                  <div className="p-3">
                    <div className="mb-2" style={{ fontSize: '2rem' }}>
                      {stats.availableItems > 0 ? '📦' : '🔴'}
                    </div>
                    <h6>
                      {stats.availableItems} Available Items
                    </h6>
                    <p className="text-muted small mb-0">
                      {stats.availableItems > 0 
                        ? 'Ready for borrowing' 
                        : 'No items available'}
                    </p>
                  </div>
                </Col>
                <Col md={4} className="text-center mb-3">
                  <div className="p-3">
                    <div className="mb-2" style={{ fontSize: '2rem' }}>
                      🔄
                    </div>
                    <h6>
                      {stats.activeTransactions} Active Loans
                    </h6>
                    <p className="text-muted small mb-0">
                      Currently in circulation
                    </p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;