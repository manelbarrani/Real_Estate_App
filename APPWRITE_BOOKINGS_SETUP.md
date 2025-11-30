# Booking & Payments Database Setup

## Step 1: Create Collections in Appwrite Console

### 1. Bookings Collection

**Collection ID**: `bookings`

#### Attributes:

| Attribute Name | Type | Size | Required | Default | Array |
|----------------|------|------|----------|---------|-------|
| propertyId | String | 255 | Yes | - | No |
| guestId | String | 255 | Yes | - | No |
| agentId | String | 255 | Yes | - | No |
| checkInDate | Datetime | - | Yes | - | No |
| checkOutDate | Datetime | - | Yes | - | No |
| numberOfGuests | Integer | - | Yes | 1 | No |
| numberOfNights | Integer | - | Yes | - | No |
| pricePerNight | Float | - | Yes | - | No |
| subtotal | Float | - | Yes | - | No |
| serviceFee | Float | - | Yes | - | No |
| totalPrice | Float | - | Yes | - | No |
| status | Enum | - | Yes | pending | No |
| paymentStatus | Enum | - | Yes | unpaid | No |
| specialRequests | String | 1000 | No | - | No |
| rejectionReason | String | 500 | No | - | No |
| cancelledBy | String | 50 | No | - | No |
| confirmedAt | Datetime | - | No | - | No |
| cancelledAt | Datetime | - | No | - | No |

#### Enum Values:
- **status**: pending, confirmed, rejected, cancelled, completed
- **paymentStatus**: unpaid, paid, refunded, partially_refunded

#### Indexes (Important for Query Performance):
1. **guestId_key**: Key: guestId, Type: key - REQUIRED for querying user's bookings
2. **agentId_key**: Key: agentId, Type: key - REQUIRED for querying agent's received bookings
3. **propertyId_key**: Key: propertyId, Type: key - REQUIRED for checking property availability
4. **status_key**: Key: status, Type: key - For filtering by booking status
5. **checkInDate_key**: Key: checkInDate, Type: key - For date-based queries

#### Relationships:
1. **property**: 
   - Type: Many to One
   - Related Collection: properties
   - Attribute: propertyId
   - On Delete: Set Null

2. **guest**:
   - Type: Many to One
   - Related Collection: **agents**
   - Attribute: guestId
   - On Delete: Set Null
   - Note: Every user has an agent profile, so guest is a user booking a property

3. **agent**:
   - Type: Many to One
   - Related Collection: **agents**
   - Attribute: agentId
   - On Delete: Set Null
   - Note: The property owner/host who receives the booking request

#### Permissions:
- **Create**: Any logged-in user
- **Read**: Document owner (guestId) OR Document owner (agentId)
- **Update**: Document owner (agentId) for status changes, System for payment updates
- **Delete**: None

---

### 2. Payments Collection

**Collection ID**: `payments`

#### Attributes:

| Attribute Name | Type | Size | Required | Default | Array |
|----------------|------|------|----------|---------|-------|
| bookingId | String | 255 | Yes | - | No |
| userId | String | 255 | Yes | - | No |
| amount | Float | - | Yes | - | No |
| currency | String | 10 | Yes | USD | No |
| paymentMethod | String | 50 | Yes | - | No |
| paymentGateway | String | 50 | Yes | stripe | No |
| transactionId | String | 255 | Yes | - | No |
| status | Enum | - | Yes | pending | No |
| receiptUrl | URL | 2000 | No | - | No |
| refundAmount | Float | - | No | - | No |
| refundReason | String | 500 | No | - | No |
| refundedAt | Datetime | - | No | - | No |
| gatewayResponse | String | 5000 | No | - | No |

#### Enum Values:
- **status**: pending, succeeded, failed, refunded, partially_refunded

#### Indexes:
1. **userPayments**: Key: userId, Type: key
2. **bookingPayment**: Key: bookingId, Type: key, Unique: true
3. **paymentStatus**: Key: status, Type: key
4. **transactionLookup**: Key: transactionId, Type: key, Unique: true

#### Relationships:
1. **booking**: 
   - Type: One to One
   - Related Collection: bookings
   - Attribute: bookingId
   - On Delete: Set Null

2. **user**:
   - Type: Many to One
   - Related Collection: **agents** (NOT users - use agents since all users have agent profiles)
   - Attribute: userId
   - On Delete: Set Null

#### Permissions:
- **Create**: Document owner (userId)
- **Read**: Document owner (userId) OR related booking's agentId
- **Update**: System only (for status updates)
- **Delete**: None

---

### 3. Payouts Collection

**Collection ID**: `payouts`

#### Attributes:

| Attribute Name | Type | Size | Required | Default | Array |
|----------------|------|------|----------|---------|-------|
| agentId | String | 255 | Yes | - | No |
| amount | Float | - | Yes | - | No |
| currency | String | 10 | Yes | USD | No |
| status | Enum | - | Yes | pending | No |
| bookingIds | String | 255 | Yes | - | Yes |
| payoutMethod | String | 50 | No | bank_transfer | No |
| scheduledDate | Datetime | - | Yes | - | No |
| completedDate | Datetime | - | No | - | No |

#### Enum Values:
- **status**: pending, processing, completed, failed

#### Indexes:
1. **agentPayouts**: Key: agentId, Type: key
2. **payoutStatus**: Key: status, Type: key
3. **scheduledPayouts**: Key: scheduledDate, Type: key

#### Relationships:
1. **agent**:
   - Type: Many to One
   - Related Collection: agents
   - Attribute: agentId
   - On Delete: Set Null

#### Permissions:
- **Create**: None (system only)
- **Read**: Document owner (agentId)
- **Update**: None (system only)
- **Delete**: None

---

## Step 2: Update Environment Variables

Add these to your `.env` file:

```env
EXPO_PUBLIC_APPWRITE_BOOKINGS_COLLECTION_ID=bookings
EXPO_PUBLIC_APPWRITE_PAYMENTS_COLLECTION_ID=payments
EXPO_PUBLIC_APPWRITE_PAYOUTS_COLLECTION_ID=payouts
```

---

## Step 3: Verify Setup

After creating the collections, verify:

1. ✅ All attributes are created with correct types
2. ✅ Enum values are properly set
3. ✅ Indexes are created for performance
4. ✅ Relationships are established (if using relationships)
5. ✅ Permissions are configured correctly
6. ✅ Environment variables are added

---

## Quick Setup Commands (Appwrite CLI - Optional)

If you prefer using the CLI, here's a script outline:

```bash
# Create Bookings Collection
appwrite databases createCollection \
  --databaseId [YOUR_DATABASE_ID] \
  --collectionId bookings \
  --name Bookings

# Create attributes (repeat for each)
appwrite databases createStringAttribute \
  --databaseId [YOUR_DATABASE_ID] \
  --collectionId bookings \
  --key propertyId \
  --size 255 \
  --required true

# Continue with other attributes...
```

---

## Notes:

1. **Relationships vs String IDs**: The setup above uses string IDs for relationships. If you prefer Appwrite relationships, create them in the UI after collections exist.

2. **Permissions**: Adjust based on your security requirements. The current setup allows guests and agents to view their own bookings.

3. **Indexes**: These improve query performance. Add more if you plan to filter by other fields frequently.

4. **Validation**: Consider adding min/max values for numberOfGuests, numberOfNights, and amounts.

5. **Cascading Deletes**: Currently set to "Set Null" to preserve booking history even if a property is deleted.

---

**Next Step**: After creating these collections, update `lib/appwrite.ts` with the new collection IDs.
