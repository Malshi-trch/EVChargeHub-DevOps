/**
 * End-to-End Verification Test for EVChargeHub Owner Settings & Account Security
 */

const BASE_URL = 'http://localhost:5173';

async function runTests() {
  console.log('=== STARTING EVCHARGEHUB AUTH & SETTINGS TEST SUITE ===\n');
  let token = '';

  // 1. Initial Login with seed credentials
  console.log('Test 1: Authenticate with initial credentials (owner@evchargehub.lk / EcoCharge@2026!)');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'owner@evchargehub.lk',
      password: 'EcoCharge@2026!',
    }),
  });
  if (!loginRes.ok) throw new Error(`Test 1 Failed: ${await loginRes.text()}`);
  const loginData = await loginRes.json();
  token = loginData.token;
  console.log('  ✓ Success: Authenticated, token acquired.\n');

  // 2. Fetch authenticated profile & security metadata
  console.log('Test 2: Fetch current user profile & sessions from /api/auth/me');
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meData = await meRes.json();
  console.log(`  ✓ Success: Loaded user ${meData.user.fullName} (${meData.user.email}) with ${meData.user.sessions.length} session(s).\n`);

  // 3. Edit Profile Information
  console.log('Test 3: Edit Full Name, Phone, and Company Name');
  const updateRes = await fetch(`${BASE_URL}/api/auth/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      fullName: 'Eng. Kasun Perera',
      phone: '+94 77 987 6543',
      companyName: 'EcoCharge Holdings Sri Lanka',
      businessAddress: 'No. 100, High Level Road, Nugegoda, Sri Lanka',
      profilePicture: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...',
    }),
  });
  if (!updateRes.ok) throw new Error(`Test 3 Failed: ${await updateRes.text()}`);
  const updateData = await updateRes.json();
  if (updateData.user.fullName !== 'Eng. Kasun Perera') throw new Error('Name mismatch');
  console.log('  ✓ Success: Profile updated to "Eng. Kasun Perera", phone "+94 77 987 6543".\n');

  // 4. Change Login Email — Reject invalid password
  console.log('Test 4: Change Login Email with incorrect current password');
  const failEmailRes = await fetch(`${BASE_URL}/api/auth/change-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      newEmail: 'cpo.kasun@evchargehub.lk',
      currentPassword: 'WrongPassword999!',
    }),
  });
  if (failEmailRes.status !== 401) throw new Error('Expected 401 for wrong password');
  console.log('  ✓ Success: Correctly rejected with 401 Unauthorized.\n');

  // 5. Change Login Email — Success with correct password
  console.log('Test 5: Change Login Email with correct current password');
  const okEmailRes = await fetch(`${BASE_URL}/api/auth/change-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      newEmail: 'cpo.kasun@evchargehub.lk',
      currentPassword: 'EcoCharge@2026!',
    }),
  });
  if (!okEmailRes.ok) throw new Error(`Test 5 Failed: ${await okEmailRes.text()}`);
  const okEmailData = await okEmailRes.json();
  if (okEmailData.user.email !== 'cpo.kasun@evchargehub.lk') throw new Error('Email not updated');
  console.log('  ✓ Success: Login email updated to "cpo.kasun@evchargehub.lk".\n');

  // 6. Change Password — Reject weak password (<12 characters)
  console.log('Test 6: Reject weak password (< 12 characters)');
  const weakPwRes = await fetch(`${BASE_URL}/api/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      currentPassword: 'EcoCharge@2026!',
      newPassword: 'Short@1',
      confirmPassword: 'Short@1',
    }),
  });
  if (weakPwRes.status !== 400) throw new Error('Expected 400 for weak password');
  console.log('  ✓ Success: Weak password rejected with 400 Bad Request.\n');

  // 7. Change Password — Reject mismatched passwords
  console.log('Test 7: Reject mismatched passwords');
  const mismatchRes = await fetch(`${BASE_URL}/api/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      currentPassword: 'EcoCharge@2026!',
      newPassword: 'NewSecurePass@2026#',
      confirmPassword: 'DifferentPassword@2026#',
    }),
  });
  if (mismatchRes.status !== 400) throw new Error('Expected 400 for mismatch');
  console.log('  ✓ Success: Mismatched password rejected with 400 Bad Request.\n');

  // 8. Change Password — Success with PBKDF2 hash update
  console.log('Test 8: Change Password successfully to "NewSecurePass@2026#"');
  const okPwRes = await fetch(`${BASE_URL}/api/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      currentPassword: 'EcoCharge@2026!',
      newPassword: 'NewSecurePass@2026#',
      confirmPassword: 'NewSecurePass@2026#',
      logoutOtherDevices: true,
    }),
  });
  if (!okPwRes.ok) throw new Error(`Test 8 Failed: ${await okPwRes.text()}`);
  const okPwData = await okPwRes.json();
  console.log(`  ✓ Success: Password changed! New passwordChangedAt: ${okPwData.user.passwordChangedAt}\n`);

  // 9. Verify Old Credentials Fail on Login
  console.log('Test 9: Verify Old Credentials fail to authenticate');
  const oldLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'owner@evchargehub.lk',
      password: 'EcoCharge@2026!',
    }),
  });
  if (oldLoginRes.status !== 401) throw new Error('Expected 401 for old credentials');
  console.log('  ✓ Success: Old credentials rejected with 401 Unauthorized.\n');

  // 10. Verify New Credentials Succeed on Login
  console.log('Test 10: Verify New Credentials authenticate successfully');
  const newLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'cpo.kasun@evchargehub.lk',
      password: 'NewSecurePass@2026#',
    }),
  });
  if (!newLoginRes.ok) throw new Error(`Test 10 Failed: ${await newLoginRes.text()}`);
  const newLoginData = await newLoginRes.json();
  token = newLoginData.token;
  console.log('  ✓ Success: Logged in with updated email and password! Token refreshed.\n');

  // 11. Test Forgot Password Workflow
  console.log('Test 11: Request password reset link for "cpo.kasun@evchargehub.lk"');
  const forgotRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'cpo.kasun@evchargehub.lk' }),
  });
  if (!forgotRes.ok) throw new Error(`Test 11 Failed: ${await forgotRes.text()}`);
  const forgotData = await forgotRes.json();
  const resetToken = forgotData.resetToken;
  console.log(`  ✓ Success: Generated single-use reset token: ${resetToken.slice(0, 16)}...\n`);

  // 12. Verify Reset Token
  console.log('Test 12: Verify validity of the single-use reset token');
  const verifyRes = await fetch(`${BASE_URL}/api/auth/verify-reset-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: resetToken }),
  });
  if (!verifyRes.ok) throw new Error(`Test 12 Failed: ${await verifyRes.text()}`);
  const verifyData = await verifyRes.json();
  if (!verifyData.valid) throw new Error('Token should be valid');
  console.log('  ✓ Success: Reset token verified.\n');

  // 13. Reset Password with Token
  console.log('Test 13: Reset Password using token to "FinalResetPass@2026$"');
  const resetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: resetToken,
      newPassword: 'FinalResetPass@2026$',
      confirmPassword: 'FinalResetPass@2026$',
    }),
  });
  if (!resetRes.ok) throw new Error(`Test 13 Failed: ${await resetRes.text()}`);
  console.log('  ✓ Success: Password successfully reset!\n');

  // 14. Verify Token Cannot Be Reused (Single-Use Invalidation)
  console.log('Test 14: Ensure the reset token is now invalidated (Single-Use test)');
  const reuseRes = await fetch(`${BASE_URL}/api/auth/verify-reset-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: resetToken }),
  });
  if (reuseRes.ok) throw new Error('Token should not be valid for reuse');
  console.log('  ✓ Success: Token reuse rejected (token is single-use).\n');

  // 15. Sign In with Reset Password
  console.log('Test 15: Sign in with the newly reset password');
  const finalLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'cpo.kasun@evchargehub.lk',
      password: 'FinalResetPass@2026$',
    }),
  });
  if (!finalLoginRes.ok) throw new Error(`Test 15 Failed: ${await finalLoginRes.text()}`);
  const finalLoginData = await finalLoginRes.json();
  token = finalLoginData.token;
  console.log('  ✓ Success: Successfully signed in with reset password!\n');

  // 16. Logout other devices
  console.log('Test 16: Invalidate other device sessions');
  const logoutOthersRes = await fetch(`${BASE_URL}/api/auth/sessions/logout-others`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!logoutOthersRes.ok) throw new Error('Logout others failed');
  console.log('  ✓ Success: Other sessions terminated.\n');

  console.log('====================================================');
  console.log('ALL 16 AUTHENTICATION & SECURITY TESTS PASSED 100%!');
  console.log('====================================================');
}

runTests().catch((err) => {
  console.error('\n❌ Test Suite Error:', err);
  process.exit(1);
});
