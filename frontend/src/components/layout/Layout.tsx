import { useState, ReactNode } from 'react';
import { Sidebar } from '../ui/sidebar';
import { cn } from '@/lib/utils';
import { AppSidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className={cn("min-h-screen bg-background flex font-sans w-full")}>
      <Sidebar open={open} setOpen={setOpen}>
        <AppSidebar />
      </Sidebar>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 rounded-3xl border-l border-l-accent">
        {children}
      </main>
    </div>
  );
}
