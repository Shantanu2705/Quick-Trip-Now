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
    
    const customerName = bookingDetails.name || "Customer";
    const bookingId = bookingDetails.id || bookingDetails.bookingId || bookingDetails.orderId || "Pending";
    const packageName = bookingDetails.package || bookingDetails.packageName || "Quick Trip Now Package";
    const tripDate = bookingDetails.date || "your scheduled date";
    
    // Amount Paid calculation
    const paidAmount = Number(bookingDetails.amount) || 0;
    const totalAmount = Number(bookingDetails.totalAmount) || paidAmount;
    
    let amountString = `${paidAmount}`;
    if (paidAmount < totalAmount && totalAmount > 0) {
        amountString = `${paidAmount} (Part payment out of full payment ₹${totalAmount})`;
    } else if (paidAmount > 0) {
        amountString = `${paidAmount} (Full payment)`;
    }

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
        type: "template",
        template: {
          name: "booking_confirmation",
          language: {
            code: "en"
          },
          components: [
            {
              type: "header",
              parameters: [
                {
                  type: "image",
                  image: {
                    link: "https://www.quicktripnow.com/images/logo_transparent.png"
                  }
                }
              ]
            },
            {
              type: "body",
              parameters: [
                { type: "text", text: String(customerName) },
                { type: "text", text: String(bookingId) },
                { type: "text", text: String(packageName) },
                { type: "text", text: String(tripDate) },
                { type: "text", text: String(amountString) }
              ]
            }
          ]
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('WhatsApp API Error:', data);
    } else {
      console.log('WhatsApp notification sent successfully:', data);
    }

    // Send admin notification
    const adminNumber = "917407373697";
    const adminResponse = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${whastappToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: adminNumber,
        type: "text",
        text: {
          preview_url: false,
          body: `A booking with the booking id ${bookingId} has been done from Quick Trip Now please check it`
        }
      })
    });
    
    const adminData = await adminResponse.json();
    if (!adminResponse.ok) {
      console.error('WhatsApp Admin API Error:', adminData);
    } else {
      console.log('WhatsApp admin notification sent successfully:', adminData);
    }

  } catch (error) {
    console.error('Error sending WhatsApp booking notification:', error);
  }
}
