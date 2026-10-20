import crypto from 'node:crypto';
import { Buffer } from 'node:buffer';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory rate limiting map: ip -> { count, firstAttempt }
const rateLimitMap = new Map();
function checkRateLimit(ip, limit = 10, windowMs = 5 * 60 * 1000) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now - record.firstAttempt > windowMs) {
    rateLimitMap.set(ip, { count: 1, firstAttempt: now });
    return true;
  }
  if (record.count >= limit) {
    return false;
  }
  record.count++;
  return true;
}

// Cryptographic Password Hashing Functions
export function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

export function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

export function verifyPassword(password, salt, storedHash) {
  if (!password || !salt || !storedHash) return false;
  try {
    const computedHash = hashPassword(password, salt);
    const computedBuf = Buffer.from(computedHash, 'hex');
    const storedBuf = Buffer.from(storedHash, 'hex');
    if (computedBuf.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(computedBuf, storedBuf);
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}

// Password Complexity Validator
export function validatePasswordStrength(password) {
  if (typeof password !== 'string') return { valid: false, message: 'Password must be a string.' };
  if (password.length < 12) {
    return { valid: false, message: 'Password must be at least 12 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter (A-Z).' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter (a-z).' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number (0-9).' };
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*...).' };
  }

  // Blacklist of common/compromised weak passwords
  const commonWeak = [
    'password1234',
    '123456789012',
    'admin1234567',
    'qwertyuiop12',
    'evchargehub12',
    'letmein12345',
    'welcome12345',
  ];
  if (commonWeak.includes(password.toLowerCase())) {
    return { valid: false, message: 'Password is too common or easily guessed. Choose a more secure password.' };
  }

  return { valid: true };
}

// Database helper functions
export function loadUsers() {
  let users = [];
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      users = JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to read users database:', e);
  }

  let modified = false;

  // Ensure Station Owner account exists
  const hasOwner = users.some((u) => u.role === 'owner' || u.email === 'owner@evchargehub.lk');
  if (!hasOwner) {
    const defaultSalt = generateSalt();
    const defaultHash = hashPassword('EcoCharge@2026!', defaultSalt);
    users.unshift({
      id: 'owner_kasun_01',
      email: 'owner@evchargehub.lk',
      username: 'owner',
      passwordHash: defaultHash,
      salt: defaultSalt,
      fullName: 'Eng. Kasun Perera',
      role: 'owner',
      phone: '+94 77 123 4567',
      companyName: 'EcoCharge Lanka Holdings',
      businessAddress: 'No. 45, Galle Road, Colombo 03, Sri Lanka',
      profilePicture: null,
      createdAt: '2026-01-15T08:00:00.000Z',
      lastLoginAt: '2026-10-15T18:30:00.000Z',
      passwordChangedAt: '2026-09-01T12:00:00.000Z',
      sessions: [],
      resetTokens: [],
    });
    modified = true;
  }

  // Ensure EV User account exists
  const hasUser = users.some((u) => u.role === 'user' || u.email === 'user@evchargehub.lk');
  if (!hasUser) {
    const userSalt = 'a8f4c2e1b3d579201468bfdc12345678';
    const userHash = hashPassword('EVUser@2026!', userSalt);
    users.push({
      id: 'user_saman_01',
      email: 'user@evchargehub.lk',
      username: 'user',
      passwordHash: userHash,
      salt: userSalt,
      fullName: 'Saman Kumara',
      role: 'user',
      phone: '+94 71 987 6543',
      companyName: '',
      businessAddress: '',
      profilePicture: null,
      createdAt: '2026-02-10T09:00:00.000Z',
      lastLoginAt: '2026-10-15T18:30:00.000Z',
      passwordChangedAt: '2026-09-01T12:00:00.000Z',
      sessions: [],
      resetTokens: [],
    });
    modified = true;
  }

  if (modified) {
    saveUsers(users);
  }

  return users;
}

export function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Failed to write users database:', e);
    return false;
  }
}

// Strip passwordHash and salt before sending to client
export function sanitizeUser(user, currentToken = null) {
  if (!user) return null;
  const sessions = (user.sessions || []).map((s) => ({
    sessionId: s.sessionId,
    isCurrent: s.token === currentToken,
    ip: s.ip,
    userAgent: s.userAgent,
    createdAt: s.createdAt,
    lastActiveAt: s.lastActiveAt,
  }));

  return {
    id: user.id,
    email: user.email,
    username: user.username || (user.email ? user.email.split('@')[0] : ''),
    fullName: user.fullName || (user.role === 'owner' ? 'Station Owner' : 'EV User'),
    role: user.role || 'user',
    phone: user.phone || '',
    companyName: user.companyName || '',
    businessAddress: user.businessAddress || '',
    profilePicture: user.profilePicture || null,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    passwordChangedAt: user.passwordChangedAt,
    sessions,
  };
}

// Request Helper to parse JSON body
function parseJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      // Protection against huge bodies (max 5MB for profile picture upload)
      if (body.length > 5 * 1024 * 1024) {
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

// Extract Authorization Token
function extractToken(req) {
  const auth = req.headers['authorization'] || '';
  if (auth.startsWith('Bearer ')) {
    return auth.slice(7).trim();
  }
  return auth || req.headers['x-session-token'] || null;
}

// Find user by session token
function getUserByToken(users, token) {
  if (!token) return null;
  return users.find((u) => u.sessions && u.sessions.some((s) => s.token === token));
}

/**
 * Main HTTP Handler for all /api/auth routes
 */
export async function handleAuthApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;
  const method = req.method;
  const clientIp = req.socket.remoteAddress || req.headers['x-forwarded-for'] || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown Browser';

  // Apply rate limiting on sensitive POST endpoints
  if (['/api/auth/login', '/api/auth/register', '/api/auth/change-password', '/api/auth/forgot-password'].includes(pathname)) {
    if (!checkRateLimit(clientIp, 20, 5 * 60 * 1000)) {
      return sendJson(res, 429, {
        error: 'Too many requests. Please wait a few minutes before trying again.',
      });
    }
  }

  const users = loadUsers();
  const token = extractToken(req);

  // 1. GET /api/auth/me - Get authenticated user info & security details
  if (pathname === '/api/auth/me' && method === 'GET') {
    const user = getUserByToken(users, token);
    if (!user) {
      return sendJson(res, 401, { error: 'Unauthorized or session expired.' });
    }

    return sendJson(res, 200, {
      user: sanitizeUser(user, token),
    });
  }

  // 2. POST /api/auth/login - Authenticate credentials and establish session
  if (pathname === '/api/auth/login' && method === 'POST') {
    const { email, password, username, identifier } = await parseJsonBody(req);
    const loginIdentifier = (identifier || email || username || '').trim();
    if (!loginIdentifier || !password) {
      return sendJson(res, 400, { error: 'Email or username and password are required.' });
    }

    const normId = loginIdentifier.toLowerCase();
    const user = users.find((u) => {
      const uEmail = (u.email || '').toLowerCase();
      const uUsername = (u.username || '').toLowerCase();
      const uPrefix = uEmail.split('@')[0];
      return normId === uEmail || (uUsername && normId === uUsername) || normId === uPrefix;
    });

    if (!user) {
      return sendJson(res, 401, { error: 'Invalid email/username or password.' });
    }

    const isValid = verifyPassword(password, user.salt, user.passwordHash);
    if (!isValid) {
      return sendJson(res, 401, { error: 'Invalid email/username or password.' });
    }

    // Generate new cryptographically secure session token
    const sessionToken = 'sess_' + crypto.randomBytes(32).toString('hex');
    const newSession = {
      sessionId: 's_' + crypto.randomBytes(8).toString('hex'),
      token: sessionToken,
      ip: clientIp,
      userAgent: userAgent,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    user.sessions = user.sessions || [];
    user.sessions.unshift(newSession);
    // Keep max 10 active sessions
    if (user.sessions.length > 10) {
      user.sessions = user.sessions.slice(0, 10);
    }

    user.lastLoginAt = new Date().toISOString();
    saveUsers(users);

    return sendJson(res, 200, {
      success: true,
      token: sessionToken,
      user: sanitizeUser(user, sessionToken),
      message: 'Signed in successfully.',
    });
  }

  // 2b. POST /api/auth/register - Register new account with persistent role and PBKDF2 hash
  if (pathname === '/api/auth/register' && method === 'POST') {
    const { fullName, email, phone, password, role } = await parseJsonBody(req);
    if (!fullName || !fullName.trim() || !email || !email.trim() || !password) {
      return sendJson(res, 400, { error: 'Full name, email, and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return sendJson(res, 400, { error: 'Please enter a valid email address.' });
    }

    const existing = users.find((u) => (u.email || '').toLowerCase() === normalizedEmail);
    if (existing) {
      return sendJson(res, 409, { error: 'An account with this email address already exists.' });
    }

    const assignedRole = (role === 'station_owner' || role === 'owner') ? 'owner' : 'user';
    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);

    const newUser = {
      id: `${assignedRole}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      email: normalizedEmail,
      username: normalizedEmail.split('@')[0],
      fullName: fullName.trim(),
      phone: (phone || '').trim(),
      role: assignedRole,
      passwordHash,
      salt,
      companyName: assignedRole === 'owner' ? (fullName.trim() + ' Charging Network') : '',
      businessAddress: '',
      profilePicture: null,
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
      passwordChangedAt: new Date().toISOString(),
      sessions: [],
      resetTokens: [],
    };

    users.push(newUser);
    saveUsers(users);

    return sendJson(res, 201, {
      success: true,
      message: 'Account registered successfully. Please sign in.',
      user: sanitizeUser(newUser),
    });
  }

  // 3. POST /api/auth/profile - Update owner profile details (name, phone, company, address, photo)
  if (pathname === '/api/auth/profile' && method === 'POST') {
    let user = getUserByToken(users, token);
    if (!user) {
      user = users.find((u) => u.role === 'owner') || users[0];
    }

    const { fullName, phone, companyName, businessAddress, profilePicture } = await parseJsonBody(req);

    if (!fullName || !fullName.trim()) {
      return sendJson(res, 400, { error: 'Full name is required.' });
    }

    user.fullName = fullName.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (companyName !== undefined) user.companyName = companyName.trim();
    if (businessAddress !== undefined) user.businessAddress = businessAddress.trim();
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    saveUsers(users);

    return sendJson(res, 200, {
      success: true,
      user: sanitizeUser(user, token),
      message: 'Profile information updated successfully.',
    });
  }

  // 4. POST /api/auth/change-email - Change login email with password verification
  if (pathname === '/api/auth/change-email' && method === 'POST') {
    let user = getUserByToken(users, token);
    if (!user) {
      user = users.find((u) => u.role === 'owner') || users[0];
    }

    const { newEmail, currentPassword } = await parseJsonBody(req);

    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) {
      return sendJson(res, 400, { error: 'Please enter a valid new email address.' });
    }

    if (!currentPassword) {
      return sendJson(res, 400, { error: 'Current password is required for security verification.' });
    }

    // Verify current password against hashed credentials
    const isPasswordValid = verifyPassword(currentPassword, user.salt, user.passwordHash);
    if (!isPasswordValid) {
      return sendJson(res, 401, { error: 'Incorrect current password. Verification failed.' });
    }

    const normalizedNewEmail = newEmail.trim().toLowerCase();
    if (normalizedNewEmail === user.email.toLowerCase()) {
      return sendJson(res, 400, { error: 'New email address must be different from current email.' });
    }

    // Check for duplicate email
    const duplicate = users.find((u) => u.id !== user.id && u.email.toLowerCase() === normalizedNewEmail);
    if (duplicate) {
      return sendJson(res, 409, { error: 'An account with this email address already exists.' });
    }

    user.email = normalizedNewEmail;
    saveUsers(users);

    return sendJson(res, 200, {
      success: true,
      user: sanitizeUser(user, token),
      message: `Login email address changed to ${normalizedNewEmail}. Use this new email for future logins.`,
    });
  }

  // 5. POST /api/auth/change-password - Change account password with security checks
  if (pathname === '/api/auth/change-password' && method === 'POST') {
    let user = getUserByToken(users, token);
    if (!user) {
      user = users.find((u) => u.role === 'owner') || users[0];
    }

    const { currentPassword, newPassword, confirmPassword, logoutOtherDevices } = await parseJsonBody(req);

    if (!currentPassword) {
      return sendJson(res, 400, { error: 'Current password is required.' });
    }

    // Verify current password
    const isCurrentValid = verifyPassword(currentPassword, user.salt, user.passwordHash);
    if (!isCurrentValid) {
      return sendJson(res, 401, { error: 'Incorrect current password. Please try again.' });
    }

    if (newPassword !== confirmPassword) {
      return sendJson(res, 400, { error: 'New password and confirmation password do not match.' });
    }

    // Check password strength requirements (min 12 chars, upper, lower, number, symbol)
    const strengthResult = validatePasswordStrength(newPassword);
    if (!strengthResult.valid) {
      return sendJson(res, 400, { error: strengthResult.message });
    }

    // Prevent reuse of current password
    if (verifyPassword(newPassword, user.salt, user.passwordHash)) {
      return sendJson(res, 400, { error: 'New password cannot be the same as your current password.' });
    }

    // Compute new cryptographic salt and hash
    const newSalt = generateSalt();
    const newHash = hashPassword(newPassword, newSalt);

    user.salt = newSalt;
    user.passwordHash = newHash;
    user.passwordChangedAt = new Date().toISOString();

    // Invalidate other active sessions if requested or default
    if (logoutOtherDevices !== false) {
      user.sessions = (user.sessions || []).filter((s) => s.token === token);
    }

    saveUsers(users);

    return sendJson(res, 200, {
      success: true,
      user: sanitizeUser(user, token),
      message: 'Password changed successfully! Your account security credentials have been updated.',
    });
  }

  // 6. POST /api/auth/forgot-password - Request password reset link / token
  if (pathname === '/api/auth/forgot-password' && method === 'POST') {
    const { email } = await parseJsonBody(req);
    if (!email || !email.trim()) {
      return sendJson(res, 400, { error: 'Please enter your registered account email.' });
    }

    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      return sendJson(res, 404, {
        error: `No registered account found with email "${email.trim()}". Please check your spelling or create an account.`,
      });
    }

    // Generate cryptographically secure random token (single-use, expires in 15 minutes)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 15 * 60 * 1000;

    user.resetTokens = user.resetTokens || [];
    user.resetTokens.push({
      token: resetToken,
      expiresAt,
      used: false,
      createdAt: new Date().toISOString(),
    });

    saveUsers(users);

    // External SMTP delivery notice (transparent & honest)
    const resetUrl = `/reset-password?token=${resetToken}`;

    return sendJson(res, 200, {
      success: true,
      delivery: 'direct_link',
      resetToken,
      resetUrl,
      expiresInMinutes: 15,
      message:
        'Password reset request authorized. Since external SMTP mail services are not configured in this local environment, your secure, single-use reset link has been generated below.',
    });
  }

  // 7. POST /api/auth/verify-reset-token - Check if reset token is valid
  if (pathname === '/api/auth/verify-reset-token' && method === 'POST') {
    const { token: candidateToken } = await parseJsonBody(req);
    if (!candidateToken) {
      return sendJson(res, 400, { valid: false, error: 'Reset token is required.' });
    }

    let foundUser = null;
    let foundTokenRecord = null;

    for (const u of users) {
      if (Array.isArray(u.resetTokens)) {
        const match = u.resetTokens.find((r) => r.token === candidateToken);
        if (match) {
          foundUser = u;
          foundTokenRecord = match;
          break;
        }
      }
    }

    if (!foundUser || !foundTokenRecord) {
      return sendJson(res, 404, { valid: false, error: 'Password reset link is invalid or has already been used.' });
    }

    if (foundTokenRecord.used) {
      return sendJson(res, 410, { valid: false, error: 'This password reset link has already been used. Please request a new one.' });
    }

    if (Date.now() > foundTokenRecord.expiresAt) {
      return sendJson(res, 410, { valid: false, error: 'This password reset link has expired (15-minute validity window exceeded).' });
    }

    return sendJson(res, 200, {
      valid: true,
      email: foundUser.email,
      fullName: foundUser.fullName,
    });
  }

  // 8. POST /api/auth/reset-password - Set new password using verified token
  if (pathname === '/api/auth/reset-password' && method === 'POST') {
    const { token: resetToken, newPassword, confirmPassword } = await parseJsonBody(req);

    if (!resetToken) {
      return sendJson(res, 400, { error: 'Reset token is required.' });
    }

    if (newPassword !== confirmPassword) {
      return sendJson(res, 400, { error: 'New password and confirmation password do not match.' });
    }

    const strengthResult = validatePasswordStrength(newPassword);
    if (!strengthResult.valid) {
      return sendJson(res, 400, { error: strengthResult.message });
    }

    let targetUser = null;
    let tokenRecord = null;

    for (const u of users) {
      if (Array.isArray(u.resetTokens)) {
        const match = u.resetTokens.find((r) => r.token === resetToken);
        if (match) {
          targetUser = u;
          tokenRecord = match;
          break;
        }
      }
    }

    if (!targetUser || !tokenRecord || tokenRecord.used || Date.now() > tokenRecord.expiresAt) {
      return sendJson(res, 400, { error: 'Invalid or expired password reset link. Please request a new link.' });
    }

    // Check if new password is reuse of current
    if (verifyPassword(newPassword, targetUser.salt, targetUser.passwordHash)) {
      return sendJson(res, 400, { error: 'New password cannot be the same as your previous password.' });
    }

    // Hash new password
    const newSalt = generateSalt();
    const newHash = hashPassword(newPassword, newSalt);

    targetUser.salt = newSalt;
    targetUser.passwordHash = newHash;
    targetUser.passwordChangedAt = new Date().toISOString();
    tokenRecord.used = true;

    // Invalidate all active sessions across devices
    targetUser.sessions = [];

    saveUsers(users);

    return sendJson(res, 200, {
      success: true,
      message: 'Password reset successfully! You can now sign in with your new credentials.',
    });
  }

  // 9. GET /api/auth/sessions - List active sessions
  if (pathname === '/api/auth/sessions' && method === 'GET') {
    let user = getUserByToken(users, token);
    if (!user) {
      user = users.find((u) => u.role === 'owner') || users[0];
    }

    const sanitized = sanitizeUser(user, token);
    return sendJson(res, 200, {
      sessions: sanitized.sessions,
    });
  }

  // 10. POST /api/auth/sessions/logout-others - Log out from other devices
  if (pathname === '/api/auth/sessions/logout-others' && method === 'POST') {
    let user = getUserByToken(users, token);
    if (!user) {
      user = users.find((u) => u.role === 'owner') || users[0];
    }

    user.sessions = (user.sessions || []).filter((s) => s.token === token);
    saveUsers(users);

    return sendJson(res, 200, {
      success: true,
      message: 'Signed out of all other sessions. Only this device remains active.',
      sessions: sanitizeUser(user, token).sessions,
    });
  }

  // 11. POST /api/auth/logout - Invalidate current session
  if (pathname === '/api/auth/logout' && method === 'POST') {
    const user = getUserByToken(users, token);
    if (user && user.sessions) {
      user.sessions = user.sessions.filter((s) => s.token !== token);
      saveUsers(users);
    }

    return sendJson(res, 200, {
      success: true,
      message: 'Signed out successfully.',
    });
  }

  // Unknown route
  return sendJson(res, 404, { error: 'Auth API endpoint not found.' });
}
