export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  rating: number;
  comment: string;
  avatar: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "t-1",
    name: "Rafiqul Islam",
    role: "Owner, Dhaka Electronics Bazar",
    location: "Dhaka",
    rating: 5,
    comment:
      "Import China changed how I run my business. I now source gadgets directly from Shenzhen at 50% lower cost, and delivery to Dhaka is always on time. The supplier verification gives me real peace of mind.",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: "t-2",
    name: "Nusrat Jahan",
    role: "Founder, Trendy Boutique",
    location: "Chattogram",
    rating: 5,
    comment:
      "As a fashion retailer, finding reliable wholesale clothing was always a struggle. With Import China I get fresh designs every week, low MOQs, and the quotes are super transparent. Highly recommended!",
    avatar: "https://i.pravatar.cc/150?img=45",
  },
  {
    id: "t-3",
    name: "Tanvir Ahmed",
    role: "Procurement Manager, BuildPro Ltd",
    location: "Sylhet",
    rating: 5,
    comment:
      "We order tools and hardware in bulk every month. The platform makes it effortless — request a quote, confirm, and they handle the entire China-to-Bangladesh logistics. Customer support is 24/7 and genuinely helpful.",
    avatar: "https://i.pravatar.cc/150?img=33",
  },
];
