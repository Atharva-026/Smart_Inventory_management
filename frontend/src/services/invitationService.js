import API from './api';

const invitationService = {
  // Send single invitation (Faculty) - WITH NAME
  sendInvitation: async (email, studentName = null) => {
    const response = await API.post('/invitations/send', { email, studentName });
    return response.data;
  },

  // 🔥 NEW: Resend invitation email
  resendInvitation: async (invitationId) => {
    const response = await API.post(`/invitations/resend/${invitationId}`);
    return response.data;
  },

  // Send bulk invitations (Faculty)
  sendBulkInvitations: async (emails) => {
    const response = await API.post('/invitations/send-bulk', { emails });
    return response.data;
  },

  // Verify invitation code (Public)
  verifyInvitation: async (code) => {
    const response = await API.post('/invitations/verify', { code });
    return response.data;
  },

  // Get my sent invitations (Faculty)
  getMyInvitations: async () => {
    const response = await API.get('/invitations/my-invitations');
    return response.data;
  },

  // Get invitation statistics (Faculty)
  getInvitationStats: async () => {
    const response = await API.get('/invitations/stats');
    return response.data;
  },

  // Delete invitation (Faculty)
  deleteInvitation: async (id) => {
    const response = await API.delete(`/invitations/${id}`);
    return response.data;
  }
};

export default invitationService;