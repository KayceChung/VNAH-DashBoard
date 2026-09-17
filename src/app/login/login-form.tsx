"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reason = searchParams.get("reason");
  const sessionNotice =
    reason === "idle"
      ? "Bạn đã bị đăng xuất do không thao tác trong 30 phút. Vui lòng đăng nhập lại."
      : reason === "timebox"
        ? "Phiên đăng nhập đã hết hạn sau 12 giờ. Vui lòng đăng nhập lại."
        : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("Email hoặc mật khẩu không đúng.");
      setLoading(false);
      return;
    }

    const next = searchParams.get("next") ?? "/dashboard";
    router.replace(next);
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-4 flex justify-center">
        <Image src="/vnah-logo.png" alt="VNAH" width={180} height={50} priority className="h-auto w-40" />
      </div>
      <h1 className="mb-1 text-center text-xl font-semibold text-card-foreground">VNAH Dashboard</h1>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        Đăng nhập bằng tài khoản nhân sự đã được cấp.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Mật khẩu
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-primary focus:ring-2"
          />
        </div>

        {sessionNotice && !error && (
          <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">{sessionNotice}</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </form>
    </div>
  );
}
