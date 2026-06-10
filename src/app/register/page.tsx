"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User, Mail, Lock, Building2, Briefcase } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NexusLogo } from "@/components/layout/logo";
import { useAuthStore } from "@/stores/auth-store";
import { ROUTES } from "@/lib/routes";
import { sleep, generateId } from "@/lib/utils";
import { resetWorkspace } from "@/lib/reset";

const schema = z
  .object({
    name: z.string().min(2, "Ingresá tu nombre"),
    email: z.string().email("Email inválido"),
    company: z.string().min(2, "Ingresá tu empresa"),
    role: z.string().min(2, "Ingresá tu cargo"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setLoading(true);
    await sleep(1000);
    resetWorkspace();
    login({ id: `user-${generateId()}`, name: data.name, email: data.email, company: data.company, role: data.role, createdAt: new Date().toISOString() });
    router.push(ROUTES.ONBOARDING);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative"
      >
        <div className="flex justify-center mb-8">
          <Link href={isAuthenticated ? ROUTES.WORKSPACE : ROUTES.HOME}>
            <NexusLogo size="md" />
          </Link>
        </div>

        <div className="bg-surface-elevated border border-border rounded-xl p-8">
          <h1 className="text-xl font-semibold text-text-primary mb-1">Creá tu cuenta</h1>
          <p className="text-sm text-text-muted mb-6">Empezá a usar tu cerebro comercial</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Nombre completo" leftIcon={<User className="h-4 w-4" />} error={errors.name?.message} {...register("name")} />
            <Input label="Email" type="email" leftIcon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register("email")} />
            <Input label="Empresa" leftIcon={<Building2 className="h-4 w-4" />} error={errors.company?.message} {...register("company")} />
            <Input label="Cargo" leftIcon={<Briefcase className="h-4 w-4" />} error={errors.role?.message} {...register("role")} />
            <Input
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              rightElement={
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-text-muted hover:text-text-secondary">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              {...register("password")}
            />
            <Input
              label="Confirmar contraseña"
              type={showPassword ? "text" : "password"}
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <Button type="submit" variant="primary" className="w-full mt-2" loading={loading}>
              Crear cuenta
            </Button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            ¿Ya tenés cuenta?{" "}
            <Link href={ROUTES.LOGIN} className="text-primary-soft hover:text-primary transition-colors font-medium">
              Ingresá
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
