import { api } from './client';
import type {
  User,
  IncidentReport,
  Incident,
  Message,
  Notification,
  Feedback,
  EmergencyContact,
  StaffMember,
  StudentWithUnread,
} from '../types';

// Auth
export const authApi = {
  signup: (data: { name: string; email: string; role: string; password: string }) =>
    api.post<{ message: string }>('/signup', data),

  signin: (data: { email: string; password: string }) =>
    api.post<{ accessToken: string; user: User }>('/signin', data),

  checkAdmin: () => api.get<{ adminExists: boolean }>('/check-admin'),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post<{ message: string }>('/change-password', data),

  signout: () => api.post<{ message: string }>('/signout'),
};

// Incidents
export const incidentApi = {
  report: (formData: FormData) =>
    fetch('/api/report-incident', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    }).then((r) => r.json()),

  getAll: () => api.get<{ incidentReports: IncidentReport[] }>('/incident-reports'),

  getPending: () =>
    api.get<{ incidentReports: IncidentReport[]; staffMembers: StaffMember[] }>('/incidents/pending'),

  getAssigned: () => api.get<{ incidentReports: Incident[] }>('/incidents/assigned'),
  getAssignedResolved: () => api.get<{ incidentReports: Incident[] }>('/incidents/assigned/resolved'),

  getStudentIncidents: () => api.get<{ incidents: IncidentReport[] }>('/incidents/student'),

  getReporterIncidents: () => api.get<{ incidents: IncidentReport[] }>('/incidents/reporter'),

  getAllIncidents: () => api.get<{ incidents: Incident[] }>('/incidents/all'),

  assign: (data: {
    reportId: number;
    latitude: number;
    longitude: number;
    staffId: number;
    severity: string;
    adminDescription: string;
  }) => api.post<{ success: boolean; message: string; incidentId: number }>('/incidents/assign', data),

  update: (data: { incidentId: number; updateDescription: string }) =>
    api.post<{ success: boolean; message: string }>('/incidents/update', data),

  resolve: (data: { incidentId: number; resolveDescription: string }) =>
    api.post<{ success: boolean; message: string }>('/incidents/resolve', data),

  getResolvedDaily: () => api.get<{ date: string; count: number }[]>('/incidents/resolved/daily'),
};

// Users
export const userApi = {
  getAll: () => api.get<{ users: User[] }>('/users'),
  getStaff: () => api.get<{ staff: StaffMember[] }>('/staff'),
};

// Chat
export const chatApi = {
  getMessages: (otherUserId: number) =>
    api.get<{ messages: Message[]; otherUser: StaffMember }>('/chat/messages', {
      otherUserId: String(otherUserId),
    }),

  getUnread: (staffId: number) => api.get<Message[]>('/chat/unread/' + staffId),

  getStudentsWithUnread: () =>
    api.get<{ studentsWithUnreadMessages: StudentWithUnread[] }>('/chat/students-with-unread'),
};

// Notifications
export const notificationApi = {
  getStudent: () => api.get<{ notifications: Notification[] }>('/notifications/student'),
  getStaff: () => api.get<{ notifications: Notification[] }>('/notifications/staff'),
  getStudentCount: () => api.get<{ count: number }>('/notifications/student/count'),
  getStaffCount: () => api.get<{ count: number }>('/notifications/staff/count'),
};

// Feedback
export const feedbackApi = {
  getUserIncidents: () => api.get<{ incidents: Incident[] }>('/feedback/user-incidents'),
  submit: (data: { incident_id: number; rating: number; comments?: string }) =>
    api.post<{ message: string }>('/feedback', data),
  getAll: () => api.get<{ feedbacks: Feedback[] }>('/feedback/all'),
};

// Emergency Contacts
export const emergencyApi = {
  getContacts: () => api.get<{ contacts: EmergencyContact[] }>('/emergency-contacts-list'),
};
