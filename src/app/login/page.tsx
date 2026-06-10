"use client";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ChevronDown, ChevronUp } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { NexusLogo } from "@/components/layout/logo";
import { useAuthStore } from "@/stores/auth-store";
import { MOCK_USER, MOCK_PASSWORD, DEMO_ACCOUNTS, DEMO_PASSWORD, MODULE_LABELS } from "@/data/mock-user";
import { ROUTES } from "@/lib/routes";
import { sleep } from "@/lib/utils";
import { decodeGoogleCredential, isVerifiedGoogleCredential, resolveGoogleSessionUser } from "@/lib/google-auth";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});
type FormData = z.infer<typeof schema>;

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Manager",
  analyst: "Analyst",
  viewer: "Viewer",
};

const ROLE_COLORS: Record<string, string> = {
  owner: "text-primary-soft bg-primary/10 border-primary/25",
  admin: "text-info bg-info/10 border-info/25",
  manager: "text-accent bg-accent/10 border-accent/25",
  analyst: "text-success bg-success/10 border-success/25",
  viewer: "text-text-muted bg-surface-soft border-border",
};

export default function LoginPage() {
  const router = useRouter();
  const { login, isOnboarded, isAuthenticated } = useAuthStore();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleMessage, setGoogleMessage] = useState("");
  const [error, setError] = useState("");
  const canUseGoogleSdk = Boolean(googleClientId && googleReady && !googleMessage);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!googleButtonRef.current || !canUseGoogleSdk || !window.google?.accounts?.id || !googleClientId) {
      return;
    }

    const googleAccounts = window.google.accounts.id;

    googleAccounts.initialize({
      client_id: googleClientId,
      callback: async (response) => {
        setGoogleLoading(true);
        setError("");

        try {
          const payload = decodeGoogleCredential(response.credential);

          if (!isVerifiedGoogleCredential(payload)) {
            setError("No se pudo verificar la respuesta de Google. Probá de nuevo.");
            return;
          }

          await sleep(450);
          login(resolveGoogleSessionUser(payload));
          router.push(isOnboarded ? ROUTES.WORKSPACE : ROUTES.ONBOARDING);
        } catch {
          setError("No se pudo completar el ingreso con Google.");
        } finally {
          setGoogleLoading(false);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      itp_support: true,
    });

    googleButtonRef.current.innerHTML = "";
    googleAccounts.renderButton(googleButtonRef.current, {
      theme: "outline",
      size: "large",
      type: "standard",
      text: "continue_with",
      shape: "rectangular",
      logo_alignment: "left",
      width: googleButtonRef.current.clientWidth || 320,
    });

    // Do not call `prompt()` automatically. In some browsers the One Tap
    // background FedCM call can abort and log `AbortError`. We prefer an
    // explicit button flow for demo stability; if you want One Tap enable
    // it intentionally and handle notifications via the callback.
  }, [canUseGoogleSdk, isOnboarded, login, router]);

  function resolveUser(email: string, password: string) {
    if (email === MOCK_USER.email && password === MOCK_PASSWORD) return MOCK_USER;
    if (password === DEMO_PASSWORD) {
      return DEMO_ACCOUNTS.find((a) => a.email === email) ?? null;
    }
    return null;
  }

  async function onSubmit(data: FormData) {
    if (loading || googleLoading) return;
    setLoading(true);
    setError("");
    await sleep(900);
    const user = resolveUser(data.email, data.password);
    if (user) {
      login(user);
      router.push(isOnboarded ? ROUTES.WORKSPACE : ROUTES.ONBOARDING);
    } else {
      setError("Email o contraseña incorrectos. Usá las cuentas demo o mauro@cpgteam.com / nexus123");
    }
    setLoading(false);
  }

  async function loginAs(email: string, password: string) {
    setLoading(true);
    await sleep(600);
    const user = resolveUser(email, password);
    if (user) {
      login(user);
      router.push(isOnboarded ? ROUTES.WORKSPACE : ROUTES.ONBOARDING);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          setGoogleMessage("");
          setGoogleReady(true);
        }}
        onError={() => {
          setGoogleMessage("No se pudo cargar el SDK de Google. Revisá la conexión o el CSP.");
        }}
      />

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-sm relative"
      >
        <div className="flex justify-center mb-8">
          <Link href={isAuthenticated ? ROUTES.WORKSPACE : ROUTES.HOME}>
            <NexusLogo size="md" />
          </Link>
        </div>

        <div className="bg-surface-elevated border border-border rounded-xl p-8">
          <h1 className="text-xl font-semibold text-text-primary mb-1">Bienvenido de nuevo</h1>
          <p className="text-sm text-text-muted mb-6">Ingresá a tu cerebro comercial</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="mauro@cpgteam.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              rightElement={
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-text-muted hover:text-text-secondary">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              {...register("password")}
            />

            {error && (
              <p className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-md px-3 py-2.5">
                {error}
              </p>
            )}

            <Button type="submit" variant="primary" className="w-full" loading={loading}>
              Ingresar
            </Button>
          </form>

          {/* Demo accounts section */}
          <div className="mt-5">
            <button
              type="button"
              onClick={() => setShowDemoAccounts((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-border bg-surface hover:bg-surface-soft transition-colors text-xs text-text-secondary"
            >
              <span className="font-medium">Cuentas demo disponibles</span>
              {showDemoAccounts ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            <AnimatePresence>
              {showDemoAccounts && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 space-y-1.5">
                    {DEMO_ACCOUNTS.map((account) => {
                      const modules = (account.enabledModules ?? [])
                        .map((m) => MODULE_LABELS[m] ?? m)
                        .slice(0, 4);
                      const extraModules = (account.enabledModules ?? []).length - 4;
                      return (
                        <button
                          key={account.email}
                          type="button"
                          disabled={loading}
                          onClick={() => {
                            setValue("email", account.email);
                            setValue("password", account.email === MOCK_USER.email ? MOCK_PASSWORD : DEMO_PASSWORD);
                            loginAs(account.email, account.email === MOCK_USER.email ? MOCK_PASSWORD : DEMO_PASSWORD);
                          }}
                          className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg border border-border bg-surface hover:bg-surface-soft hover:border-primary/30 transition-colors group text-left"
                        >
                          <Avatar name={account.name} size="xs" className="mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-medium text-text-primary truncate">{account.name}</span>
                              <span className={cn(
                                "text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full border flex-shrink-0",
                                ROLE_COLORS[account.workspaceRole ?? "viewer"]
                              )}>
                                {ROLE_LABELS[account.workspaceRole ?? "viewer"]}
                              </span>
                            </div>
                            <p className="text-[10px] text-text-muted truncate mb-1">{account.role}</p>
                            {account.bio && (
                              <p className="text-[10px] text-text-muted/80 leading-snug line-clamp-1 mb-1">{account.bio}</p>
                            )}
                            {modules.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {modules.map((m) => (
                                  <span key={m} className="text-[9px] px-1.5 py-0.5 rounded bg-surface-soft border border-border text-text-muted font-medium">
                                    {m}
                                  </span>
                                ))}
                                {extraModules > 0 && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-soft border border-border text-text-muted">
                                    +{extraModules}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] text-text-muted font-mono opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5">
                            {account.email === MOCK_USER.email ? "nexus123" : "demo123"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

            <div className="space-y-2">
              <div className="rounded-md border border-border bg-surface px-2 py-2">
                {canUseGoogleSdk ? (
                  <div ref={googleButtonRef} className="min-h-11 w-full" />
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    disabled
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                      Ingresar con Google
                  </Button>
                )}
                {!googleReady && !googleMessage && googleClientId && (
                  <p className="mt-2 text-xs text-text-muted text-center">Cargando Google SSO...</p>
                )}
              </div>

              {googleMessage && (
                <p className="text-xs text-text-muted text-center">{googleMessage}</p>
              )}

              {!googleClientId && (
                <p className="text-xs text-text-muted text-center">
                  Falta configurar NEXT_PUBLIC_GOOGLE_CLIENT_ID para habilitar el login real con Google.
                </p>
              )}

              <p className="text-xs text-center text-text-muted">
                Si la respuesta de Google es válida, la app inicia sesión con tu cuenta de Google.
              </p>
            </div>

          <p className="text-center text-sm text-text-muted mt-6">
            ¿No tenés cuenta?{" "}
            <Link href={ROUTES.REGISTER} className="text-primary-soft hover:text-primary transition-colors font-medium">
              Registrate
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
