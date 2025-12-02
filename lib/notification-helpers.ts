/**
 * Notification Helpers
 * Utility functions to create notifications for various events
 */

import { createNotification } from '@/lib/appwrite';

/**
 * Send notification when a new message is received
 */
export async function notifyNewMessage(data: {
  receiverId: string;
  senderName: string;
  messagePreview: string;
  conversationId: string;
}) {
  await createNotification({
    userId: data.receiverId,
    type: 'message',
    category: 'messages',
    priority: 'normal',
    title: `New message from ${data.senderName}`,
    message: data.messagePreview,
    actionUrl: `/chat/${data.conversationId}`,
    data: { conversationId: data.conversationId },
  });
}

/**
 * Send notification when a booking request is received
 */
export async function notifyBookingRequest(data: {
  agentId: string;
  guestName: string;
  propertyName: string;
  bookingId: string;
  checkInDate: string;
  checkOutDate: string;
}) {
  await createNotification({
    userId: data.agentId,
    type: 'booking_request',
    category: 'bookings',
    priority: 'high',
    title: 'New Booking Request',
    message: `${data.guestName} wants to book ${data.propertyName}`,
    actionUrl: `/booking/${data.bookingId}`,
    data: {
      bookingId: data.bookingId,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
    },
  });
}

/**
 * Send notification when a booking is confirmed
 */
export async function notifyBookingConfirmed(data: {
  guestId: string;
  propertyName: string;
  bookingId: string;
  checkInDate: string;
  totalPrice: number;
}) {
  await createNotification({
    userId: data.guestId,
    type: 'booking_confirmed',
    category: 'bookings',
    priority: 'high',
    title: 'Booking Confirmed! 🎉',
    message: `Your booking for ${data.propertyName} has been confirmed`,
    actionUrl: `/booking/${data.bookingId}`,
    data: {
      bookingId: data.bookingId,
      checkInDate: data.checkInDate,
      totalPrice: data.totalPrice,
    },
  });
}

/**
 * Send notification when a booking is rejected
 */
export async function notifyBookingRejected(data: {
  guestId: string;
  propertyName: string;
  bookingId: string;
  reason?: string;
}) {
  await createNotification({
    userId: data.guestId,
    type: 'booking_rejected',
    category: 'bookings',
    priority: 'normal',
    title: 'Booking Request Declined',
    message: data.reason
      ? `Your request for ${data.propertyName} was declined: ${data.reason}`
      : `Your request for ${data.propertyName} was declined`,
    actionUrl: `/booking/${data.bookingId}`,
    data: {
      bookingId: data.bookingId,
      reason: data.reason,
    },
  });
}

/**
 * Send notification when a booking is cancelled
 */
export async function notifyBookingCancelled(data: {
  userId: string;
  propertyName: string;
  bookingId: string;
  cancelledBy: 'guest' | 'agent';
}) {
  const title = data.cancelledBy === 'guest' ? 'Booking Cancelled' : 'Booking Cancelled by Host';
  const message = `Your booking for ${data.propertyName} has been cancelled`;

  await createNotification({
    userId: data.userId,
    type: 'booking_cancelled',
    category: 'bookings',
    priority: 'high',
    title,
    message,
    actionUrl: `/booking/${data.bookingId}`,
    data: {
      bookingId: data.bookingId,
      cancelledBy: data.cancelledBy,
    },
  });
}

/**
 * Send notification when payment is received
 */
export async function notifyPaymentReceived(data: {
  agentId: string;
  guestName: string;
  amount: number;
  currency: string;
  bookingId: string;
  propertyName: string;
}) {
  await createNotification({
    userId: data.agentId,
    type: 'payment_received',
    category: 'payments',
    priority: 'high',
    title: 'Payment Received 💰',
    message: `${data.guestName} paid ${data.currency} ${data.amount} for ${data.propertyName}`,
    actionUrl: `/booking/${data.bookingId}`,
    data: {
      bookingId: data.bookingId,
      amount: data.amount,
      currency: data.currency,
    },
  });
}

/**
 * Send notification when payment is refunded
 */
export async function notifyPaymentRefunded(data: {
  guestId: string;
  amount: number;
  currency: string;
  bookingId: string;
  reason?: string;
}) {
  await createNotification({
    userId: data.guestId,
    type: 'payment_refunded',
    category: 'payments',
    priority: 'normal',
    title: 'Refund Processed',
    message: data.reason
      ? `Your refund of ${data.currency} ${data.amount} has been processed: ${data.reason}`
      : `Your refund of ${data.currency} ${data.amount} has been processed`,
    actionUrl: `/booking/${data.bookingId}`,
    data: {
      bookingId: data.bookingId,
      amount: data.amount,
      currency: data.currency,
      reason: data.reason,
    },
  });
}

/**
 * Send notification when payout is completed
 */
export async function notifyPayoutCompleted(data: {
  agentId: string;
  amount: number;
  currency: string;
  payoutId: string;
  bookingIds: string[];
}) {
  await createNotification({
    userId: data.agentId,
    type: 'payout_completed',
    category: 'payments',
    priority: 'high',
    title: 'Payout Completed ✅',
    message: `Your payout of ${data.currency} ${data.amount} has been processed`,
    actionUrl: `/payouts/${data.payoutId}`,
    data: {
      payoutId: data.payoutId,
      amount: data.amount,
      currency: data.currency,
      bookingIds: data.bookingIds,
    },
  });
}

/**
 * Send notification when a new review is received
 */
export async function notifyNewReview(data: {
  agentId: string;
  guestName: string;
  propertyName: string;
  rating: number;
  reviewId: string;
  propertyId: string;
}) {
  const stars = '⭐'.repeat(Math.round(data.rating));

  await createNotification({
    userId: data.agentId,
    type: 'review_received',
    category: 'reviews',
    priority: 'normal',
    title: 'New Review',
    message: `${data.guestName} left a ${data.rating} ${stars} review for ${data.propertyName}`,
    actionUrl: `/properties/${data.propertyId}`,
    data: {
      reviewId: data.reviewId,
      propertyId: data.propertyId,
      rating: data.rating,
    },
  });
}

/**
 * Send notification when someone favorites your property
 */
export async function notifyPropertyFavorited(data: {
  agentId: string;
  userName: string;
  propertyName: string;
  propertyId: string;
}) {
  await createNotification({
    userId: data.agentId,
    type: 'property_favorite',
    category: 'system',
    priority: 'low',
    title: 'Property Favorited ❤️',
    message: `${data.userName} added ${data.propertyName} to favorites`,
    actionUrl: `/properties/${data.propertyId}`,
    data: {
      propertyId: data.propertyId,
    },
  });
}

/**
 * Send system notification
 */
export async function notifySystem(data: {
  userId: string;
  title: string;
  message: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  actionUrl?: string;
  additionalData?: Record<string, any>;
}) {
  await createNotification({
    userId: data.userId,
    type: 'system',
    category: 'system',
    priority: data.priority || 'normal',
    title: data.title,
    message: data.message,
    actionUrl: data.actionUrl,
    data: data.additionalData,
  });
}
