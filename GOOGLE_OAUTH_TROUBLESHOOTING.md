# Google OAuth Troubleshooting Guide

## 🚨 **Current Error: redirect_uri_mismatch**

### **Error Message:**

```
redirect_uri_mismatch
You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy.

If you're the app developer, register the redirect URI in the Google Cloud Console.
```

### **Root Cause:**

The redirect URI being sent to Google doesn't match what's configured in Google Cloud Console.

## 🔍 **Current Flow Analysis**

### **What's Happening:**

1. Frontend calls: `http://localhost:8000/api/v1/auth/google/login`
2. Backend redirects to Google OAuth
3. Google tries to redirect back to frontend: `http://localhost:5173/auth/google/callback`
4. **ERROR**: This URI is not registered in Google Console

### **What Should Happen:**

1. Frontend calls: `http://localhost:8000/api/v1/auth/google/login`
2. Backend redirects to Google OAuth
3. Google redirects back to **Backend**: `http://localhost:8000/api/v1/auth/google/callback`
4. Backend processes the code and redirects to frontend

## 🛠️ **Solutions**

### **Solution 1: Configure Backend Redirect URI (Recommended)**

**In Google Cloud Console, add this redirect URI:**

```
http://localhost:8000/api/v1/auth/google/callback
```

**Steps:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Find your OAuth 2.0 Client ID
4. Click "Edit"
5. Add to "Authorized redirect URIs":
   ```
   http://localhost:8000/api/v1/auth/google/callback
   ```
6. Save changes

### **Solution 2: Update Backend Configuration**

If your backend is configured to redirect to the frontend, update the backend to:

1. **Receive Google callback on backend endpoint**
2. **Process the authorization code**
3. **Redirect to frontend with success/error**

**Backend should handle:**

```
GET /api/v1/auth/google/login
POST /api/v1/auth/google/callback  # This should be the Google redirect URI
```

### **Solution 3: Frontend-Only OAuth (Alternative)**

If you want frontend to handle the complete OAuth flow:

1. **Update Google Console** to include:

   ```
   http://localhost:5173/auth/google/callback
   ```

2. **Update frontend** to handle Google OAuth directly:
   ```typescript
   // Use Google OAuth client library
   const googleAuthUrl = `https://accounts.google.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
     "http://localhost:5173/auth/google/callback"
   )}&response_type=code&scope=email profile`;
   ```

## 🔧 **Recommended Fix**

### **For Your Backend Team:**

**Option A: Backend handles OAuth (Recommended)**

1. Configure Google Console with: `http://localhost:8000/api/v1/auth/google/callback`
2. Backend processes Google callback
3. Backend redirects to frontend with tokens

**Option B: Frontend handles OAuth**

1. Configure Google Console with: `http://localhost:5173/auth/google/callback`
2. Frontend handles Google callback directly
3. Frontend sends code to backend for processing

## 📋 **Google Console Configuration**

### **For Backend OAuth (Option A):**

```
Authorized redirect URIs:
- http://localhost:8000/api/v1/auth/google/callback
- https://yourdomain.com/api/v1/auth/google/callback (production)
```

### **For Frontend OAuth (Option B):**

```
Authorized redirect URIs:
- http://localhost:5173/auth/google/callback
- https://yourdomain.com/auth/google/callback (production)
```

## 🧪 **Testing Steps**

1. **Update Google Console** with correct redirect URI
2. **Restart backend server** (if needed)
3. **Test OAuth flow**:
   - Click "Login with Google"
   - Complete Google authorization
   - Check if redirect works properly

## 🔍 **Debugging**

### **Check Current Configuration:**

1. Open browser developer tools
2. Go to Network tab
3. Click "Login with Google"
4. Check the redirect URL being sent to Google

### **Common Issues:**

- **Wrong port**: Make sure using correct port (8000 for backend, 5173 for frontend)
- **HTTP vs HTTPS**: Use HTTP for localhost, HTTPS for production
- **Trailing slashes**: Make sure URIs match exactly
- **Case sensitivity**: URIs are case-sensitive

## 📞 **Next Steps**

1. **Contact your backend team** to confirm the OAuth flow
2. **Update Google Console** with the correct redirect URI
3. **Test the complete flow**
4. **Update this document** with the working solution

## 🎯 **Expected Working Flow**

```
User clicks "Login with Google"
    ↓
Frontend → http://localhost:8000/api/v1/auth/google/login
    ↓
Backend → https://accounts.google.com/oauth/authorize?...
    ↓
Google → http://localhost:8000/api/v1/auth/google/callback?code=...
    ↓
Backend processes code and creates user
    ↓
Backend → http://localhost:5173/auth/google/callback?success=true
    ↓
Frontend handles success and stores tokens
```

## 🔧 **Common Issues & Solutions**

### **1. "redirect_uri_mismatch" Error**

#### **Problem:**

```
Error: redirect_uri_mismatch
The redirect URI in the request, http://localhost:8000/api/v1/auth/google/callback,
does not match a registered redirect URI.
```

#### **Solution:**

**Update Google Cloud Console redirect URI:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Find your OAuth 2.0 Client ID
4. Click "Edit"
5. In "Authorized redirect URIs", **ADD**:
   ```
   http://localhost:8000/api/v1/auth/google/callback
   ```
6. **REMOVE** any old frontend callback URIs like:
   ```
   http://localhost:5173/auth/google/callback
   ```
7. Save changes

#### **Why This Happens:**

- The backend now handles the OAuth callback
- Google must redirect to the backend, not the frontend
- The redirect URI must match exactly what the backend expects

### **2. "403 Forbidden" Error for /api/v1/accounts/is-google-user**

#### **Problem:**

```
Failed to load resource: the server responded with a status of 403 (Forbidden)
API Request - Token: Present | URL: /api/v1/accounts/is-google-user
```

#### **Possible Causes:**

1. **Backend Endpoint Not Implemented**

   - The `/api/v1/accounts/is-google-user` endpoint might not be implemented in the backend
   - Check if the backend team has implemented this endpoint

2. **Authentication Issues**

   - User might not be properly authenticated
   - Token might be invalid or expired
   - Token might not be sent correctly

3. **Authorization Issues**
   - User might not have permission to access this endpoint
   - Role-based access control might be blocking the request

#### **Solutions:**

**For Frontend Developers:**

1. **Check Authentication Status:**

   ```javascript
   // Check if user is logged in
   const token = document.cookie
     .split("; ")
     .find((row) => row.startsWith("access_token="));
   console.log("Token exists:", !!token);
   ```

2. **Test with Other Endpoints:**

   ```javascript
   // Test if other authenticated endpoints work
   const profile = await accountService.getOwnProfile();
   console.log("Profile loaded:", !!profile);
   ```

3. **Use Debug Mode:**
   - The GoogleUserSetup component now shows debug information in development mode
   - Check the browser console for detailed error information

**For Backend Developers:**

1. **Implement the Endpoint:**

   ```python
   @router.get("/is-google-user")
   async def is_google_user(current_user: User = Depends(get_current_user)):
       # Check if user is Google user
       is_google = check_if_google_user(current_user)
       return {
           "is_google_user": is_google,
           "current_username": current_user.username,
           "email": current_user.email
       }
   ```

2. **Check Authentication Middleware:**

   - Ensure the endpoint is properly protected
   - Verify JWT token validation is working

3. **Check CORS Settings:**
   - Ensure the endpoint allows requests from frontend origin

#### **Temporary Workaround:**

If the backend endpoint is not ready, you can:

1. **Hide Google Setup Component:**

   - The component will automatically hide on 403 errors
   - Users won't see the setup form until the backend is ready

2. **Use Debug Mode:**

   - In development, the component shows debug information
   - You can force show the setup form for testing

3. **Manual Testing:**
   - Use the "Test API Again" button to retry the request
   - Check browser network tab for detailed error information

### **3. "Invalid redirect_uri" Error**
