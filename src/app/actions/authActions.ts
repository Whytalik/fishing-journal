"use server";

import prisma from "@/db/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { signOut } from "@/auth";

const registerSchema = z.object({
  name: z.string().min(2, "Ім'я повинно містити принаймні 2 символи"),
  email: z.string().email("Невірна адреса електронної пошти"),
  password: z.string().min(6, "Пароль повинен містити принаймні 6 символів"),
});

export async function registerUser(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validated = registerSchema.safeParse({ name, email, password });

  if (!validated.success) {
    const errorDetails = validated.error.issues.map(e => e.message).join(". ");
    return { error: "Помилка валідації", details: errorDetails };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Користувач вже існує", details: "Користувач з цією поштою вже зареєстрований у системі." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    
    return { success: "Реєстрація успішна! Тепер ви можете увійти." };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { error: "Не вдалося зареєструвати користувача", details: error.message || "Сталася неочікувана помилка бази даних." };
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
