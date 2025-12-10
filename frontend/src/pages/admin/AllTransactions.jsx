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
    <div className="page-dark">
      <Container className="pt-4 pb-5">
        <h2 className="mb-4 text-white fw-bold">📋 All <span className="text-yellow">Transactions</span></h2>

        <Row className="mb-4">
          <Col md={4}>
            <Form.Select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="dark-input"
            >
              <option value="all">All Transactions</option>
              <option value="active">Active</option>
              <option value="returned">Returned</option>
              <option value="overdue">Overdue</option>
            </Form.Select>
          </Col>
        </Row>

        <Card className="dark-card shadow-lg border-0">
          <Card.Body className="p-0">
            <div className="table-responsive">
                <Table hover className="custom-dark-table align-middle mb-0">
                <thead>
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
                            <strong className="text-white">{transaction.user?.name}</strong>
                            <br />
                            <small className="text-muted">{transaction.user?.email}</small>
                        </td>
                        <td>
                            <strong className="text-yellow">{transaction.item?.name}</strong>
                            <br />
                            <small className="text-muted">{transaction.item?.itemId}</small>
                        </td>
                        <td className="text-light">{formatDateTime(transaction.borrowDate)}</td>
                        <td className="text-light">{formatDateTime(transaction.dueDate)}</td>
                        <td className="text-light">{transaction.returnDate ? formatDateTime(transaction.returnDate) : '-'}</td>
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
            </div>
          </Card.Body>
        </Card>
      </Container>

      <style>{`
        :root {
            --bg-dark: #0a0a0a;
            --bg-card: #1a1a1a;
            --text-yellow: #FCD535;
        }
        .page-dark { background-color: var(--bg-dark); min-height: 100vh; color: #e0e0e0; }
        .text-yellow { color: var(--text-yellow) !important; }
        
        .dark-card { background-color: var(--bg-card); border-radius: 12px; }
        
        .dark-input {
            background-color: #252525;
            border: 1px solid #444;
            color: #fff;
        }
        .dark-input:focus {
            background-color: #252525;
            color: #fff;
            border-color: var(--text-yellow);
            box-shadow: 0 0 0 0.25rem rgba(252, 213, 53, 0.25);
        }

        .custom-dark-table { --bs-table-bg: transparent; color: #e0e0e0; }
        .custom-dark-table thead th {
            background-color: rgba(255,255,255,0.05);
            color: var(--text-yellow);
            border-bottom: 1px solid rgba(255,255,255,0.1);
            padding: 1rem;
        }
        .custom-dark-table tbody td {
            border-bottom: 1px solid rgba(255,255,255,0.05);
            padding: 1rem;
        }
        .custom-dark-table tbody tr:hover { background-color: rgba(252, 213, 53, 0.05); }
      `}</style>
    </div>
  );
};

export default AllTransactions;