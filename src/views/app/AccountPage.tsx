"use client";

import { useQuery } from "@tanstack/react-query";
import { getMe } from "../../api/users";
import { Card } from "../../components/Card";
import { Spinner } from "../../components/Spinner";
import { EmailOnZeroCard } from "../../features/account/EmailOnZeroCard";
import { ProfileCard } from "../../features/account/ProfileCard";

export function AccountPage() {
  const me = useQuery({ queryKey: ["me"], queryFn: getMe });
  if (me.isLoading) {
    return <Spinner />;
  }
  if (me.error || !me.data) {
    return (
      <Card>
        <p className="text-sm text-danger">{me.error?.message || "Could not load account."}</p>
      </Card>
    );
  }
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-[28px] leading-9 tracking-[-0.03em] break-words lg:text-[34px] lg:leading-10">Account</h1>
      <ProfileCard me={me.data} />
      <EmailOnZeroCard me={me.data} />
    </div>
  );
}
