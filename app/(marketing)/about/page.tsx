import Image from "next/image";
import { Users, Target, Shield, Map } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-background min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-8">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Quick Trip Now</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            We are passionate about creating unforgettable travel experiences. Our mission is to connect you with the world's most breathtaking destinations while ensuring seamless, secure, and personalized journeys.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          <div className="bg-muted/30 p-8 rounded-3xl border border-border/50 text-center hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
              <Map className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">Curated Destinations</h3>
            <p className="text-muted-foreground text-sm">We handpick every location to ensure you get the best experience possible.</p>
          </div>
          <div className="bg-muted/30 p-8 rounded-3xl border border-border/50 text-center hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
              <Shield className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">Secure Travel</h3>
            <p className="text-muted-foreground text-sm">Your safety is our top priority. We partner with verified local guides and services.</p>
          </div>
          <div className="bg-muted/30 p-8 rounded-3xl border border-border/50 text-center hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
              <Target className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">Personalized Trips</h3>
            <p className="text-muted-foreground text-sm">Every traveler is unique, and so are our custom-tailored itineraries.</p>
          </div>
          <div className="bg-muted/30 p-8 rounded-3xl border border-border/50 text-center hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">24/7 Support</h3>
            <p className="text-muted-foreground text-sm">Our dedicated team is always available to assist you throughout your journey.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
