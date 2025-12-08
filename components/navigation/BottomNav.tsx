'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import {
  Inbox,
  CheckSquare,
  FolderKanban,
  Calendar,
  Clock,
  FileText,
} from 'lucide-react';

const navItems = [
  { href: '/inbox', label: '收件箱', icon: Inbox },
  { href: '/next-actions', label: '下一步', icon: CheckSquare },
  { href: '/projects', label: '项目', icon: FolderKanban },
  { href: '/scheduled', label: '日程', icon: Calendar },
  { href: '/someday', label: '将来', icon: Clock },
  { href: '/reference', label: '参考', icon: FileText },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 mb-1",
                isActive && "scale-110"
              )} />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

