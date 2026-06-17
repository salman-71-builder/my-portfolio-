"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShoppingBag, Store, Mail, Lock, User as UserIcon } from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export function AuthClient() {
  const params = useSearchParams();
  const initial = params.get("tab") === "register" ? "register" : "login";
  const [role, setRole] = React.useState<"buyer" | "supplier">("buyer");

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
          <Tabs defaultValue={initial}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* Login */}
            <TabsContent value="login" className="pt-5">
              <h1 className="text-xl font-bold">Welcome back</h1>
              <p className="text-sm text-muted-foreground">
                Login to access wholesale prices.
              </p>
              <form
                className="mt-4 space-y-4"
                onSubmit={(e) => e.preventDefault()}
              >
                <Field
                  id="login-email"
                  label="Email"
                  type="email"
                  icon={Mail}
                  placeholder="you@example.com"
                />
                <Field
                  id="login-password"
                  label="Password"
                  type="password"
                  icon={Lock}
                  placeholder="••••••••"
                />
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" /> Remember me
                  </label>
                  <Link href="#" className="text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Button type="submit" className="w-full" size="lg">
                  Login
                </Button>
              </form>
              <SocialButtons />
            </TabsContent>

            {/* Register */}
            <TabsContent value="register" className="pt-5">
              <h1 className="text-xl font-bold">Create your account</h1>
              <p className="text-sm text-muted-foreground">
                Join 50,000+ businesses sourcing from China.
              </p>

              {/* Role selector */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <RoleCard
                  active={role === "buyer"}
                  onClick={() => setRole("buyer")}
                  icon={ShoppingBag}
                  title="Buyer"
                  desc="I want to source products"
                />
                <RoleCard
                  active={role === "supplier"}
                  onClick={() => setRole("supplier")}
                  icon={Store}
                  title="Supplier"
                  desc="I want to sell products"
                />
              </div>

              <form
                className="mt-4 space-y-4"
                onSubmit={(e) => e.preventDefault()}
              >
                <Field
                  id="reg-name"
                  label={role === "supplier" ? "Company Name" : "Full Name"}
                  icon={UserIcon}
                  placeholder={
                    role === "supplier" ? "Your company" : "Your name"
                  }
                />
                <Field
                  id="reg-email"
                  label="Email"
                  type="email"
                  icon={Mail}
                  placeholder="you@example.com"
                />
                <Field
                  id="reg-password"
                  label="Password"
                  type="password"
                  icon={Lock}
                  placeholder="Create a password"
                />
                <Button type="submit" className="w-full" size="lg">
                  Create {role === "supplier" ? "Supplier" : "Buyer"} Account
                </Button>
              </form>
              <SocialButtons />
            </TabsContent>
          </Tabs>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          By continuing you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  icon: Icon,
  type = "text",
  placeholder,
}: {
  id: string;
  label: string;
  icon: React.ElementType;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input id={id} type={type} placeholder={placeholder} className="pl-9" />
      </div>
    </div>
  );
}

function RoleCard({
  active,
  onClick,
  icon: Icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-colors",
        active ? "border-primary bg-primary/5" : "border-input hover:bg-muted"
      )}
    >
      <Icon className={cn("h-5 w-5", active ? "text-primary" : "")} />
      <span className="font-semibold">{title}</span>
      <span className="text-xs text-muted-foreground">{desc}</span>
    </button>
  );
}

function SocialButtons() {
  return (
    <>
      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        OR CONTINUE WITH
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" type="button">
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </Button>
        <Button variant="outline" type="button">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.25h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z" />
          </svg>
          Facebook
        </Button>
      </div>
    </>
  );
}
