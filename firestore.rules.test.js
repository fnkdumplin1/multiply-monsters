// Firebase Security Rules Test Cases
// Run these tests to validate the security rules work correctly

import { initializeTestEnvironment } from '@firebase/rules-unit-testing';

let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'multiply-monsters-classroom',
    firestore: {
      rules: './firestore.rules',
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('Session Security Rules', () => {

  test('Allow creating valid session', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const sessionRef = db.doc('sessions/TEST');

    const validSession = {
      code: 'TEST',
      teacherName: 'Ms. Johnson',
      gameMode: 'timed',
      timeLimit: 300,
      createdAt: new Date(),
      isActive: true,
      students: [],
      startedAt: null,
      endedAt: null
    };

    await expect(sessionRef.set(validSession)).toBePassed();
  });

  test('Reject invalid session code', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const sessionRef = db.doc('sessions/INVALID');

    const invalidSession = {
      code: 'invalid',  // Must be 4 uppercase alphanumeric
      teacherName: 'Ms. Johnson',
      gameMode: 'timed',
      timeLimit: 300,
      createdAt: new Date(),
      isActive: true,
      students: []
    };

    await expect(sessionRef.set(invalidSession)).toBeDenied();
  });

  test('Allow reading any session', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const sessionRef = db.doc('sessions/TEST');

    await expect(sessionRef.get()).toBePassed();
  });

  test('Allow joining session (adding student)', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const sessionRef = db.doc('sessions/TEST');

    // First create a session
    const initialSession = {
      code: 'TEST',
      teacherName: 'Ms. Johnson',
      gameMode: 'timed',
      timeLimit: 300,
      createdAt: new Date(),
      isActive: true,
      students: [],
      startedAt: null,
      endedAt: null
    };
    await sessionRef.set(initialSession);

    // Then add a student
    const updatedSession = {
      ...initialSession,
      students: [{
        name: 'John',
        score: { correct: 0, total: 0 },
        joinedAt: new Date(),
        isReady: false,
        currentStreak: 0,
        bestStreak: 0
      }]
    };

    await expect(sessionRef.update(updatedSession)).toBePassed();
  });

  test('Reject invalid student data', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const sessionRef = db.doc('sessions/TEST');

    const invalidUpdate = {
      students: [{
        name: '',  // Empty name should be rejected
        score: { correct: 0, total: 0 },
        joinedAt: new Date(),
        isReady: false,
        currentStreak: 0,
        bestStreak: 0
      }]
    };

    await expect(sessionRef.update(invalidUpdate)).toBeDenied();
  });

  test('Reject modifying core session data', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const sessionRef = db.doc('sessions/TEST');

    const invalidUpdate = {
      teacherName: 'Different Teacher',  // Should not be allowed to change
      gameMode: 'advanced'
    };

    await expect(sessionRef.update(invalidUpdate)).toBeDenied();
  });

  test('Deny access to other collections', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const otherRef = db.doc('users/test');

    await expect(otherRef.get()).toBeDenied();
    await expect(otherRef.set({name: 'test'})).toBeDenied();
  });

});