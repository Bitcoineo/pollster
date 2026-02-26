import { redirect } from "next/navigation";
import { auth } from "@/src/auth";
import SignInForm from "./signin-form";

export default async function SignInPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-card-border bg-card p-8 shadow-sm sm:p-10">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm text-muted">
              Sign in to manage your polls
            </p>
          </div>
          <div className="mt-8">
            <SignInForm />
          </div>
        </div>
      </div>
    </div>
  );
}
