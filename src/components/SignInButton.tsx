"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SignInButton() {
  const pathname = usePathname();
  if (pathname.startsWith("/poll/")) return null;

  return (
    <Link
      href="/auth/signin"
      className="rounded-full bg-primary px-5 py-1.5 text-sm font-medium text-primary-fg hover:bg-primary-hover active:scale-95 transition-all duration-200"
    >
      Sign in
    </Link>
  );
}
