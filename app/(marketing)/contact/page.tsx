import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/shared/ContactForm";
import { getGlobalSettings } from "@/lib/settings-server";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getGlobalSettings();
  const phone = settings?.contactPhone || "+91 98765 43210";
  const email = settings?.contactEmail || "support@quicktripnow.com";

  return (
    <div className="bg-background min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Touch</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Have a question about our tours or need help with a booking? Our team is always here to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-4 rounded-2xl text-primary shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Our Office</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  123 Travel Boulevard,<br />
                  MG Marg, Gangtok,<br />
                  Sikkim 737101, India
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-4 rounded-2xl text-primary shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Phone</h3>
                <p className="text-muted-foreground text-sm">
                  {phone}<br />
                  Mon-Fri, 9am to 6pm
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-4 rounded-2xl text-primary shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Email</h3>
                <p className="text-muted-foreground text-sm">
                  {email}<br />
                  We reply within 24 hours
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
