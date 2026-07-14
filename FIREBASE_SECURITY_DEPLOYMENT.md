# Firebase Security Rules Deployment Guide

## Overview
These security rules protect your multiplication trainer app's Firebase database while allowing classroom functionality to work properly.

## What the Rules Do

### ✅ **Allowed Operations**
- **Teachers**: Create new classroom sessions with valid 4-character codes
- **Students**: Join sessions by knowing the session code
- **All Users**: Read session data and receive real-time updates
- **Score Updates**: Students can update their own scores and streaks
- **Session Control**: Start/end sessions and update session status
- **Cleanup**: Delete inactive sessions
- **Teacher Portal**: Anyone can create a Firebase Auth account and register a `teachers` doc (keyed by their own UID); anyone can read the `teachers` list (needed for the unauthenticated student "select your teacher" dropdown); students (unauthenticated) can log a `usageEvents` entry for a play session

### 🚫 **Security Protections**
- Session codes must be exactly 4 characters (A-Z, 0-9)
- Teacher names limited to 50 characters
- Student names limited to 30 characters
- Maximum 50 students per session
- Core session data (teacher, game mode) cannot be modified after creation
- Scores must be valid (correct ≤ total, non-negative)
- No access to collections other than 'sessions', 'squadBattles', 'teachers', and 'usageEvents'
- Prevents malicious data injection
- **Teacher Portal**: `teachers` docs can only be created/updated by the authenticated owner of that UID; `usageEvents` are an immutable log (no update/delete) and can only be *read* by the authenticated teacher whose UID matches the event's `teacherId` — a student cannot read another teacher's usage data merely by knowing/guessing a display name, since the check is against the real Firebase Auth UID, not a client-supplied string

## Deployment Steps

### Option 1: Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `multiply-monsters-classroom`
3. Click "Firestore Database" in the left sidebar
4. Click the "Rules" tab
5. Copy the contents of `firestore.rules` (created in your project)
6. Paste into the rules editor
7. Click "Publish"

### Option 2: Firebase CLI
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project directory (if not done)
firebase init firestore

# Deploy the rules
firebase deploy --only firestore:rules
```

### Option 3: Manual Copy-Paste
Copy the full, current contents of `firestore.rules` directly into the Firebase Console Rules tab. As of the Teacher Portal feature, that file contains four collections (`sessions`, `squadBattles`, `teachers`, `usageEvents`) plus a catch-all deny — always copy from `firestore.rules` itself rather than this doc, since this doc is a snapshot and can drift out of sync with the real file (as this section previously had). The `teachers`/`usageEvents` blocks specifically:

```javascript
    // Secure rules for teachers collection (Teacher Portal)
    match /teachers/{teacherId} {
      // Anyone can read the teacher list (needed for the unauthenticated student dropdown)
      allow read: if true;

      // A teacher can only create their own doc, keyed by their own Auth UID
      allow create: if request.auth != null
                    && request.auth.uid == teacherId
                    && request.resource.data.displayName is string
                    && request.resource.data.displayName.size() > 0
                    && request.resource.data.displayName.size() <= 50;

      // A teacher can only update their own doc
      allow update: if request.auth != null && request.auth.uid == teacherId;

      // No delete flow in v1
      allow delete: if false;
    }

    // Secure rules for usageEvents collection (Teacher Portal)
    match /usageEvents/{eventId} {
      // Students (unauthenticated) can log an event, but only well-formed ones,
      // and only referencing a teacherId that actually exists as a real teacher
      allow create: if request.resource.data.studentName is string
                    && request.resource.data.studentName.size() > 0
                    && request.resource.data.studentName.size() <= 30
                    && request.resource.data.gameMode in
                         ['unlimited','timed','advanced','detective','twoDigit','division','squadBattle','squadSurvival']
                    && request.resource.data.durationSeconds is number
                    && request.resource.data.durationSeconds >= 0
                    && request.resource.data.durationSeconds <= 3600
                    && (request.resource.data.teacherId == null ||
                        exists(/databases/$(database)/documents/teachers/$(request.resource.data.teacherId)));

      // Immutable log - no edits or deletes after creation
      allow update, delete: if false;

      // Only the authenticated teacher who owns this event can read it
      allow read: if request.auth != null && request.auth.uid == resource.data.teacherId;
    }
```

## Required Firestore Index (Teacher Portal)

The teacher dashboard's `fetchUsageEventsForTeacher` query (`src/teacherUtils.js`) filters `usageEvents` by `teacherId` **and** `startedAt` in the same query. Firestore requires a composite index for any query that combines an equality filter with a range/inequality filter on different fields - unlike `firestore.rules`, this can't be pasted in; it has to be created once per project.

**Without this index, the dashboard silently shows "No usage yet" even when events exist**, and the browser console logs `FirebaseError: The query requires an index.`

To create it:
1. Play through any mode as a student with a teacher selected, then open that teacher's `/teacher/dashboard` and check the browser console for the error above - it includes a direct "create it here" link with the index pre-filled. Click it and press **Save** in the Firebase Console. *(Or build it manually: Firestore Database → Indexes tab → Add index → collection `usageEvents` → fields `teacherId` Ascending, `startedAt` Ascending.)*
2. Wait for the index status to show **Enabled** (usually 1-5 minutes for a new collection) before re-testing the dashboard.

This is a one-time setup step per Firebase project (e.g. needed again if you ever point the app at a different `multiply-monsters-classroom`-style project), not something that redeploys with `firestore.rules`.

## Testing the Rules

### Manual Testing
1. Deploy the rules
2. Try creating a classroom session in your app
3. Have a student join the session
4. Verify scores update properly
5. Check that invalid operations are blocked

### Automated Testing (Optional)
Run the test suite with:
```bash
npm install --save-dev @firebase/rules-unit-testing
npm test firestore.rules.test.js
```

## Post-Deployment Verification

After deploying, verify your app still works:

1. **Teacher Flow**: Create a new classroom session
2. **Student Flow**: Join with session code
3. **Real-time Updates**: Verify live score updates work
4. **Session Management**: Start and end sessions properly

## Troubleshooting

### Common Issues:

**"Permission denied" errors:**
- Check that session codes are exactly 4 characters (A-Z, 0-9)
- Verify all required fields are present when creating sessions
- Ensure student names are 1-30 characters

**Rules won't deploy:**
- Check for syntax errors in the rules
- Ensure you're logged into the correct Firebase project
- Verify project ID matches your app configuration

**App functionality breaks:**
- Compare your app's data structure with rule requirements
- Check browser console for specific error messages
- Test with a fresh session to isolate issues

**Teacher dashboard stuck on "No usage yet" despite students having played:**
- This is not a rules issue - check the browser console for `FirebaseError: The query requires an index`
- See [Required Firestore Index (Teacher Portal)](#required-firestore-index-teacher-portal) above

## Security Benefits

These rules provide:
- **Data Validation**: All inputs are validated for type and size
- **Access Control**: Only session-related operations are allowed
- **Injection Protection**: Prevents malicious data from entering your database
- **Resource Limits**: Prevents abuse with student/session limits
- **Clean Architecture**: Denies access to unrelated collections

Your database is now secure and ready for production classroom use!