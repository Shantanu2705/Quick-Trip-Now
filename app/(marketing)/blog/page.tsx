import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, User } from "lucide-react";

const BLOG_POSTS = [
  {
    id: 1,
    title: "10 Must-Visit Places in North Sikkim",
    excerpt: "Discover the hidden gems of North Sikkim, from frozen lakes to high-altitude valleys that will leave you breathless.",
    image: "/images/blog_north_sikkim.png",
    author: "Rahul Sharma",
    date: "Oct 15, 2023",
  },
  {
    id: 2,
    title: "A Culinary Journey Through Gangtok",
    excerpt: "Explore the vibrant food scene in the capital of Sikkim. From authentic momos to traditional thukpa.",
    image: "/images/blog_gangtok_food.png",
    author: "Priya Das",
    date: "Sep 22, 2023",
  },
  {
    id: 3,
    title: "Best Time to Visit Yumthang Valley",
    excerpt: "Planning a trip to the Valley of Flowers? Here's everything you need to know about the best seasons to visit.",
    image: "/images/blog_yumthang_season.png",
    author: "Amit Patel",
    date: "Aug 05, 2023",
  }
];

export default function BlogPage() {
  return (
    <div className="bg-background min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-3xl mb-16">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6">
            Travel <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Stories & Guides</span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Get inspired for your next adventure with our collection of travel tips, destination guides, and personal stories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post) => (
            <article key={post.id} className="bg-muted/20 rounded-3xl overflow-hidden border border-border/50 hover:shadow-lg transition-all duration-300 group">
              <div className="relative h-64 overflow-hidden">
                <Image 
                  src={post.image} 
                  alt={post.title} 
                  fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {post.date}</span>
                  <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {post.author}</span>
                </div>
                <h3 className="text-xl font-bold font-heading mb-3 line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-6">{post.excerpt}</p>
                <Link href={`/blog/${post.id}`} className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                  Read More <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
