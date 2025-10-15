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
    <Container className="mt-4">
      <h2 className="mb-4">My Transactions</h2>

      {transactions.length === 0 ? (
        <Alert variant="info">
          <h5>No transactions yet</h5>
          <p className="mb-0">Start borrowing items to see your transaction history</p>
        </Alert>
      ) : (
        <Card>
          <Card.Body>
            <Table responsive hover>
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
                        <strong>{transaction.item?.name}</strong>
                        <br />
                        <small className="text-muted">{transaction.item?.itemId}</small>
                      </td>
                      <td>{formatDateTime(transaction.borrowDate)}</td>
                      <td>{formatDateTime(transaction.dueDate)}</td>
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
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default MyTransactions;