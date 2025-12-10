import { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Alert, Button } from 'react-bootstrap';
import userService from '../../services/userService';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/helpers';

const MyStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await userService.getMyStudents();
      setStudents(data);
    } catch (error) {
      toast.error('Failed to fetch students');
      console.error('Fetch students error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await userService.deleteStudent(studentId);
        toast.success('Student deleted successfully');
        fetchStudents();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete student');
      }
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <div className="spinner-border text-yellow" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <div className="page-dark">
      <Container className="pt-4 pb-5">
        <h2 className="mb-4 text-white fw-bold">👥 My <span className="text-yellow">Students</span></h2>

        {/* Summary Card */}
        <Card className="mb-4 dark-card border-yellow-left shadow-lg">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="text-muted mb-1">Total Students</h5>
                <h2 className="text-white mb-0 fw-bold">{students.length}</h2>
              </div>
              <div style={{ fontSize: '3rem' }}>👥</div>
            </div>
          </Card.Body>
        </Card>

        {/* Students List */}
        <Card className="dark-card shadow-lg border-0">
          <Card.Header className="bg-transparent border-0 pt-4 px-4">
            <h5 className="mb-0 text-white">Registered Students</h5>
          </Card.Header>
          <Card.Body>
            {students.length === 0 ? (
              <Alert variant="dark" className="bg-dark-tertiary border-0 text-white">
                <h5>No students yet</h5>
                <p className="mb-0 text-muted">Send invitations to students to get started</p>
              </Alert>
            ) : (
              <Table responsive hover className="custom-dark-table align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Invitation Code</th>
                    <th>Joined Date</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td>
                        <strong className="text-white">{student.name}</strong>
                      </td>
                      <td className="text-muted">{student.email}</td>
                      <td className="text-muted">{student.phone}</td>
                      <td>
                        <Badge bg={student.isActive ? 'success' : 'secondary'}>
                          {student.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        {student.invitationCode && (
                          <code className="bg-dark-tertiary text-yellow px-2 py-1 rounded border border-secondary">
                            {student.invitationCode}
                          </code>
                        )}
                      </td>
                      <td className="text-muted">{formatDate(student.createdAt)}</td>
                      <td className="text-center">
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => handleDelete(student._id)}
                          className="btn-glow-red"
                        >
                          🗑️ Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>

      <style>{`
        .page-dark { background-color: #0a0a0a; min-height: 100vh; color: #e0e0e0; }
        .text-yellow { color: #FCD535 !important; }
        .dark-card { background-color: #1a1a1a; border-radius: 12px; }
        .bg-dark-tertiary { background-color: #252525; }
        
        .border-yellow-left { border-left: 4px solid #FCD535; }
        
        .custom-dark-table { --bs-table-bg: transparent; color: #e0e0e0; margin-bottom: 0; }
        .custom-dark-table thead th {
            background-color: rgba(255,255,255,0.05);
            color: #FCD535;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            padding: 1rem;
        }
        .custom-dark-table tbody td {
            border-bottom: 1px solid rgba(255,255,255,0.05);
            padding: 1rem;
        }
        .custom-dark-table tbody tr:hover { background-color: rgba(252, 213, 53, 0.05); }
        
        .btn-glow-red:hover { box-shadow: 0 0 10px rgba(220, 53, 69, 0.5); }
      `}</style>
    </div>
  );
};

export default MyStudents;