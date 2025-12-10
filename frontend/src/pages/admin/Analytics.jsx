import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Badge } from 'react-bootstrap';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area
} from 'recharts';
import inventoryService from '../../services/inventoryService';
import transactionService from '../../services/transactionService';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';

// --- FIXED IMPORTS FOR PDF GENERATION ---
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    mostBorrowedItems: [],
    categoryStats: {},
    userStats: [],
    facultyStockStats: [],
    stockLevels: [],
    borrowTrends: [],
    statusDistribution: [],
    totalItems: 0,
    totalTransactions: 0,
    activeTransactions: 0
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');
  const [selectedChart, setSelectedChart] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Use your actual service calls here
      const [items, transactions] = await Promise.all([
        inventoryService.getAllItems(),
        transactionService.getAllTransactions()
      ]);

      const filteredTransactions = filterByDateRange(transactions, dateRange);

      // --- Data Processing Logic (Same as before) ---
      const itemBorrowCount = {};
      filteredTransactions.forEach(t => {
        const itemId = t.item?._id;
        if (itemId) itemBorrowCount[itemId] = (itemBorrowCount[itemId] || 0) + 1;
      });

      const mostBorrowed = Object.entries(itemBorrowCount)
        .map(([itemId, count]) => {
          const item = items.find(i => i._id === itemId);
          return {
            item: item,
            name: item?.name || 'Unknown',
            count,
            category: item?.category || 'Other'
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const categoryStats = {};
      items.forEach(item => {
        categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;
      });

      const categoryData = Object.entries(categoryStats).map(([name, value]) => ({
        name,
        value,
        percentage: ((value / items.length) * 100).toFixed(1)
      }));

      const statusDistribution = {
        available: items.filter(i => i.status === 'available').length,
        borrowed: items.filter(i => i.status === 'borrowed').length,
        maintenance: items.filter(i => i.status === 'maintenance').length,
        damaged: items.filter(i => i.status === 'damaged').length
      };

      const statusData = Object.entries(statusDistribution).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
      }));

      const facultyStockMap = {};
      items.forEach(item => {
        const facultyId = item.addedBy?._id;
        const facultyName = item.addedBy?.name || 'Unknown Faculty';
        
        if (!facultyStockMap[facultyId]) {
          facultyStockMap[facultyId] = {
            name: facultyName,
            totalItems: 0,
            available: 0,
            borrowed: 0,
            maintenance: 0
          };
        }
        
        facultyStockMap[facultyId].totalItems++;
        if (item.status === 'available') facultyStockMap[facultyId].available++;
        if (item.status === 'borrowed') facultyStockMap[facultyId].borrowed++;
        if (item.status === 'maintenance') facultyStockMap[facultyId].maintenance++;
      });

      const facultyStockStats = Object.values(facultyStockMap).sort((a, b) => 
        b.totalItems - a.totalItems
      );

      const stockLevels = items
        .filter(item => item.quantity !== undefined)
        .map(item => ({
          name: item.name,
          itemId: item.itemId,
          quantity: item.quantity || 0,
          status: item.status,
          category: item.category
        }))
        .sort((a, b) => a.quantity - b.quantity)
        .slice(0, 15);

      const borrowTrends = calculateBorrowTrends(filteredTransactions);

      const userActivityMap = {};
      filteredTransactions.forEach(t => {
        const userId = t.user?._id;
        const userName = t.user?.name || 'Unknown User';
        if (!userActivityMap[userId]) {
          userActivityMap[userId] = { name: userName, borrowed: 0, returned: 0, active: 0 };
        }
        userActivityMap[userId].borrowed++;
        if (t.status === 'returned') userActivityMap[userId].returned++;
        if (t.status === 'active') userActivityMap[userId].active++;
      });

      const userStats = Object.values(userActivityMap)
        .sort((a, b) => b.borrowed - a.borrowed)
        .slice(0, 10);

      setAnalytics({
        mostBorrowedItems: mostBorrowed,
        categoryStats: categoryData,
        userStats,
        facultyStockStats,
        stockLevels,
        borrowTrends,
        statusDistribution: statusData,
        totalItems: items.length,
        totalTransactions: transactions.length,
        activeTransactions: transactions.filter(t => t.status === 'active').length
      });
    } catch (error) {
      console.error('Analytics error:', error);
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const filterByDateRange = (transactions, range) => {
    if (range === 'all') return transactions;
    const now = new Date();
    const cutoff = new Date();
    switch(range) {
      case '7days': cutoff.setDate(now.getDate() - 7); break;
      case '30days': cutoff.setDate(now.getDate() - 30); break;
      case '90days': cutoff.setDate(now.getDate() - 90); break;
      default: return transactions;
    }
    return transactions.filter(t => new Date(t.borrowDate) >= cutoff);
  };

  const calculateBorrowTrends = (transactions) => {
    const last7Days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const count = transactions.filter(t => {
        const tDate = new Date(t.borrowDate);
        return tDate.toDateString() === date.toDateString();
      }).length;
      last7Days.push({ date: dateStr, borrowed: count });
    }
    return last7Days;
  };

  // --- FIXED GENERATE PDF FUNCTION ---
  const generatePDFReport = () => {
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40); // Dark Grey
      doc.text('Smart Inventory Analytics Report', 14, 22);
      
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      doc.text(`Date Range: ${dateRange === 'all' ? 'All Time' : dateRange}`, 14, 36);
      
      // -- Helper to get safe numbers --
      const getStat = (name) => {
        const stat = analytics.statusDistribution.find(s => s.name === name);
        return stat ? stat.value : 0;
      };

      // 1. Summary Statistics Table
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Summary Statistics', 14, 48);
      
      autoTable(doc, {
        startY: 52,
        head: [['Metric', 'Value']],
        body: [
          ['Total Items', (analytics.totalItems || 0).toString()],
          ['Total Transactions', (analytics.totalTransactions || 0).toString()],
          ['Active Borrows', (analytics.activeTransactions || 0).toString()],
          ['Available Items', getStat('Available').toString()],
          ['Items Under Maintenance', getStat('Maintenance').toString()]
        ],
        theme: 'grid',
        headStyles: { fillColor: [252, 213, 53], textColor: [0, 0, 0] }, // Yellow Header, Black Text
        bodyStyles: { textColor: [0, 0, 0] }, // Force Black Text
      });
      
      // 2. Most Borrowed Items Table
      let finalY = doc.lastAutoTable.finalY + 15;
      doc.text('Top 10 Most Borrowed Items', 14, finalY);
      
      autoTable(doc, {
        startY: finalY + 4,
        head: [['Rank', 'Item Name', 'Category', 'Times Borrowed']],
        body: analytics.mostBorrowedItems.map((item, index) => [
          (index + 1).toString(),
          item.name || 'Unknown',
          item.category || '-',
          (item.count || 0).toString()
        ]),
        theme: 'striped',
        headStyles: { fillColor: [41, 121, 255] }, // Blue Header
        bodyStyles: { textColor: [0, 0, 0] },
      });
      
      // 3. Faculty Stock Distribution (New Page)
      doc.addPage();
      doc.text('Faculty Stock Distribution', 14, 22);
      
      autoTable(doc, {
        startY: 26,
        head: [['Faculty', 'Total Items', 'Available', 'Borrowed', 'Maint.']],
        body: analytics.facultyStockStats.map(faculty => [
          faculty.name || 'Unknown',
          (faculty.totalItems || 0).toString(),
          (faculty.available || 0).toString(),
          (faculty.borrowed || 0).toString(),
          (faculty.maintenance || 0).toString()
        ]),
        theme: 'grid',
        headStyles: { fillColor: [0, 230, 118], textColor: [0, 0, 0] }, // Green Header
        bodyStyles: { textColor: [0, 0, 0] },
      });
      
      // 4. Low Stock Items
      finalY = doc.lastAutoTable.finalY + 15;
      
      // Check if we need a new page
      if (finalY > 250) {
        doc.addPage();
        finalY = 22;
      }

      doc.text('Stock Levels (Lowest First)', 14, finalY);
      
      autoTable(doc, {
        startY: finalY + 4,
        head: [['Item ID', 'Item Name', 'Quantity', 'Status']],
        body: analytics.stockLevels.slice(0, 10).map(item => [
          item.itemId || '-',
          item.name || 'Unknown',
          (item.quantity || 0).toString(),
          item.status || '-'
        ]),
        theme: 'striped',
        headStyles: { fillColor: [255, 23, 68] }, // Red Header
        bodyStyles: { textColor: [0, 0, 0] },
      });
      
      // Save PDF
      doc.save(`inventory-analytics-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Report downloaded successfully!');
    } catch (err) {
      console.error("PDF Generation Error:", err);
      toast.error("Error generating PDF. Please check console.");
    }
  };

  const generateCSVReport = () => {
    let csv = 'Smart Inventory Analytics Report\n';
    csv += `Generated: ${new Date().toLocaleString()}\n\n`;
    
    csv += 'Most Borrowed Items\n';
    csv += 'Rank,Item Name,Category,Times Borrowed\n';
    analytics.mostBorrowedItems.forEach((item, index) => {
      csv += `${index + 1},"${item.name}","${item.category}",${item.count}\n`;
    });
    
    csv += '\n\nFaculty Stock Distribution\n';
    csv += 'Faculty,Total Items,Available,Borrowed,Maintenance\n';
    analytics.facultyStockStats.forEach(faculty => {
      csv += `"${faculty.name}",${faculty.totalItems},${faculty.available},${faculty.borrowed},${faculty.maintenance}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('CSV report downloaded!');
  };

  const COLORS = ['#FCD535', '#00E676', '#2979FF', '#FF1744', '#E040FB', '#00BCD4', '#FF9100', '#76FF03'];

  if (loading) return <Loader />;

  return (
    <div className="analytics-page-dark">
      <Container fluid className="pt-4 px-4 pb-5">
        <Row className="mb-4 align-items-center">
          <Col>
            <h2 className="mb-0 text-white fw-bold">📊 Analytics <span className="text-yellow">& Reports</span></h2>
          </Col>
          <Col md="auto">
            <Form.Select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="me-2 dark-input"
              style={{display: 'inline-block', width: 'auto'}}
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </Form.Select>
          </Col>
          <Col md="auto">
            <Button className="btn-yellow me-2" onClick={generatePDFReport}>
              📄 PDF Report
            </Button>
            <Button variant="outline-light" onClick={generateCSVReport}>
              📊 CSV
            </Button>
          </Col>
        </Row>

        {/* ... (Rest of the JSX remains exactly the same as the previous correct version) ... */}
        
        <Row className="mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-lg dark-card stat-card-yellow">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="mb-1 text-muted-light">Total Items</p>
                    <h2 className="mb-0 text-white fw-bold">{analytics.totalItems}</h2>
                  </div>
                  <div className="stat-icon text-yellow">📦</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          {/* ... Other stat cards ... */}
          <Col md={3}>
            <Card className="border-0 shadow-lg dark-card stat-card-blue">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="mb-1 text-muted-light">Transactions</p>
                    <h2 className="mb-0 text-white fw-bold">{analytics.totalTransactions}</h2>
                  </div>
                  <div className="stat-icon text-blue">📊</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-lg dark-card stat-card-purple">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="mb-1 text-muted-light">Active Borrows</p>
                    <h2 className="mb-0 text-white fw-bold">{analytics.activeTransactions}</h2>
                  </div>
                  <div className="stat-icon text-purple">🔄</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-lg dark-card stat-card-green">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="mb-1 text-muted-light">Available Now</p>
                    <h2 className="mb-0 text-white fw-bold">
                      {analytics.statusDistribution.find(s => s.name === 'Available')?.value || 0}
                    </h2>
                  </div>
                  <div className="stat-icon text-green">✅</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Chart Selection */}
        <Row className="mb-3">
          <Col>
            <div className="p-1 d-inline-block rounded-pill bg-dark-secondary">
              <Button 
                className={`rounded-pill px-4 ${selectedChart === 'overview' ? 'btn-yellow' : 'btn-ghost'}`}
                onClick={() => setSelectedChart('overview')}
              >
                📈 Overview
              </Button>
              <Button 
                className={`rounded-pill px-4 ${selectedChart === 'faculty' ? 'btn-yellow' : 'btn-ghost'}`}
                onClick={() => setSelectedChart('faculty')}
              >
                👥 Faculty Analysis
              </Button>
              <Button 
                className={`rounded-pill px-4 ${selectedChart === 'stock' ? 'btn-yellow' : 'btn-ghost'}`}
                onClick={() => setSelectedChart('stock')}
              >
                📦 Stock Analysis
              </Button>
            </div>
          </Col>
        </Row>

        {/* Overview Charts */}
        {selectedChart === 'overview' && (
          <>
            <Row className="mb-4">
              <Col md={8}>
                <Card className="shadow-lg dark-card h-100">
                  <Card.Header className="bg-transparent border-0 pt-4 px-4">
                    <h5 className="mb-0 text-white">📈 Borrowing Trends (Last 7 Days)</h5>
                  </Card.Header>
                  <Card.Body>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={analytics.borrowTrends}>
                        <defs>
                          <linearGradient id="colorBorrowed" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FCD535" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#FCD535" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="date" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff' }} />
                        <Area type="monotone" dataKey="borrowed" stroke="#FCD535" strokeWidth={3} fillOpacity={1} fill="url(#colorBorrowed)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="shadow-lg dark-card h-100">
                  <Card.Header className="bg-transparent border-0 pt-4 px-4">
                    <h5 className="mb-0 text-white">🎯 Item Status</h5>
                  </Card.Header>
                  <Card.Body>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analytics.statusDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analytics.statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#121212" />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            {/* ... Rest of Charts ... */}
            <Row className="mb-4">
              <Col md={6}>
                <Card className="shadow-lg dark-card">
                  <Card.Header className="bg-transparent border-0 pt-4 px-4">
                    <h5 className="mb-0 text-white">🏆 Top 10 Most Borrowed Items</h5>
                  </Card.Header>
                  <Card.Body>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={analytics.mostBorrowedItems} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis type="number" stroke="#888" />
                        <YAxis dataKey="name" type="category" width={150} stroke="#888" />
                        <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                        <Legend />
                        <Bar dataKey="count" fill="#FCD535" name="Times Borrowed" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="shadow-lg dark-card">
                  <Card.Header className="bg-transparent border-0 pt-4 px-4">
                    <h5 className="mb-0 text-white">📂 Category Distribution</h5>
                  </Card.Header>
                  <Card.Body>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={analytics.categoryStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="name" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                        <Legend />
                        <Bar dataKey="value" fill="#2979FF" name="Total Items" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

             {/* Users Table */}
             <Row>
              <Col>
                <Card className="shadow-lg dark-card">
                  <Card.Header className="bg-transparent border-0 pt-4 px-4">
                    <h5 className="mb-0 text-white">👤 Top 10 Most Active Users</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="table-responsive">
                      <Table className="custom-dark-table align-middle" hover>
                        <thead>
                          <tr>
                            <th className="text-muted-light">#</th>
                            <th className="text-muted-light">User Name</th>
                            <th className="text-muted-light">Total Borrowed</th>
                            <th className="text-muted-light">Returned</th>
                            <th className="text-muted-light">Currently Active</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.userStats.map((user, index) => (
                            <tr key={index}>
                              <td className="text-secondary">{index + 1}</td>
                              <td className="fw-bold text-white">{user.name}</td>
                              <td><Badge bg="primary" className="bg-blue-glow">{user.borrowed}</Badge></td>
                              <td><Badge bg="success" className="bg-green-glow">{user.returned}</Badge></td>
                              <td><Badge bg="warning" className="bg-yellow-glow text-dark">{user.active}</Badge></td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}

        {/* ... (Faculty and Stock Analysis Sections - Same as previous logic, omitted for brevity but include them if copying full file) ... */}
         {/* Faculty Analysis */}
         {selectedChart === 'faculty' && (
          <>
            <Row className="mb-4">
              <Col md={8}>
                <Card className="shadow-lg dark-card">
                  <Card.Header className="bg-transparent border-0 pt-4 px-4">
                    <h5 className="mb-0 text-white">👥 Faculty Stock Distribution</h5>
                  </Card.Header>
                  <Card.Body>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={analytics.facultyStockStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="name" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff' }} />
                        <Legend />
                        <Bar dataKey="totalItems" fill="#FCD535" name="Total Items" />
                        <Bar dataKey="available" fill="#00E676" name="Available" />
                        <Bar dataKey="borrowed" fill="#E040FB" name="Borrowed" />
                        <Bar dataKey="maintenance" fill="#FF1744" name="Maintenance" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="shadow-lg dark-card">
                   <Card.Header className="bg-transparent border-0 pt-4 px-4">
                    <h5 className="mb-0 text-white">📊 Faculty Comparison</h5>
                  </Card.Header>
                  <Card.Body>
                    <ResponsiveContainer width="100%" height={400}>
                      <RadarChart data={analytics.facultyStockStats.slice(0, 5)}>
                        <PolarGrid stroke="#333" />
                        <PolarAngleAxis dataKey="name" tick={{ fill: '#888' }} />
                        <PolarRadiusAxis />
                        <Radar name="Total Items" dataKey="totalItems" stroke="#FCD535" fill="#FCD535" fillOpacity={0.4} />
                        <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            <Row>
                <Col>
                <Card className="shadow-lg dark-card">
                  <Card.Header className="bg-transparent border-0 pt-4 px-4">
                    <h5 className="mb-0 text-white">📋 Detailed Faculty Stock Report</h5>
                  </Card.Header>
                  <Card.Body>
                    <Table className="custom-dark-table align-middle" hover>
                      <thead>
                        <tr>
                          <th className="text-muted-light">#</th>
                          <th className="text-muted-light">Faculty Name</th>
                          <th className="text-muted-light">Total Items</th>
                          <th className="text-muted-light">Available</th>
                          <th className="text-muted-light">Borrowed</th>
                          <th className="text-muted-light">Maintenance</th>
                          <th className="text-muted-light">Utilization Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.facultyStockStats.map((faculty, index) => {
                          const utilizationRate = faculty.totalItems > 0 
                            ? ((faculty.borrowed / faculty.totalItems) * 100).toFixed(1)
                            : 0;
                          return (
                            <tr key={index}>
                              <td className="text-secondary">{index + 1}</td>
                              <td className="fw-bold text-white">{faculty.name}</td>
                              <td><Badge bg="secondary">{faculty.totalItems}</Badge></td>
                              <td><Badge bg="success" className="bg-green-glow">{faculty.available}</Badge></td>
                              <td><Badge bg="warning" className="bg-yellow-glow text-dark">{faculty.borrowed}</Badge></td>
                              <td><Badge bg="danger" className="bg-red-glow">{faculty.maintenance}</Badge></td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="progress flex-grow-1 me-2 bg-dark-tertiary" style={{height: '8px'}}>
                                    <div className="progress-bar bg-yellow" style={{width: `${utilizationRate}%`}}></div>
                                  </div>
                                  <small className="text-muted-light">{utilizationRate}%</small>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}

        {/* Stock Analysis */}
        {selectedChart === 'stock' && (
           <>
           <Row className="mb-4">
              <Col md={8}>
                <Card className="shadow-lg dark-card">
                  <Card.Header className="bg-transparent border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 text-white">📦 Stock Levels</h5>
                    <Badge bg="danger" className="bg-red-glow">Low Stock Alert</Badge>
                  </Card.Header>
                  <Card.Body>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={analytics.stockLevels}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="itemId" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', color: '#fff' }} />
                        <Legend />
                        <Bar dataKey="quantity" fill="#FF1744" name="Quantity" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                   <Card className="shadow-lg dark-card">
                    <Card.Header className="bg-transparent border-0 pt-4 px-4">
                        <h5 className="mb-0 text-white">⚠️ Stock Alerts</h5>
                    </Card.Header>
                    <Card.Body>
                        {analytics.stockLevels.slice(0, 5).map((item, index) => (
                        <Card key={index} className="mb-3 bg-dark-tertiary border-0 border-start border-danger border-4">
                            <Card.Body className="py-3">
                            <strong className="text-white d-block mb-1">{item.name}</strong>
                            <div className="d-flex justify-content-between align-items-center mt-1">
                                <small className="text-muted-light">{item.itemId}</small>
                                <Badge bg={item.quantity === 0 ? 'danger' : 'warning'} className="text-dark">
                                Qty: {item.quantity}
                                </Badge>
                            </div>
                            </Card.Body>
                        </Card>
                        ))}
                    </Card.Body>
                    </Card>
              </Col>
           </Row>
           <Row>
               <Col>
                <Card className="shadow-lg dark-card">
                  <Card.Header className="bg-transparent border-0 pt-4 px-4">
                    <h5 className="mb-0 text-white">📋 Complete Stock Report</h5>
                  </Card.Header>
                  <Card.Body>
                    <Table className="custom-dark-table align-middle" hover>
                      <thead>
                        <tr>
                          <th className="text-muted-light">#</th>
                          <th className="text-muted-light">Item ID</th>
                          <th className="text-muted-light">Item Name</th>
                          <th className="text-muted-light">Category</th>
                          <th className="text-muted-light">Quantity</th>
                          <th className="text-muted-light">Status</th>
                          <th className="text-muted-light">Stock Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.stockLevels.map((item, index) => (
                          <tr key={index}>
                            <td className="text-secondary">{index + 1}</td>
                            <td className="text-yellow font-monospace">{item.itemId}</td>
                            <td className="text-white fw-bold">{item.name}</td>
                            <td><Badge bg="dark" className="border border-secondary text-light fw-normal">{item.category}</Badge></td>
                            <td>
                              <Badge bg={item.quantity === 0 ? 'danger' : item.quantity <= 2 ? 'warning' : 'success'} className={item.quantity <= 2 ? 'text-dark' : ''}>
                                {item.quantity}
                              </Badge>
                            </td>
                            <td><Badge bg="secondary" className="bg-opacity-25 text-light border border-secondary">{item.status}</Badge></td>
                            <td>
                              {item.quantity === 0 && <span className="text-danger fw-bold">⚠️ Out of Stock</span>}
                              {item.quantity > 0 && item.quantity <= 2 && <span className="text-warning">⚠️ Low Stock</span>}
                              {item.quantity > 2 && <span className="text-success">✓ Adequate</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
           </Row>
           </>
        )}
      </Container>
      
      <style>{`
        :root {
            --theme-bg-main: #0a0a0a;
            --theme-bg-card: #1a1a1a;
            --theme-bg-tertiary: #252525;
            --theme-yellow: #FCD535;
            --theme-text-muted: #a0a0a0;
        }
        
        /* 1. Fix whitespace issue: Removed top margin dependence */
        .analytics-page-dark {
            background-color: var(--theme-bg-main);
            min-height: 100vh;
            color: #e0e0e0;
            width: 100%;
        }

        /* 2. Custom Dark Table Styling to fix white background issue */
        .custom-dark-table {
            color: #e0e0e0;
            margin-bottom: 0;
            background-color: transparent !important;
        }
        .custom-dark-table th {
            border-bottom: 1px solid rgba(255,255,255,0.1);
            background-color: transparent !important;
        }
        .custom-dark-table td {
            border-bottom: 1px solid rgba(255,255,255,0.05);
            background-color: transparent !important;
            vertical-align: middle;
        }
        .custom-dark-table tbody tr:hover td {
            color: #fff;
            background-color: rgba(252, 213, 53, 0.05) !important; /* Subtle yellow tint on hover */
        }

        /* --- Buttons --- */
        .btn-yellow {
            background-color: var(--theme-yellow);
            color: #000;
            border: none;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        .btn-yellow:hover, .btn-yellow.active {
            background-color: #e0bc20;
            color: #000;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(252, 213, 53, 0.3);
        }
        .btn-ghost {
            background-color: transparent;
            color: #fff;
            border: none;
        }
        .btn-ghost:hover {
            background-color: rgba(255,255,255,0.1);
            color: var(--theme-yellow);
        }

        /* --- Cards --- */
        .dark-card {
            background-color: var(--theme-bg-card);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 12px;
            overflow: hidden; /* Keeps table corners rounded */
        }
        .bg-dark-tertiary {
            background-color: var(--theme-bg-tertiary) !important;
        }

        /* --- Inputs --- */
        .dark-input {
            background-color: var(--theme-bg-card);
            border: 1px solid rgba(255,255,255,0.2);
            color: white;
        }
        .dark-input:focus {
            background-color: var(--theme-bg-card);
            color: white;
            border-color: var(--theme-yellow);
            box-shadow: 0 0 0 0.25rem rgba(252, 213, 53, 0.25);
        }

        /* --- Stat Cards (Glow effects) --- */
        .stat-icon { font-size: 2.5rem; opacity: 0.8; }
        .stat-card-yellow { border-bottom: 3px solid #FCD535; }
        .stat-card-blue { border-bottom: 3px solid #2979FF; }
        .stat-card-purple { border-bottom: 3px solid #E040FB; }
        .stat-card-green { border-bottom: 3px solid #00E676; }

        .text-yellow { color: #FCD535 !important; }
        .text-blue { color: #2979FF !important; }
        .text-purple { color: #E040FB !important; }
        .text-green { color: #00E676 !important; }
        .text-muted-light { color: var(--theme-text-muted) !important; }
        
        .bg-yellow { background-color: #FCD535 !important; }
        
        /* --- Badge Glows --- */
        .bg-yellow-glow { background-color: #FCD535 !important; box-shadow: 0 0 10px rgba(252, 213, 53, 0.4); }
        .bg-blue-glow { background-color: #2979FF !important; box-shadow: 0 0 10px rgba(41, 121, 255, 0.4); }
        .bg-green-glow { background-color: #00E676 !important; box-shadow: 0 0 10px rgba(0, 230, 118, 0.4); }
        .bg-red-glow { background-color: #FF1744 !important; box-shadow: 0 0 10px rgba(255, 23, 68, 0.4); }
      `}</style>
    </div>
  );
};

export default Analytics;