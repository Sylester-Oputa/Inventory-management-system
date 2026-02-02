import { Button } from '@/app/components/ui/button';
import { LogOut, User, Sun, Moon } from 'lucide-react';
import type { User as UserType } from '@/app/App';
import { useTheme } from '@/app/contexts/ThemeContext';

interface TopBarProps {
  currentUser: UserType;
  onLogout: () => void;
}

export function TopBar({ currentUser, onLogout }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="h-16 bg-[var(--background)] border-b border-[var(--border)] flex items-center justify-between px-6 transition-fast">
      <div className="flex items-center gap-4">
        <p className="text-sm text-[var(--text-secondary)]">{currentDate}</p>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          className="w-9 h-9 p-0"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </Button>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--muted)] rounded-md">
          <User className="w-4 h-4 text-[var(--text-secondary)]" />
          <span className="text-sm font-medium">{currentUser.name}</span>
        </div>
        <Button variant="outline" size="sm" onClick={onLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}