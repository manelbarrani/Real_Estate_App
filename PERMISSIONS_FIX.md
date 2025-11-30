# Fix Bookings Permission Errors

## Problem
You're getting: **"The current user is not authorized to perform the requested action"**

This is because the bookings collection doesn't have proper permissions set in Appwrite.

---

## Solution: Set Up Permissions in Appwrite Console

### Step 1: Open Appwrite Console
1. Go to https://cloud.appwrite.io (or your Appwrite URL)
2. Navigate to your project: **JSM_ReState**
3. Go to **Databases** → **development** database
4. Click on **bookings** collection

### Step 2: Configure Permissions

Click on **Settings** tab → **Permissions** section

#### Option A: Simple (For Testing) ⚠️ NOT for production

**Add these permissions:**

| Role | Permissions |
|------|-------------|
| `any` | `read` |
| `users` | `create`, `update` |

**How to add:**
1. Click "+ Add Role"
2. Select **"Any"** → Check **"Read"** → Save
3. Click "+ Add Role"  
4. Select **"Users"** → Check **"Create"** and **"Update"** → Save

⚠️ **Warning:** This allows ANYONE to read all bookings! Use only for testing.

---

#### Option B: Secure (Recommended) ✅

**Add these permissions:**

| Role | Permissions |
|------|-------------|
| `users` | `create`, `read`, `update` |

**How to add:**
1. Click "+ Add Role"
2. Select **"Users"** (any authenticated user)
3. Check: **"Create"**, **"Read"**, **"Update"**
4. Click **Save**

This allows:
- ✅ Any logged-in user to create bookings
- ✅ Any logged-in user to read bookings (filtered by queries)
- ✅ Any logged-in user to update bookings (agents can accept/reject)

---

#### Option C: Most Secure (Advanced) 🔒

Use **Document-level permissions** (requires code changes):

When creating a booking, pass permissions:
```typescript
await databases.createDocument(
  databaseId,
  bookingsCollectionId,
  ID.unique(),
  { ...bookingData },
  [
    Permission.read(Role.user(guestId)),    // Guest can read
    Permission.read(Role.user(agentId)),     // Agent can read
    Permission.update(Role.user(agentId)),   // Agent can update
  ]
);
```

---

## Step 3: Also Check Payments & Payouts Collections

If you created these, set the same permissions:

**Payments Collection:**
- Role: `users` → `create`, `read`, `update`

**Payouts Collection:**
- Role: `users` → `read` (only read, payouts are system-generated)

---

## Step 4: Test

1. Go back to your app
2. Try to book a property
3. Go to Profile → My Bookings
4. Go to Profile → Booking Requests

All should work now! ✅

---

## Troubleshooting

### Still getting errors?

1. **Check you're logged in:**
   - Logout and login again
   - Verify user session is active

2. **Check collection IDs match:**
   - In Appwrite: Note the collection ID
   - In `.env`: Verify `EXPO_PUBLIC_APPWRITE_BOOKINGS_COLLECTION_ID=bookings`

3. **Clear app cache:**
   ```bash
   npm start -- --reset-cache
   ```

4. **Check logs:**
   - Look for the exact error message
   - Share it if you need more help

---

## Quick Command to Verify

Run this in your app to check if user is authenticated:

```javascript
import { getCurrentUser } from '@/lib/appwrite';

const user = await getCurrentUser();
console.log('Current user:', user?.$id);
```

If `user` is `null`, you need to login first!

---

## Next Steps After Fixing

Once permissions are set:
1. ✅ Test booking a property
2. ✅ Test viewing bookings as guest
3. ✅ Test viewing booking requests as agent
4. ✅ Test accepting/rejecting bookings

Good luck! 🚀
