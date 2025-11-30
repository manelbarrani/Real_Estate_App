# Epic: Booking & Payments System

## Overview
Complete booking and payment management system for the real estate application, enabling users to book properties, make payments, and allowing agents to manage bookings and track earnings.

---

## User Stories & Requirements

### 1. User Story: Request Property Booking

**As a** user  
**I want to** request to book a property  
**So that** I can reserve it for specific dates

#### Acceptance Criteria

```gherkin
Scenario: User requests booking for available property
  Given I am logged in as a user
  And I am viewing a property detail page
  And the property is available for booking
  When I tap the "Book Now" button
  Then I should see a booking request form
  And I should be able to select check-in and check-out dates
  And I should see the total price calculation
  And I can submit the booking request

Scenario: Booking request for unavailable dates
  Given I am on the booking form
  When I select dates that are already booked
  Then I should see an error message "These dates are not available"
  And the submit button should be disabled

Scenario: Booking own property
  Given I am viewing my own property
  When I try to book it
  Then the "Book Now" button should not be visible
  And I should see "You cannot book your own property"
```

#### Validation Rules
- Check-in date must be in the future (at least 24 hours from now)
- Check-out date must be after check-in date
- Minimum booking duration: 1 night
- Maximum booking duration: 90 nights
- User cannot book their own property
- Dates must not overlap with existing confirmed bookings

#### Data Requirements
- Property ID
- User ID (guest)
- Check-in date (ISO 8601)
- Check-out date (ISO 8601)
- Number of guests
- Total price (calculated)
- Status: pending, confirmed, rejected, cancelled
- Special requests (optional text field)
- Created timestamp

---

### 2. User Story: Select Booking Dates

**As a** user  
**I want to** select check-in and check-out dates  
**So that** I can specify when I need the property

#### Acceptance Criteria

```gherkin
Scenario: Select dates from calendar
  Given I am on the booking form
  When I tap the date selector
  Then I should see a calendar view
  And unavailable dates should be visually disabled
  And I should see pricing for different date ranges
  
Scenario: Date range selection
  Given I have selected a check-in date
  When I select a check-out date
  Then the date range should be highlighted
  And I should see the number of nights
  And I should see the total price calculation
  
Scenario: Price calculation display
  Given I have selected valid dates
  Then I should see:
    | Item | Description |
    | Base price per night | Property nightly rate |
    | Number of nights | Calculated from date range |
    | Subtotal | Base price × nights |
    | Service fee | 10% of subtotal |
    | Total | Subtotal + service fee |
```

#### Validation Rules
- Disable past dates
- Disable dates that overlap with confirmed bookings
- Show different visual states: available, booked, selected
- Highlight weekends with different color (optional)
- Show price changes for different seasons (if applicable)

#### UI Components Needed
- Calendar picker component
- Date range selector
- Price breakdown component
- Guest counter (+/- buttons)

---

### 3. User Story: View Booking Requests

**As a** user  
**I want to** view all my booking requests  
**So that** I can track their status and details

#### Acceptance Criteria

```gherkin
Scenario: View all bookings list
  Given I am logged in
  When I navigate to "My Bookings" page
  Then I should see a list of all my bookings
  And each booking should show:
    | Field | Details |
    | Property image | Thumbnail |
    | Property name | Title |
    | Dates | Check-in to check-out |
    | Status | Badge with color coding |
    | Total price | Currency formatted |
    
Scenario: Filter bookings by status
  Given I am on the bookings page
  When I select a filter (Pending/Confirmed/Cancelled)
  Then I should only see bookings with that status
  
Scenario: View booking details
  Given I see a booking in the list
  When I tap on it
  Then I should see full booking details including:
    - Property information
    - Check-in/check-out dates
    - Number of guests
    - Price breakdown
    - Booking status
    - Payment status
    - Agent contact information
    - Special requests
    
Scenario: Empty state
  Given I have no bookings
  When I visit the bookings page
  Then I should see "No bookings yet"
  And a button to "Explore Properties"
```

#### Status Color Coding
- **Pending**: Orange - awaiting agent approval
- **Confirmed**: Green - approved by agent, awaiting payment or paid
- **Rejected**: Red - declined by agent
- **Cancelled**: Gray - cancelled by user or agent
- **Completed**: Blue - past booking, completed

---

### 4. User Story: Agent Views Booking Requests

**As an** agent  
**I want to** view booking requests for my properties  
**So that** I can review and respond to them

#### Acceptance Criteria

```gherkin
Scenario: View all incoming requests
  Given I am logged in as an agent
  When I navigate to "Booking Requests" page
  Then I should see all bookings for my properties
  And pending requests should appear at the top
  And I should see a count badge of pending requests
  
Scenario: Filter by property
  Given I have multiple properties with bookings
  When I select a specific property filter
  Then I should only see bookings for that property
  
Scenario: Booking request details
  Given I see a pending booking request
  Then I should see:
    - Guest name and avatar
    - Guest rating/reviews (if available)
    - Property details
    - Requested dates
    - Number of guests
    - Total earnings (after platform fee)
    - Special requests from guest
    - Accept/Reject buttons
    
Scenario: Notification for new request
  Given a user books my property
  Then I should receive a notification
  And the booking requests badge should update
```

#### Agent Dashboard Features
- Summary cards: Pending requests, Upcoming bookings, Total earnings
- Calendar view showing all bookings across properties
- Quick actions: Accept/Reject from list view
- Guest verification status (if implemented)

---

### 5. User Story: Agent Accept/Reject Bookings

**As an** agent  
**I want to** accept or reject booking requests  
**So that** I can manage my property availability

#### Acceptance Criteria

```gherkin
Scenario: Accept booking request
  Given I am viewing a pending booking request
  When I tap "Accept"
  Then I should see a confirmation dialog
  And when I confirm acceptance
  Then the booking status should change to "Confirmed"
  And the guest should receive a notification
  And the dates should be blocked in my calendar
  And the guest should receive a payment link/instruction
  
Scenario: Reject booking request
  Given I am viewing a pending booking request
  When I tap "Reject"
  Then I should see a reason selection form with options:
    - Dates no longer available
    - Property under maintenance
    - Guest requirements not met
    - Other (text field)
  When I submit the rejection
  Then the booking status should change to "Rejected"
  And the guest should receive a notification with the reason
  And the dates should become available again
  
Scenario: Cannot accept conflicting booking
  Given I have already accepted a booking for specific dates
  When I try to accept another booking with overlapping dates
  Then I should see an error "Dates conflict with existing booking"
  And the accept action should be prevented
```

#### Business Rules
- Agent has 24 hours to respond to booking request
- Auto-reject after 24 hours of no response (optional)
- Cannot accept overlapping bookings
- Rejection reason is required
- Guest gets full refund if rejected after payment

---

### 6. User Story: Make Payment

**As a** user  
**I want to** make payment for my confirmed booking  
**So that** I can secure my reservation

#### Acceptance Criteria

```gherkin
Scenario: View payment options
  Given my booking request is confirmed by agent
  When I view the booking details
  Then I should see "Payment Required" status
  And a "Pay Now" button
  
Scenario: Proceed to payment
  Given I tap "Pay Now"
  Then I should see payment details:
    - Price breakdown
    - Total amount
    - Payment methods (Card, PayPal, etc.)
    - Cancellation policy
  
Scenario: Complete payment successfully
  Given I have entered valid payment information
  When I submit the payment
  Then the payment should be processed
  And I should see a success message
  And the booking status should change to "Paid"
  And I should receive a booking confirmation email
  And the agent should receive payment notification
  
Scenario: Payment fails
  Given the payment processing fails
  Then I should see an error message
  And I should be able to retry payment
  And the booking should remain "Confirmed" (pending payment)
  
Scenario: Payment timeout
  Given my booking is confirmed but not paid
  When 48 hours pass without payment
  Then the booking should auto-cancel
  And I should receive a notification
  And the dates should become available again
```

#### Payment Integration Requirements
- Support major payment gateways (Stripe recommended)
- Secure payment processing (PCI compliant)
- Save payment methods for future bookings (optional)
- Support multiple currencies
- Handle payment failures gracefully
- Implement 3D Secure for card payments

#### Payment Flow
1. User receives booking confirmation
2. User clicks "Pay Now"
3. Payment form loads with amount
4. User enters payment details
5. Payment processed through gateway
6. Success: Update booking status, send confirmations
7. Failure: Show error, allow retry

---

### 7. User Story: View Payment History

**As a** user  
**I want to** view my payment history  
**So that** I can track my spending and download receipts

#### Acceptance Criteria

```gherkin
Scenario: View all payments
  Given I am logged in
  When I navigate to "Payment History"
  Then I should see a list of all my payments with:
    | Field | Description |
    | Date | Payment date/time |
    | Property | Property name |
    | Amount | Total paid |
    | Method | Payment method used |
    | Status | Success/Failed/Refunded |
    | Receipt | Download button |
    
Scenario: Download receipt
  Given I see a successful payment
  When I tap "Download Receipt"
  Then a PDF receipt should be generated and downloaded
  And it should include:
    - Transaction ID
    - Payment date
    - Property details
    - Booking dates
    - Price breakdown
    - Payment method
    - Agent information
    
Scenario: Filter payments
  Given I have multiple payments
  When I apply filters (Date range, Status, Property)
  Then I should see filtered results
  
Scenario: View refund details
  Given I have a refunded payment
  When I view that payment
  Then I should see the refund amount and reason
```

#### Data to Store
- Transaction ID (from payment gateway)
- Booking ID (reference)
- Amount charged
- Currency
- Payment method (last 4 digits if card)
- Payment gateway response
- Timestamp
- Receipt URL or generated PDF
- Refund information (if applicable)

---

### 8. User Story: Cancel Booking

**As a** user  
**I want to** cancel my booking  
**So that** I can get a refund based on cancellation policy

#### Acceptance Criteria

```gherkin
Scenario: Cancel unpaid booking
  Given I have a confirmed but unpaid booking
  When I tap "Cancel Booking"
  Then I should see a confirmation dialog
  And when I confirm cancellation
  Then the booking status should change to "Cancelled"
  And I should not be charged
  And the agent should be notified
  
Scenario: Cancel paid booking with full refund
  Given I have a paid booking
  And the check-in date is more than 7 days away
  When I cancel the booking
  Then I should be eligible for full refund (minus service fee)
  And I should see the refund amount
  And when I confirm
  Then the refund should be processed
  And I should receive confirmation
  
Scenario: Cancel with partial refund
  Given I have a paid booking
  And the check-in date is 3-7 days away
  When I cancel the booking
  Then I should receive 50% refund
  And I should see the cancellation policy details
  
Scenario: Cancel with no refund
  Given I have a paid booking
  And the check-in date is less than 48 hours away
  When I try to cancel
  Then I should see "No refund available"
  And I can still cancel (no refund)
  Or contact agent for special circumstances
  
Scenario: Agent cancels booking
  Given the agent needs to cancel
  When they cancel the booking
  Then the user receives full refund regardless of timing
  And the user is notified immediately
```

#### Cancellation Policy
- **Flexible**: Full refund if cancelled 7+ days before check-in
- **Moderate**: 50% refund if cancelled 3-7 days before
- **Strict**: No refund if cancelled less than 48 hours before
- Agent cancellation: Always full refund to guest
- Refunds processed within 5-10 business days

#### Workflow
1. User clicks "Cancel Booking"
2. Show cancellation policy and refund amount
3. User confirms cancellation
4. Update booking status to "Cancelled"
5. Process refund (if applicable)
6. Send notifications to both parties
7. Free up the dates for new bookings

---

### 9. User Story: Receive Booking Confirmations

**As a** user  
**I want to** receive booking confirmations  
**So that** I have proof of my reservation

#### Acceptance Criteria

```gherkin
Scenario: Receive confirmation after agent approval
  Given the agent accepts my booking request
  Then I should receive an in-app notification
  And an email confirmation with:
    - Booking confirmation number
    - Property details and address
    - Check-in/check-out dates and times
    - Guest count
    - Total price
    - Payment link
    - Cancellation policy
    - Agent contact information
    
Scenario: Receive confirmation after payment
  Given I have completed payment
  Then I should receive:
    - In-app notification "Booking Confirmed & Paid"
    - Email confirmation with booking details
    - Receipt attached
    - Instructions for check-in
    
Scenario: Reminder notifications
  Given my check-in date is approaching
  Then I should receive reminders:
    - 7 days before: "Your trip is coming up"
    - 1 day before: Check-in instructions and agent contact
    - Day of check-in: "Check-in today" with time details
```

#### Notification Channels
- **In-app notifications**: Real-time updates
- **Email**: Detailed confirmations and receipts
- **SMS** (optional): Critical updates only
- **Push notifications**: Enabled by user preference

#### Email Templates Needed
1. Booking request submitted
2. Booking confirmed by agent
3. Payment received
4. Booking reminder (7 days, 1 day, same day)
5. Booking cancelled
6. Refund processed

---

### 10. User Story: Agent Views Earnings

**As an** agent  
**I want to** view my earnings  
**So that** I can track my income from bookings

#### Acceptance Criteria

```gherkin
Scenario: View earnings dashboard
  Given I am logged in as an agent
  When I navigate to "Earnings" page
  Then I should see:
    - Total earnings (all time)
    - This month's earnings
    - Pending payouts
    - Next payout date
    - Earnings chart (monthly breakdown)
    
Scenario: View earnings by property
  Given I have multiple properties
  When I view earnings breakdown
  Then I should see earnings per property
  And I can sort by highest earning
  
Scenario: View transaction details
  Given I see my earnings list
  Then each transaction should show:
    - Booking ID
    - Guest name
    - Property name
    - Booking dates
    - Total booking amount
    - Platform fee (15%)
    - Your earnings (85%)
    - Payout status
    
Scenario: Export earnings report
  Given I want to download my earnings data
  When I tap "Export Report"
  Then I can select date range
  And download CSV or PDF
  And it includes all transaction details
```

#### Earnings Calculation
- **Platform Fee**: 15% of total booking amount
- **Agent Earnings**: 85% of total booking amount
- **Payout Schedule**: Weekly (every Monday) for previous week
- **Minimum Payout**: $50 (accumulates until threshold met)

#### Dashboard Widgets
- Total lifetime earnings (big number)
- This month vs last month comparison
- Upcoming payouts (pending)
- Top earning properties
- Recent transactions list
- Monthly earnings chart

---

## Data Model

### Collections Required

#### 1. Bookings Collection
```typescript
{
  $id: string; // Auto-generated
  propertyId: string; // Relationship to properties
  guestId: string; // Relationship to users
  agentId: string; // Relationship to agents
  checkInDate: string; // ISO 8601
  checkOutDate: string; // ISO 8601
  numberOfGuests: number;
  numberOfNights: number; // Calculated
  pricePerNight: number;
  subtotal: number;
  serviceFee: number; // 10%
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
  paymentStatus: 'unpaid' | 'paid' | 'refunded' | 'partially_refunded';
  specialRequests?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
  cancelledBy?: string; // 'guest' or 'agent'
}
```

#### 2. Payments Collection
```typescript
{
  $id: string;
  bookingId: string; // Relationship to bookings
  userId: string; // Relationship to users
  amount: number;
  currency: string; // Default: 'USD'
  paymentMethod: string; // 'card', 'paypal', etc.
  paymentGateway: string; // 'stripe', 'paypal'
  transactionId: string; // From payment gateway
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  receiptUrl?: string;
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: string;
  createdAt: string;
  gatewayResponse: string; // JSON string
}
```

#### 3. Payouts Collection (Agent Earnings)
```typescript
{
  $id: string;
  agentId: string; // Relationship to agents
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  bookingIds: string[]; // Array of booking IDs in this payout
  payoutMethod: string; // 'bank_transfer', 'paypal'
  scheduledDate: string;
  completedDate?: string;
  createdAt: string;
}
```

### Attribute Permissions
- Bookings: Create (any logged in user), Read (guest or agent only), Update (limited fields), Delete (none)
- Payments: Create (booking guest only), Read (booking guest or agent only), Update (system only), Delete (none)
- Payouts: Create (system only), Read (agent only), Update (system only), Delete (none)

---

## Implementation Plan

### Phase 1: Core Booking System (Week 1-2)
1. **Database Setup**
   - Create collections: bookings, payments, payouts
   - Set up relationships and permissions
   - Create indexes for common queries

2. **Booking Request Flow**
   - Property detail page: Add "Book Now" button
   - Create booking form with date picker
   - Implement date validation and availability check
   - Submit booking request API
   - Create `app/(root)/(tabs)/bookings.tsx` page

3. **Basic Booking Views**
   - User: My Bookings list
   - Agent: Booking Requests list
   - Booking detail page
   - Status badges and filtering

### Phase 2: Agent Management (Week 3)
1. **Request Management**
   - Accept/Reject booking functionality
   - Reason for rejection form
   - Conflict detection for overlapping bookings
   - Notifications for status changes

2. **Agent Dashboard**
   - Booking requests with pending badge
   - Calendar view of all bookings
   - Quick accept/reject actions

### Phase 3: Payment Integration (Week 4-5)
1. **Payment Gateway Setup**
   - Integrate Stripe SDK
   - Create payment processing functions
   - Set up webhook handlers for payment events

2. **Payment Flow**
   - Payment form component
   - Process payment function
   - Handle success/failure states
   - Update booking status after payment
   - Generate and send receipts

3. **Payment History**
   - List all payments
   - Download receipts (PDF generation)
   - Refund handling

### Phase 4: Cancellation & Refunds (Week 6)
1. **Cancellation Logic**
   - Implement cancellation policy rules
   - Calculate refund amounts
   - Process refunds through payment gateway
   - Update booking status
   - Free up dates

2. **Notifications**
   - Cancellation confirmations
   - Refund notifications

### Phase 5: Earnings & Payouts (Week 7)
1. **Earnings Dashboard**
   - Calculate agent earnings per booking
   - Aggregate earnings data
   - Create earnings widgets
   - Transaction history

2. **Payout System**
   - Automated payout calculations
   - Payout scheduling
   - Export reports functionality

### Phase 6: Notifications & Polish (Week 8)
1. **Notification System**
   - In-app notifications
   - Email templates
   - Push notifications
   - Reminder system

2. **Testing & Refinement**
   - Edge case testing
   - Payment testing (Stripe test mode)
   - UI/UX polish
   - Performance optimization

---

## Workflows

### Complete Booking Workflow
```
1. Guest browses property → Views details
2. Guest clicks "Book Now" → Opens booking form
3. Guest selects dates → System validates availability
4. Guest submits request → Booking created (status: pending)
5. Agent receives notification → Reviews request
6. Agent accepts → Booking status: confirmed, Guest notified
7. Guest receives confirmation → "Pay Now" button appears
8. Guest completes payment → Payment processed
9. Payment succeeds → Booking status: paid
10. Both parties receive confirmation
11. Check-in date arrives → Booking status: completed
```

### Payment Workflow
```
User → Tap "Pay Now" → Load payment form → Enter card details
→ Submit to Stripe → Stripe processes → Return result
→ Success: Update booking, send confirmations, generate receipt
→ Failure: Show error, allow retry
```

### Cancellation Workflow
```
User → Tap "Cancel" → Show policy & refund amount → Confirm
→ Update booking status → Calculate refund (if applicable)
→ Process refund through Stripe → Update payment record
→ Send notifications → Free up dates
```

### Agent Earnings Workflow
```
Booking completed → Calculate earnings (85% of total)
→ Add to pending payouts → Wait for payout schedule (weekly)
→ If balance >= $50 → Process payout → Mark as completed
→ Agent receives payment → Transaction recorded
```

---

## Dependencies

### Story Dependencies
```
1. Request Booking (Foundation)
   ↓
2. Select Dates (Part of request)
   ↓
3. Agent Views Requests
   ↓
4. Agent Accept/Reject
   ↓
5. Make Payment (Requires confirmation)
   ↓
6. Booking Confirmations (After payment)
   ↓
7. View Bookings (Can be parallel)
8. Cancel Bookings (Can be parallel)
9. Payment History (After payments exist)
10. Agent Earnings (After payments complete)
```

### Technical Dependencies
- Appwrite SDK (already installed)
- Stripe React Native SDK: `expo install @stripe/stripe-react-native`
- Date picker: `expo install expo-calendar` or `react-native-calendars`
- PDF generation: `expo install expo-print expo-sharing`
- Push notifications: `expo install expo-notifications`

---

## Risks & Mitigations

### High-Priority Risks

1. **Payment Security**
   - Risk: Handling sensitive payment data
   - Mitigation: Use Stripe SDK, never store card details, implement 3D Secure

2. **Double Booking**
   - Risk: Two users book same dates simultaneously
   - Mitigation: Database-level uniqueness constraints, transaction locks, availability validation

3. **Refund Disputes**
   - Risk: Users disputing refund amounts
   - Mitigation: Clear cancellation policy, confirmation dialogs, email receipts

4. **Payment Gateway Downtime**
   - Risk: Cannot process payments during outages
   - Mitigation: Graceful error handling, retry mechanism, status persistence

### Medium-Priority Risks

5. **Notification Delivery Failure**
   - Risk: Users miss important booking updates
   - Mitigation: Multiple channels (in-app, email, SMS), retry logic

6. **Timezone Handling**
   - Risk: Confusion with check-in times across timezones
   - Mitigation: Store all dates in UTC, display in local timezone, show timezone in confirmations

7. **Currency Conversion**
   - Risk: International bookings with different currencies
   - Mitigation: Support multi-currency, use real-time exchange rates, clearly show currency

---

## Assumptions

1. Properties are available for short-term rentals (not sales)
2. Pricing is per night (not per month/week)
3. Platform takes 15% commission from agents
4. Minimum booking is 1 night, maximum is 90 nights
5. Users must be logged in to book
6. Payment is required before check-in (not pay on arrival)
7. Cancellation policy is standardized across all properties
8. Agents respond to booking requests within 24 hours
9. Payouts are weekly with minimum $50 threshold
10. Service fee (10%) is paid by guest, platform fee (15%) is paid by agent

---

## Open Questions

1. **Payment Gateway**: Stripe only or support multiple gateways?
2. **Instant Booking**: Should some properties allow instant booking without agent approval?
3. **Partial Payments**: Support deposits or payment plans?
4. **Guest Verification**: Require ID verification before booking?
5. **Property Calendar**: Should agents manually block dates for maintenance?
6. **Insurance**: Include booking insurance option?
7. **Reviews**: Allow reviews only after completed bookings?
8. **Booking Modifications**: Can users modify dates after booking?
9. **Multiple Properties**: Can users book multiple properties in one transaction?
10. **Guest Limits**: Enforce maximum guest count per property?

---

## Success Metrics

- **Booking Conversion**: % of property views that result in booking requests
- **Approval Rate**: % of booking requests accepted by agents
- **Payment Success Rate**: % of confirmed bookings that complete payment
- **Cancellation Rate**: % of bookings cancelled before check-in
- **Average Booking Value**: Mean total price per booking
- **Agent Response Time**: Average time for agents to respond to requests
- **Payment Processing Time**: Average time to complete payment
- **Refund Processing Time**: Average time to process refunds

---

## Technical Stack Summary

- **Frontend**: React Native + Expo
- **Backend**: Appwrite (Database, Storage, Auth)
- **Payment**: Stripe
- **Notifications**: Expo Notifications + Email service
- **PDF Generation**: expo-print
- **Date Handling**: date-fns or day.js
- **Calendar UI**: react-native-calendars

---

*Document Version: 1.0*  
*Last Updated: 2025-11-30*  
*Ready for Implementation*
