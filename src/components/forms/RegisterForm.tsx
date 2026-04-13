"use client";

import { registerUser } from "@/app/actions/authActions";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(registerUser, null);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error, {
        description: state.details,
      });
    } else if (state?.success) {
      toast.success(state.success);
      router.push("/login");
    }
  }, [state, router]);

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center gap-5 py-8 px-6">
          <div className="text-4xl">🎣</div>
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-n-text">Створити акаунт</h1>
            <p className="text-sm text-n-muted">Приєднуйтесь до Fishing Space сьогодні.</p>
          </div>

          <form className="w-full space-y-3" action={formAction}>
            <Input name="name" label="Повне ім'я" placeholder="Ваше ім'я" required />
            <Input name="email" label="Електронна пошта" type="email" placeholder="name@example.com" required />
            <Input name="password" label="Пароль" type="password" placeholder="••••••••" required />
            <Button variant="primary" className="w-full" type="submit" disabled={isPending}>
              {isPending ? "Створення акаунта..." : "Зареєструватися"}
            </Button>
          </form>

          <p className="text-xs text-n-muted">
            Вже маєте акаунт?{" "}
            <Link href="/login" className="text-n-accent font-medium hover:underline">
              Увійти
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
