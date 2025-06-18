import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  rating: number;
  delay?: number;
}

const TestimonialCard = ({ quote, author, role, rating, delay = 0 }: TestimonialCardProps) => {
  return (
    <motion.div
      className="hover-card glass-effect rounded-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
    >
      <div className="mb-4 flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
          />
        ))}
      </div>
      <blockquote className="mb-4">
        <p className="italic">{`"${quote}"`}</p>
      </blockquote>
      <div>
        <p className="font-medium">{author}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;
