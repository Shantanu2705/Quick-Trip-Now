import { adminDb } from '@/lib/firebase-admin';

export async function sendBookingNotification(bookingDetails: any, type: 'direct' | 'payment_captured') {
  try {
    if (!adminDb) return;
    
    const doc = await adminDb.collection('settings').doc('platform').get();
    if (!doc.exists) return;
    
    const settings = doc.data();
    if (!settings?.enableBookingNotifications || !settings?.adminNotificationPhone) {
      console.log('Booking notifications are disabled or phone number is missing.');
      return;
    }

    const toNumber = settings.adminNotificationPhone;
    
    let message = `New Booking Alert! 🚀\n`;
    if (type === 'direct') {
       message += `A new booking has been confirmed.\n`;
       if (bookingDetails.id || bookingDetails.bookingId) {
         message += `Booking ID: ${bookingDetails.id || bookingDetails.bookingId}\n`;
       }
    } else {
       message += `A new order payment was successful.\nOrder ID: ${bookingDetails.orderId}\n`;
    }
    
    if (bookingDetails.amount) {
       message += `Amount: ₹${bookingDetails.amount}\n`;
    }

    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_FROM_NUMBER;

    if (!twilioSid || !twilioToken || !twilioFrom) {
      console.warn('Twilio credentials missing. Cannot send notification. Please configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER in your .env file.');
      return;
    }

    const isWhatsApp = twilioFrom.startsWith('whatsapp:');
    const to = isWhatsApp && !toNumber.startsWith('whatsapp:') ? `whatsapp:${toNumber}` : toNumber;

    const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
    const body = new URLSearchParams({
      To: to,
      From: twilioFrom,
      Body: message
    });

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Twilio Error:', data);
    } else {
      console.log('Notification sent successfully:', data.sid);
    }

  } catch (error) {
    console.error('Error sending booking notification:', error);
  }
}
