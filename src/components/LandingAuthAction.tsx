"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { SignInModal } from "./SignInModal";
import { UserChip } from "./UserChip";

export function LandingAuthAction() {
  const { loading } = useAuth();
  const [signInOpen, setSignInOpen] = useState(false);

  if (loading) {
    return (
      <div
        className="h-9 w-[78px] rounded-lg border border-border bg-surface"
        aria-hidden="true"
      />
    );
  }

  return (
    <>
      <UserChip compactMobile onSignInClick={() => setSignInOpen(true)} />
      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
    </>
  );
}
