import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { auth, signOut } from "@/src/auth";
import ThemeToggle from "@/src/components/ThemeToggle";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Pollster",
    template: "%s | Pollster",
  },
  description: "Create polls, share them, get instant results.",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  icons: {
    icon: { url: "/favicon.svg", type: "image/svg+xml" },
  },
  openGraph: {
    title: "Pollster",
    description: "Create polls, share them, get instant results.",
    siteName: "Pollster",
    type: "website",
  },
};

const themeScript = `
  (function() {
    var t = localStorage.getItem('theme');
    if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  })();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <header className="border-b border-divider">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] bg-clip-text text-transparent"
            >
              Pollster
            </Link>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              {session?.user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium text-muted hover:text-foreground transition-colors"
                  >
                    {session.user.name || session.user.email}
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await signOut({ redirectTo: "/" });
                    }}
                  >
                    <button
                      type="submit"
                      className="rounded-full px-4 py-1.5 text-sm font-medium text-muted hover:bg-card hover:text-foreground active:scale-95 transition-all duration-200"
                    >
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="rounded-full bg-primary px-5 py-1.5 text-sm font-medium text-primary-fg hover:bg-primary-hover active:scale-95 transition-all duration-200"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </header>

        <main className="animate-fade-in-up">{children}</main>
      </body>
    </html>
  );
}
