export type Role = 'CHAIRMAN' | 'OFFICE' | 'FAMILY';

export type AccountStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'INACTIVE';

export type Priority = 'IMPORTANT' | 'NORMAL';

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export type InvitationRole = 'CHIEF_GUEST' | 'GUEST_OF_HONOUR' | 'SPECIAL_INVITEE' | 'ATTENDEE' | 'OTHER';

export type Category = 'COLLEGE' | 'FAMILY' | 'GOVERNMENT' | 'PERSONAL' | 'OTHERS';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  profilePhoto?: string | null;
  role: Role;
  accountStatus: AccountStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Reminder {
  id: string;
  invitationId: string;
  userId: string;
  reminderDatetime: string;
  status: 'ACTIVE' | 'DUE' | 'DISMISSED';
  createdAt?: string;
}

export interface Invitation {
  id: string;
  organizationFamilyName: string;
  date: string;
  priority: Priority;
  invitationRole: InvitationRole;
  role: Role;
  category: Category;
  remarks?: string | null;
  attachmentPath?: string | null;
  uploadedById: string;
  uploadedBy?: {
    id: string;
    fullName: string;
    email: string;
    role: Role;
  };
  status: InvitationStatus;
  reminders?: Reminder[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedEntity?: string | null;
  relatedEntityId?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface ActivityLogItem {
  id: string;
  userId?: string | null;
  user?: {
    id: string;
    fullName: string;
    email: string;
    role: Role;
  } | null;
  action: string;
  description: string;
  entityType?: string | null;
  entityId?: string | null;
  createdAt: string;
}

export interface ContactMessageItem {
  id: string;
  userId?: string | null;
  name: string;
  email: string;
  message: string;
  status: 'UNREAD' | 'READ';
  createdAt: string;
}

export interface DashboardStats {
  totalInvitations?: number;
  pendingInvitations?: number;
  acceptedInvitations?: number;
  rejectedInvitations?: number;
  importantInvitations?: number;
  pendingMemberRequests?: number;
  managementMembers?: number;
  myInvitations?: number;
  pending?: number;
  accepted?: number;
  rejected?: number;
  important?: number;
  unreadNotifications?: number;
  categoryBreakdown?: Record<string, number>;
  roleBreakdown?: Record<string, number>;
}
