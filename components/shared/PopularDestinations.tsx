"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const DESTINATIONS = [
  {
    id: 1,
    title: "Gurudongmar Lake",
    subtitle: "North Sikkim",
    image: "/images/sikkim_dest_1.png",
    link: "/destinations/north-sikkim"
  },
  {
    id: 2,
    title: "Yumthang Valley",
    subtitle: "North Sikkim",
    image: "/images/sikkim_dest_2.png",
    link: "/destinations/yumthang"
  },
  {
    id: 3,
    title: "Gangtok",
    subtitle: "East Sikkim",
    image: "/images/sikkim_dest_3.png",
    link: "/destinations/gangtok"
  },
  {
    id: 4,
    title: "Nathula Pass",
    subtitle: "East Sikkim",
    image: "/images/sikkim_tour_1.png",
    link: "/destinations/nathula"
  }
];

export function PopularDestinations() {
  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block"
            >
              Explore the unknown
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-heading font-bold text-foreground"
            >
              Popular Destinations
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/destinations" className="flex items-center gap-2 text-primary font-medium hover:text-primary/80 transition-colors group">
              View all destinations
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DESTINATIONS.map((dest, index) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Link href={dest.link} className="block group relative h-[400px] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                <Image
                  src={dest.image}
                  alt={dest.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <h3 className="text-2xl font-heading font-bold text-white mb-1 group-hover:-translate-y-1 transition-transform duration-300">{dest.title}</h3>
                  <p className="text-white/80 text-sm font-medium opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-300 delay-75">
                    {dest.subtitle}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
