'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { 
  Home, 
  Calendar, 
  ShoppingCart, 
  Package, 
  CreditCard, 
  Users, 
  MessageSquare, 
  User, 
  Gift, 
  LogOut,
  Menu
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function SidebarMenu() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const menuItems = [
    { icon: User, label: 'Meu Perfil', href: '/profile' },
    { icon: CreditCard, label: 'Meu Plano', href: '/subscription' },
    { icon: Calendar, label: 'Planeador de Refeições', href: '/meal-planner' },
    { icon: ShoppingCart, label: 'Lista de Compras', href: '/shopping-list' },
    { icon: Package, label: 'Inventário', href: '/inventory' },
    { icon: Users, label: 'Comunidade', href: '/community' },
    { icon: MessageSquare, label: 'Feedbacks', href: '/feedback' },
    { icon: CreditCard, label: 'Assinatura / Plano', href: '/subscription' },
    { icon: Gift, label: 'Indique & Ganhe', href: '/referral' },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-[#1F4E3D] hover:bg-[#FFF9F5]"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 bg-white border-r border-[#CFA450]/20">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8 pt-4">
            <img 
              src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/269efe84-8406-418d-ac6a-9e4e9581d59e.png" 
              alt="Matuke Logo" 
              className="h-10 w-auto"
            />
            <span className="text-2xl font-bold text-[#1F4E3D]">Matuke</span>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item, index) => (
              <Link 
                key={index} 
                href={item.href}
                onClick={() => setOpen(false)}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-[#1F4E3D] hover:bg-[#FFF9F5] hover:text-[#C45C33] transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="border-t border-[#CFA450]/20 pt-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
