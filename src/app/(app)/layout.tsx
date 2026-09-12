import { Navigation } from '@/components/Navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:flex bg-background">
      <Navigation />
      <main className="flex-1 relative overflow-y-auto pb-24 md:pb-0 md:ml-64 w-full">
        {children}
      </main>
    </div>
  );
}
