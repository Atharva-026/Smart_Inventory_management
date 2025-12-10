import { useState, useEffect } from 'react';
import { Container, Table, Badge, Card, Button, Alert } from 'react-bootstrap';
import transactionService from '../../services/transactionService';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';
import { formatDateTime, getDaysRemaining } from '../../utils/helpers';

const MyTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const data = await transactionService.getMyTransactions();
      setTransactions(data);
    } catch (error) {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (transactionId) => {
    if (window.confirm('Are you sure you want to return this item?')) {
      try {
        await transactionService.returnItem(transactionId);
        toast.success('Item returned successfully!');
        fetchTransactions();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to return item');
      }
    }
  };

  if (loading) return <Loader />;

  const getStatusBadgeClass = (status) => {
    const classes = {
      active: 'primary',
      returned: 'success',
      overdue: 'danger'
    };
    return classes[status] || 'secondary';
  };

  return (
    <div className="page-dark">
      <Container className="pt-4 pb-5">
        <h2 className="mb-4 text-white fw-bold">My <span className="text-yellow">Transactions</span></h2>

        {transactions.length === 0 ? (
          <Alert variant="dark" className="bg-dark-tertiary border-0 text-white shadow-sm">
            <h5>No transactions yet</h5>
            <p className="mb-0 text-muted">Start borrowing items to see your transaction history</p>
          </Alert>
        ) : (
          <Card className="dark-card shadow-lg border-0 overflow-hidden">
            <Card.Body className="p-0">
              <div className="table-responsive">
                {/* Removed 'hover' prop from Bootstrap Table component to handle hover manually in CSS for better control */}
                <Table className="custom-dark-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Borrowed Date</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Days Left</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(transaction => {
                      const daysLeft = getDaysRemaining(transaction.dueDate);
                      return (
                        <tr key={transaction._id}>
                          <td>
                            <strong className="text-white">{transaction.item?.name}</strong>
                            <br />
                            <small className="text-light-gray font-monospace">{transaction.item?.itemId}</small>
                          </td>
                          <td className="text-light-gray">{formatDateTime(transaction.borrowDate)}</td>
                          <td className="text-light-gray">{formatDateTime(transaction.dueDate)}</td>
                          <td>
                            <Badge bg={getStatusBadgeClass(transaction.status)}>
                              {transaction.status}
                            </Badge>
                          </td>
                          <td>
                            {transaction.status === 'active' && daysLeft !== null && (
                              <span className={daysLeft < 0 ? 'text-danger fw-bold' : daysLeft < 3 ? 'text-warning' : 'text-success'}>
                                {daysLeft < 0 ? `${Math.abs(daysLeft)} overdue` : `${daysLeft} days left`}
                              </span>
                            )}
                            {transaction.status === 'returned' && (
                              <span className="text-muted">Returned</span>
                            )}
                          </td>
                          <td>
                            {transaction.status === 'active' && (
                              <Button 
                                size="sm" 
                                variant="primary"
                                className="btn-blue-glow"
                                onClick={() => handleReturn(transaction._id)}
                              >
                                Return
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}
      </Container>

      <style>{`
        .page-dark { background-color: #0a0a0a; min-height: 100vh; color: #e0e0e0; }
        .text-yellow { color: #FCD535 !important; }
        .text-light-gray { color: #b0b0b0 !important; }
        
        .dark-card { background-color: #1a1a1a; border-radius: 12px; }
        .bg-dark-tertiary { background-color: #252525; }

        /* --- STRONG DARK TABLE OVERRIDES --- */
        
        /* Reset table variables */
        .custom-dark-table { 
            --bs-table-bg: transparent;
            --bs-table-accent-bg: transparent;
            --bs-table-striped-bg: transparent;
            --bs-table-border-color: rgba(255,255,255,0.1);
            color: #e0e0e0;
            margin-bottom: 0;
            background-color: transparent !important; /* Ensure table element itself is clear */
        }

        /* Force header cells to be dark */
        .custom-dark-table thead th { 
            background-color: #252525 !important; /* Slightly lighter dark for header */
            color: #FCD535 !important; /* Yellow Text */
            border-bottom: 2px solid rgba(255,255,255,0.1); 
            padding: 1rem; 
            font-weight: 600;
            border-top: none !important;
        }

        /* Force body cells to be dark (matches card background) */
        .custom-dark-table tbody td { 
            background-color: #1a1a1a !important; 
            color: #e0e0e0;
            border-bottom: 1px solid rgba(255,255,255,0.05); 
            padding: 1rem; 
        }

        /* Custom Hover Effect */
        .custom-dark-table tbody tr:hover td {
            background-color: rgba(252, 213, 53, 0.08) !important; /* Subtle yellow tint on hover */
            color: #ffffff;
            transition: background-color 0.2s ease-in-out;
        }
        
        .btn-blue-glow:hover { box-shadow: 0 0 10px rgba(13, 110, 253, 0.5); }
      `}</style>
    </div>
  );
};

export default MyTransactions;