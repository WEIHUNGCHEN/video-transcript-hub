import Link from "next/link";

// Server component: reads the balance itself so any page header can drop it in.
export default function CreditsBadge({ credits }: { credits: number }) {
  return (
    <Link
      href="/credits"
      className="rounded-full border border-border px-3 py-1.5 text-sm transition hover:bg-secondary"
      title="點數 / Credits"
    >
      <span className="text-muted-foreground">Credits </span>
      <span className="font-medium text-primary">{credits}</span>
    </Link>
  );
}
