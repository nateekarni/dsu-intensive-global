import { redirect } from "next/navigation";

export default function Home() {
  // สั่งให้เด้งไปหน้า /student/feed ทันที
  redirect("/student/feed");
}