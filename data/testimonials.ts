export interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  text: string;
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Rafiqul Islam",
    role: "Owner",
    company: "Dhaka Electronics Bazaar",
    avatar: "https://picsum.photos/seed/rafiq/100/100",
    rating: 5,
    text: "Import China transformed my retail business. I now source directly from verified factories and my margins doubled. Delivery to Dhaka was faster than I expected!",
  },
  {
    id: 2,
    name: "Sharmin Akter",
    role: "Founder",
    company: "Trendy Fashion BD",
    avatar: "https://picsum.photos/seed/sharmin/100/100",
    rating: 5,
    text: "The MOQ flexibility and quality checks are fantastic. I imported 3 containers of clothing and every piece matched the samples. Highly recommend for any reseller.",
  },
  {
    id: 3,
    name: "Tanvir Hossain",
    role: "Procurement Manager",
    company: "GreenHome Living",
    avatar: "https://picsum.photos/seed/tanvir/100/100",
    rating: 5,
    text: "Their sourcing team handled customs and shipping end-to-end. Transparent pricing in BDT, no hidden costs. This is the easiest way to import from China to Bangladesh.",
  },
];
