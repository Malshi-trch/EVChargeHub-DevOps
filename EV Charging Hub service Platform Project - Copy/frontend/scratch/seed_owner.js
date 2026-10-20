import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashPassword, generateSalt } from '../server/authBackend.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_FILE = path.join(__dirname, '../server/data/users.json');

const salt = generateSalt();
const hash = hashPassword('EcoCharge@2026!', salt);

const seedUsers = [
  {
    id: 'owner_kasun_01',
    email: 'owner@evchargehub.lk',
    passwordHash: hash,
    salt: salt,
    fullName: 'Eng. Kasun Perera',
    role: 'owner',
    phone: '+94 77 123 4567',
    companyName: 'EcoCharge Lanka Holdings',
    businessAddress: 'No. 45, Galle Road, Colombo 03, Sri Lanka',
    profilePicture: null,
    createdAt: '2026-01-15T08:00:00.000Z',
    lastLoginAt: new Date().toISOString(),
    passwordChangedAt: '2026-09-01T12:00:00.000Z',
    sessions: [
      {
        sessionId: 'sess_default_current',
        token: 'token_initial_owner_seed',
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0',
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      },
    ],
    resetTokens: [],
  },
];

fs.writeFileSync(USERS_FILE, JSON.stringify(seedUsers, null, 2), 'utf-8');
console.log('✓ Reset users.json to canonical owner credentials:');
console.log('  Email: owner@evchargehub.lk');
console.log('  Password: EcoCharge@2026!');
