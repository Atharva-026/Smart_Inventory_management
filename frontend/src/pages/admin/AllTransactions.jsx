import { useState, useEffect } from 'react';
import { Container, Table, Badge, Form, Row, Col, Card } from 'react-bootstrap';
import transactionService from '../../services/transactionService';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';
import { formatDateTime, getDaysRemaining, getStatusBadgeClass } from '../../utils/helpers';

const AllTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const data = await transactionService.getAllTransactions();
      setTransactions(data);
    } catch (error) {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  if (loading) return <Loader />;

  return (
    <Container className="mt-4">
      <h2 className="mb-4">📋 All Transactions</h2>

      <Row className="mb-4">
        <Col md={4}>
          <Form.Select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Transactions</option>
            <option value="active">Active</option>
            <option value="returned">Returned</option>
            <option value="overdue">Overdue</option>
          </Form.Select>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead className="table-dark">
              <tr>
                <th>User</th>
                <th>Item</th>
                <th>Borrowed Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Days</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(transaction => {
                const daysLeft = getDaysRemaining(transaction.dueDate);
                return (
                  <tr key={transaction._id}>
                    <td>
                      <strong>{transaction.user?.name}</strong>
                      <br />
                      <small className="text-muted">{transaction.user?.email}</small>
                    </td>
                    <td>
                      <strong>{transaction.item?.name}</strong>
                      <br />
                      <small className="text-muted">{transaction.item?.itemId}</small>
                    </td>
                    <td>{formatDateTime(transaction.borrowDate)}</td>
                    <td>{formatDateTime(transaction.dueDate)}</td>
                    <td>{transaction.returnDate ? formatDateTime(transaction.returnDate) : '-'}</td>
                    <td>
                      <Badge bg={getStatusBadgeClass(transaction.status).replace('bg-', '')}>
                        {transaction.status}
                      </Badge>
                    </td>
                    <td>
                      {transaction.status === 'active' && daysLeft !== null && (
                        <span className={daysLeft < 0 ? 'text-danger fw-bold' : daysLeft < 3 ? 'text-warning' : 'text-success'}>
                          {daysLeft < 0 ? `${Math.abs(daysLeft)} overdue` : `${daysLeft} left`}
                        </span>
                      )}
                      {transaction.status === 'returned' && (
                        <span className="text-success">✓</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AllTransactions;