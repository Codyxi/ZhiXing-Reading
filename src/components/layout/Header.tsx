'use client';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className="px-6 pt-6 pb-2">
      <h1 className="text-2xl font-semibold tracking-tight text-text-primary">{title}</h1>
      {subtitle && (
        <p className="mt-1 text-sm text-text-muted">{subtitle}</p>
      )}
    </div>
  );
}
