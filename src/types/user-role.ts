export type UserRole = 'guest' | 'user' | 'moderator' | 'admin';

export interface Role {
  role_id: number;
  role_name: Exclude<UserRole, 'guest'>; 
  status: 'active' | 'inactive';
};
