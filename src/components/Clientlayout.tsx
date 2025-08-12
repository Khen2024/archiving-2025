// app/ClientProviders.tsx
"use client";
import { ActiveItemProvider, ContentProvider } from "seti-ramesesv1";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ActiveItemProvider>
      <ContentProvider>{children}</ContentProvider>
    </ActiveItemProvider>
  );
}