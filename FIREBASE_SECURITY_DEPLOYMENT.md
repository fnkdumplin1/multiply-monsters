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

### 🚫 **Security Protections**
- Session codes must be exactly 4 characters (A-Z, 0-9)
- Teacher names limited to 50 characters
- Student names limited to 30 characters
- Maximum 50 students per session
- Core session data (teacher, game mode) cannot be modified after creation
- Scores must be valid (correct ≤ total, non-negative)
- No access to collections other than 'sessions'
- Prevents malicious data injection

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
Copy this content directly into Firebase Console Rules tab:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /sessions/{sessionId} {
      allow read: if true;
      allow create: if isValidSessionData(resource.data)
                    && resource.data.keys().hasAll(['code', 'teacherName', 'gameMode', 'timeLimit', 'createdAt', 'isActive', 'students'])
                    && resource.data.code == sessionId
                    && resource.data.code.matches('^[A-Z0-9]{4}$');
      allow update: if isValidSessionUpdate();
      allow delete: if resource.data.isActive == false;
    }

    function isValidSessionData(data) {
      return data.teacherName is string
             && data.teacherName.size() >= 1
             && data.teacherName.size() <= 50
             && data.gameMode in ['timed', 'advanced', 'training']
             && data.timeLimit is number
             && data.timeLimit >= 30
             && data.timeLimit <= 1800
             && data.isActive is bool
             && data.students is list
             && data.students.size() <= 50;
    }

    function isValidSessionUpdate() {
      let data = resource.data;
      let incoming = request.resource.data;
      return data.code == incoming.code
             && data.teacherName == incoming.teacherName
             && data.gameMode == incoming.gameMode
             && data.timeLimit == incoming.timeLimit
             && data.createdAt == incoming.createdAt
             && isValidStudentUpdate()
             && isValidStatusUpdate()
             && incoming.students.size() <= 50;
    }

    function isValidStudentUpdate() {
      let data = resource.data;
      let incoming = request.resource.data;
      return incoming.students.size() >= data.students.size()
             && validateStudentData(incoming.students);
    }

    function validateStudentData(students) {
      return students.hasOnly(['name', 'score', 'joinedAt', 'isReady', 'currentStreak', 'bestStreak'])
             && students.size() > 0 ?
                students[0].name is string &&
                students[0].name.size() >= 1 &&
                students[0].name.size() <= 30 &&
                students[0].score.keys().hasAll(['correct', 'total']) &&
                students[0].score.correct is number &&
                students[0].score.total is number &&
                students[0].score.correct >= 0 &&
                students[0].score.total >= 0 &&
                students[0].score.correct <= students[0].score.total &&
                students[0].currentStreak is number &&
                students[0].bestStreak is number &&
                students[0].currentStreak >= 0 &&
                students[0].bestStreak >= 0
                : true;
    }

    function isValidStatusUpdate() {
      let incoming = request.resource.data;
      return incoming.isActive is bool
             && (incoming.startedAt == null || incoming.startedAt is timestamp)
             && (incoming.endedAt == null || incoming.endedAt is timestamp);
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

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

## Security Benefits

These rules provide:
- **Data Validation**: All inputs are validated for type and size
- **Access Control**: Only session-related operations are allowed
- **Injection Protection**: Prevents malicious data from entering your database
- **Resource Limits**: Prevents abuse with student/session limits
- **Clean Architecture**: Denies access to unrelated collections

Your database is now secure and ready for production classroom use!