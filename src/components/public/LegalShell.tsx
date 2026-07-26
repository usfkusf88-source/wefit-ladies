import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function LegalShell({ title, body, email }: { title: string; body: string; email: string }) {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="mb-8 inline-flex items-center gap-1 text-sm text-pink-brand hover:underline">
          <ChevronRight className="h-4 w-4" /> العودة للرئيسية
        </Link>
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">{title}</h1>
        <div className="mt-6 whitespace-pre-line leading-loose text-zinc-600">{body}</div>
        <p className="mt-10 text-sm text-zinc-400" dir="ltr">
          {email}
        </p>
      </div>
    </main>
  );
}
