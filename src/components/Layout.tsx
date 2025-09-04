import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Home, Users, Package, ClipboardList } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">Meu Piscineiro</h1>
            <nav className="flex gap-2">
              <Button
                variant={isActive('/') ? 'default' : 'ghost'}
                asChild
                size="sm"
              >
                <Link to="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button
                variant={isActive('/clientes') ? 'default' : 'ghost'}
                asChild
                size="sm"
              >
                <Link to="/clientes" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Clientes
                </Link>
              </Button>
              <Button
                variant={isActive('/produtos') ? 'default' : 'ghost'}
                asChild
                size="sm"
              >
                <Link to="/produtos" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Produtos
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}