import { adminDb } from '@/lib/firebase-admin';

export async function sendBookingNotification(bookingDetails: any, type: 'direct' | 'payment_captured') {
  try {
    if (!adminDb) return;
    
    const doc = await adminDb.collection('settings').doc('platform').get();
    
    // Get the customer phone number
    let toNumber = "";
    if (bookingDetails.phone || bookingDetails.contact) {
      toNumber = bookingDetails.phone || bookingDetails.contact;
    } else {
      console.log('Customer phone number is missing. Cannot send WhatsApp message.');
      return;
    }

    // WhatsApp expects number without '+' and non-digit characters
    toNumber = toNumber.replace(/\D/g, '');
    
    const bookingId = bookingDetails.id || bookingDetails.bookingId || bookingDetails.orderId || "Pending";
    const tripDate = bookingDetails.date || "your scheduled date";

    const message = `Thank you for choosing Quick Trip Now your booking Id is ${bookingId}, your trip date is ${tripDate} our team will connect you within 24 hours`;

    const whastappToken = process.env.WHATSAPP_ACCESS_TOKEN || "EAAhK3sNV3LUBSZAXXMiLNLHIrIAnh0pLFXUkFyZBDgzS6yXGlxwYkRNUAUytOSVfnSUdGxifF4GajhVpZBDSZAZAupLI6o8V286GteMnYVgU8iyF5Bf3ZCTGcfZCr3MMZA5NXC9xqSrTNwJZBy82iWMXwOq6CzIdQvxJ1yK6aWUGfrXfj019wV848FzaR2ZBaHrwZDZD";
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "1257696557433340";

    const response = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whastappToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: toNumber,
        type: "text",
        text: {
          preview_url: false,
          body: message
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('WhatsApp API Error:', data);
    } else {
      console.log('WhatsApp notification sent successfully:', data);
    }

  } catch (error) {
    console.error('Error sending WhatsApp booking notification:', error);
  }
}
