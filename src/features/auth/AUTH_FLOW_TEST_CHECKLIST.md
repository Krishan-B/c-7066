# Authentication Flow Test Checklist

Use this checklist to verify all authentication flows in the application. Mark each item as complete
after testing.

## Registration

- [ ] User can register with valid email, password, and required fields
- [ ] Registration fails with invalid email or weak password
- [ ] Registration fails with missing required fields
- [ ] User receives appropriate error messages

## Login

- [ ] User can log in with valid credentials
- [ ] Login fails with incorrect credentials
- [ ] User receives appropriate error messages
- [ ] Session persists after login (refresh page)

## Logout

- [ ] User can log out successfully
- [ ] Session is cleared after logout

## Password Reset

- [ ] User can request password reset email
- [ ] User receives confirmation of reset email sent
- [ ] User can reset password using the link (test with real email if possible)

## Route Protection

- [ ] Unauthenticated users are redirected to /auth when accessing protected routes
- [ ] Authenticated users can access protected routes

## Profile

- [ ] User profile is loaded after login
- [ ] Profile updates are reflected in the UI

---

Add any issues or notes below:

-
