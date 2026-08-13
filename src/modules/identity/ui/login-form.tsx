"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { ArrowRightIcon, Loader2Icon, SmartphoneIcon } from "lucide-react";

import { formatPhoneFa, toEnglishDigits, toPersianDigits } from "@/shared/lib/persian";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

import { OTP_CODE_LENGTH } from "../domain/otp-policy";
import { requestLoginCode, verifyLoginCode } from "../actions/auth.actions";

/**
 * فرم ورود دو مرحله‌ای.
 *
 * نکات تجربه کاربری مهم:
 *   - ورودی شماره و کد با ارقام فارسی هم کار می‌کند (نرمال‌سازی خودکار).
 *   - شمارنده معکوس برای ارسال مجدد، تا کاربر بی‌هدف دکمه نزند.
 *   - در محیط توسعه، کد یک‌بارمصرف روی صفحه نشان داده می‌شود.
 */
export function LoginForm({ returnTo }: { returnTo?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((value) => Math.max(0, value - 1));
    }, 1_000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const submitPhone = () => {
    setError(null);

    startTransition(async () => {
      const result = await requestLoginCode({ phone: toEnglishDigits(phone) });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setStep("code");
      setCooldown(result.data.retryAfterSeconds);
      setDevCode(result.data.devCode ?? null);
      toast.success("کد تایید برای شما ارسال شد.");
    });
  };

  const submitCode = () => {
    setError(null);

    startTransition(async () => {
      const result = await verifyLoginCode({
        phone: toEnglishDigits(phone),
        code: toEnglishDigits(code),
        ...(returnTo ? { returnTo } : {}),
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      toast.success(result.data.isNewUser ? "به هفت منظومه خوش آمدید." : "خوش آمدید.");
      router.replace(result.data.redirectTo);
      router.refresh();
    });
  };

  if (step === "phone") {
    return (
      <form
        className="grid gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          submitPhone();
        }}
      >
        <FormField
          id="phone"
          label="شماره موبایل"
          hint="کد تایید به این شماره پیامک می‌شود."
          {...(error ? { error } : {})}
          required
        >
          <Input
            id="phone"
            name="phone"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
            className="ltr-nums text-center text-lg tracking-widest"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            maxLength={13}
            autoFocus
            required
          />
        </FormField>

        <Button type="submit" size="lg" disabled={isPending || phone.length < 10}>
          {isPending ? <Loader2Icon className="animate-spin" /> : <SmartphoneIcon />}
          دریافت کد تایید
        </Button>

        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          با ورود، شرایط استفاده از خدمات هفت منظومه را می‌پذیرید.
        </p>
      </form>
    );
  }

  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        submitCode();
      }}
    >
      <div className="rounded-lg bg-muted px-4 py-3 text-sm">
        کد تایید به شماره{" "}
        <span className="font-medium">{formatPhoneFa(phone)}</span> ارسال شد.
        <button
          type="button"
          className="ms-2 text-gold-deep underline underline-offset-4"
          onClick={() => {
            setStep("phone");
            setCode("");
            setError(null);
          }}
        >
          تغییر شماره
        </button>
      </div>

      {devCode ? (
        <Alert variant="info">
          <AlertDescription>
            حالت توسعه — کد تایید: <span className="ltr-nums font-bold">{devCode}</span>
          </AlertDescription>
        </Alert>
      ) : null}

      <FormField
        id="code"
        label="کد تایید"
        hint={`کد ${toPersianDigits(OTP_CODE_LENGTH)} رقمی پیامک‌شده را وارد کنید.`}
        {...(error ? { error } : {})}
        required
      >
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="------"
          className="ltr-nums text-center text-2xl tracking-[0.5em]"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          maxLength={OTP_CODE_LENGTH}
          autoFocus
          required
        />
      </FormField>

      <Button type="submit" size="lg" disabled={isPending || code.length < OTP_CODE_LENGTH}>
        {isPending ? <Loader2Icon className="animate-spin" /> : <ArrowRightIcon />}
        ورود به حساب
      </Button>

      <Button
        type="button"
        variant="ghost"
        disabled={cooldown > 0 || isPending}
        onClick={submitPhone}
      >
        {cooldown > 0
          ? `ارسال مجدد کد تا ${toPersianDigits(cooldown)} ثانیه دیگر`
          : "ارسال مجدد کد"}
      </Button>
    </form>
  );
}
