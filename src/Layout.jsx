import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { 
  LayoutDashboard, Receipt, Wallet, Target, BarChart3, 
  Menu, X, LogOut, User, ChevronDown, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [
  { name: 'Tableau de bord', href: 'Dashboard', icon: LayoutDashboard },
  { name: 'Dépenses', href: 'Expenses', icon: Receipt },
  { name: 'Revenus', href: 'Incomes', icon: Wallet },
  { name: 'Objectifs', href: 'Goals', icon: Target },
  { name: 'Analyse', href: 'Analysis', icon: BarChart3 },
  { name: 'Rapports', href: 'Reports', icon: FileText },
];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        
        // Redirect to plan selection if no plan selected
        if (!userData.plan && currentPageName !== 'SelectPlan') {
          window.location.href = createPageUrl('SelectPlan');
          return;
        }
        
        setUser(userData);
      } catch (error) {
        // User not authenticated, ignore
      }
    };
    loadUser();
  }, [currentPageName]);

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-slate-800">FamilyBudget+</h1>
                <p className="text-xs text-slate-500">Gestion responsable</p>
              </div>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = currentPageName === item.href;
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.href)}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    isActive 
                      ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/25" 
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          {user && (
            <div className="p-4 border-t border-slate-100">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {user.full_name || 'Utilisateur'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="text-slate-600">
                    <User className="w-4 h-4 mr-2" />
                    Mon profil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-rose-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Ethical Finance Badge */}
          <div className="px-4 pb-4">
            <div className="p-4 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl border border-teal-100">
              <p className="text-xs text-teal-700 font-medium mb-1">💚 Finance éthique</p>
              <p className="text-xs text-teal-600/80">
                Gérez votre budget de manière responsable, sans crédit ni dette.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-600 hover:text-slate-800"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-800">FamilyBudget+</span>
            </div>
            <div className="w-10" />
          </div>
        </header>

        {/* Page content */}
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}