import { redirect } from "next/navigation";
import { auth } from "@/src/auth";
import SignUpForm from "./signup-form";

export default async function SignUpPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-card-border bg-card p-8 shadow-sm sm:p-10">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight">Create your account</h1>
            <p className="mt-2 text-sm text-muted">
              Start creating polls and sharing them with anyone
            </p>
          </div>
          <div className="mt-8">
            <SignUpForm />
          </div>
        </div>
      </div>
    </div>
  );
}
