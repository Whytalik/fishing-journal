import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { AuthError } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const session = await auth();
  if (session) {
    redirect("/");
  }

  const { message } = await searchParams;

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center gap-5 py-8 px-6">
          <div className="text-4xl">🎣</div>
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-n-text">Fishing Space</h1>
            <p className="text-sm text-n-muted">Увійдіть у свій акаунт.</p>
          </div>

          {message && (
            <div className="w-full bg-green-50/10 text-green-500 px-3 py-2 rounded text-xs font-medium border border-green-500/20">
              {message}
            </div>
          )}

          <form
            className="w-full space-y-3"
            action={async (formData) => {
              "use server";
              try {
                await signIn("credentials", { ...Object.fromEntries(formData), redirectTo: "/" });
              } catch (error) {
                if (error instanceof AuthError) {
                  // If it's a redirect error, re-throw it so Next.js can handle it
                  if (error.type === "CredentialsSignin") {
                    redirect("/login?error=Invalid credentials");
                  }
                  throw error;
                }
                throw error;
              }
            }}
          >
            <Input name="email" label="Електронна пошта" placeholder="name@example.com" required />
            <Input name="password" label="Пароль" type="password" placeholder="••••••••" required />
            <Button variant="primary" className="w-full" type="submit">
              Увійти
            </Button>
          </form>

          <p className="text-xs text-n-muted">
            Немає акаунта?{" "}
            <Link href="/register" className="text-n-accent font-medium hover:underline">
              Створіть його
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
