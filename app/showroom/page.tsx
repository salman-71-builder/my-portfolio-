import type { Metadata } from "next";
import { ShowroomExperience } from "@/components/showroom/showroom-experience";

export const metadata: Metadata = {
  title: "3D Virtual Showroom",
  description:
    "Walk through ChinaCart's 3D virtual store — explore Electronics, Furniture, Fashion and Gadgets rooms and click any product to view details.",
};

export default function ShowroomPage() {
  return <ShowroomExperience />;
}
