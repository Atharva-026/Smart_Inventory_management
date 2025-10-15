import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table } from 'react-bootstrap';
import inventoryService from '../../services/inventoryService';
import transactionService from '../../services/transactionService';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    mostBorrowedItems: [],
    categoryStats: {},
    userStats: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [items, transactions] = await Promise.all([
        inventoryService.getAllItems(),
        transactionService.getAllTransactions()
      ]);

      // Calculate most borrowed items
      const itemBorrowCount = {};
      transactions.forEach(t => {
        const itemId = t.item?._id;
        if (itemId) {
          itemBorrowCount[itemId] = (itemBorrowCount[itemId] || 0) + 1;
        }
      });

      const mostBorrowed = Object.entries(itemBorrowCount)
        .map(([itemId, count]) => ({
          item: items.find(i => i._id === itemId),
          count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Calculate category stats
      const categoryStats = {};
      items.forEach(item => {
        categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
      });

      setAnalytics({
        mostBorrowedItems: mostBorrowed,
        categoryStats
      });
    } catch (error) {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <Container className="mt-4">
      <h2 className="mb-4">📊 Analytics & Reports</h2>

      <Row>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Most Borrowed Items</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item Name</th>
                    <th>Times Borrowed</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.mostBorrowedItems.map((data, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{data.item?.name || 'Unknown'}</td>
                      <td><strong>{data.count}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Category Distribution</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Total Items</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(analytics.categoryStats).map(([category, count]) => (
                    <tr key={category}>
                      <td>{category}</td>
                      <td><strong>{count}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Analytics;