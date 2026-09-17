"use client";

import { useEffect, useState } from "react";

export default function ObfuscatedEmail({ user, domain }: { user: string; domain: string }) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEmail(`${user}@${domain}`);
  }, [user, domain]);

  if (!email) {
    return (
      <span className="text-accent-600">
        {user} [at] {domain}
      </span>
    );
  }

  return (
    <a href={`mailto:${email}`} className="text-accent-600 hover:text-accent-700 hover:underline">
      {email}
    </a>
  );
}
