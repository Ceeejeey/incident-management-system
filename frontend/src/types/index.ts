export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'staff' | 'admin';
}

export interface IncidentReport {
  id: number;
  title: string;
  description: string;
  date: string;
  category: string;
  evidence: string;
  reporter_id: number;
  status: 'pending' | 'open' | 'in-progress' | 'resolved';
  latitude: number;
  longitude: number;
  reporter_name?: string;
  name?: string;
}

export interface Incident {
  incident_id: number;
  reported_by: number;
  title: string;
  user_description: string;
  category: string;
  description: string;
  evidence: string;
  status: 'open' | 'in-progress' | 'resolved';
  assigned_to: number;
  date_reported: string;
  last_updated: string;
  severity: 'low' | 'medium' | 'high';
  latitude: number;
  longitude: number;
  reporter_name?: string;
  assigned_staff_name?: string;
  reported_by_name?: string;
}

export interface Message {
  content: string;
  timestamp: string;
  message_type: 'outgoing' | 'incoming';
  sender_name: string;
}

export interface Notification {
  notification_id?: number;
  id?: number;
  student_id?: number;
  incident_id: number;
  message: string;
  link: string;
  is_read: number;
  timestamp: string;
  created_at?: string;
  incident_title?: string;
  staff_name?: string;
}

export interface Feedback {
  feedback_id: number;
  incident_id: number;
  user_id: number;
  rating: number;
  comments: string | null;
  submitted_at: string;
  user_name: string;
  incident_description: string;
}

export interface EmergencyContact {
  role: string;
  address: string;
  email: string;
  office: string;
  fax: string;
}

export interface StaffMember {
  user_id: number;
  name: string;
}

export interface StudentWithUnread {
  student_id: number;
  name: string;
  unread_count: number;
}
