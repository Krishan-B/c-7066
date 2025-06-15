interface TestimonialCardProps {
    quote: string;
    author: string;
    role: string;
    rating: number;
    delay?: number;
}
declare const TestimonialCard: ({ quote, author, role, rating, delay }: TestimonialCardProps) => import("react/jsx-runtime").JSX.Element;
export default TestimonialCard;
