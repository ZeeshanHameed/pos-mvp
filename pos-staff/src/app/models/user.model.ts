export type UserType = 'staff' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  user_type: UserType;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message: string;
}

