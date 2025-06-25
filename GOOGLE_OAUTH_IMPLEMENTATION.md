# Google OAuth Implementation - Food Forum

## Overview

Google OAuth đã được tích hợp hoàn chỉnh vào ứng dụng Food Forum với backend xử lý OAuth flow và frontend hiển thị UI.

## Features Implemented

### 1. Google Login Button

- **Location**: `/auth/login` page
- **Component**: `LoginPage.tsx`
- **Features**:
  - Google login button với icon và styling
  - Loading state khi đang xử lý
  - Error handling với toast notifications
  - Redirect đến backend OAuth endpoint

### 2. Google OAuth Flow

- **Backend Endpoint**: `http://localhost:8000/api/v1/auth/google`
- **Frontend Call**: `window.location.href = backendUrl + "/api/v1/auth/google"`
- **Callback Handling**: Backend xử lý và redirect về frontend

### 3. Google User Setup

- **Component**: `GoogleUserSetup.tsx`
- **Location**: Profile page và Settings page
- **Features**:
  - Kiểm tra user có phải Google user không
  - Cho phép set/update username và password
  - Hiển thị thông tin Google user
  - Tích hợp với account service

### 4. Profile Management

- **Component**: `SettingPage.tsx` - Account tab
- **Features**:
  - Xem thông tin profile
  - Chỉnh sửa profile (full_name, email, phone, date_of_birth, bio)
  - Save/Cancel functionality
  - Loading states và error handling

## API Integration

### Account Service (`accountService.ts`)

```typescript
// Get own profile
getOwnProfile(): Promise<UserProfile>

// Update own profile
updateOwnProfile(data: ProfileUpdateData): Promise<UserProfile>

// Check if user is Google user
isGoogleUser(): Promise<GoogleUserInfo>

// Update username
updateUsername(username: string): Promise<void>

// Update password
updatePassword(password: string): Promise<void>
```

### Types (`types/account.ts`)

```typescript
interface UserProfile {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  date_of_birth: string | null;
  bio: string | null;
  role: UserRole;
  friend_count: number;
  created_at: string;
  updated_at: string;
}

interface ProfileUpdateData {
  full_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  bio?: string;
}

interface GoogleUserInfo {
  is_google_user: boolean;
  current_username: string;
  can_update_username: boolean;
  can_update_password: boolean;
}
```

## Environment Variables

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Backend (Google Cloud Console)

- **Authorized redirect URIs**: `http://localhost:8000/api/v1/auth/google/callback`
- **Authorized JavaScript origins**: `http://localhost:3000`

## User Flow

### 1. Google Login

1. User click "Đăng nhập với Google" trên login page
2. Frontend redirect đến backend OAuth endpoint
3. Backend xử lý OAuth flow với Google
4. Backend redirect về frontend với token
5. Frontend lưu token và redirect đến dashboard

### 2. Google User Setup

1. Google user được redirect đến profile/settings
2. `GoogleUserSetup` component kiểm tra user status
3. Nếu có default username, hiển thị form để update
4. User có thể set username và password
5. Sau khi setup, user có thể sử dụng bình thường

### 3. Profile Management

1. User vào Settings > Account tab
2. Xem thông tin profile hiện tại
3. Click "Chỉnh sửa" để edit
4. Thay đổi thông tin và click "Lưu"
5. Profile được update qua API

## Security Features

- JWT token authentication
- Secure cookie storage
- CORS configuration
- Input validation
- Error handling

## Error Handling

- Network errors với toast notifications
- Validation errors
- Authentication errors
- OAuth errors với redirect handling

## Testing

- Google OAuth flow test
- Profile update test
- Google user setup test
- Error scenarios test

## Future Enhancements

- Profile picture upload
- Social media links
- Privacy settings
- Email verification
- Two-factor authentication
