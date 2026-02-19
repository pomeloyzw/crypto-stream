"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function CoinDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="coin-details-page">
      <section className="col-span-full flex flex-col items-center justify-center gap-6 py-24 px-4 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>

        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-bold tracking-tight">
            Something went wrong
          </h2>
          <p className="text-sm text-muted-foreground">
            {error.message || "Failed to load coin details. Please try again."}
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/coins">
              <ArrowLeft />
              Back to Coins
            </Link>
          </Button>
          <Button onClick={reset}>
            <RefreshCw />
            Try Again
          </Button>
        </div>
      </section>
    </main>
  );
}
