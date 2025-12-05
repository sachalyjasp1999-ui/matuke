'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { SidebarMenu } from '@/components/custom/sidebar-menu'
import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'

export default function CommunityPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setLoading(false)
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#FFF9F5] to-[#FFF5ED]">
        <p className="text-gray-600">A carregar...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#FFF9F5] to-[#FFF5ED]">
      <header className="bg-white shadow-sm border-b border-[#CFA450]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <SidebarMenu />
            <img 
              src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/269efe84-8406-418d-ac6a-9e4e9581d59e.png" 
              alt="Matuke Logo" 
              className="h-10 w-auto"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <Users className="h-16 w-16 mx-auto mb-4 text-[#C45C33]" />
          <h1 className="text-3xl font-bold text-[#1F4E3D] mb-4">Comunidade</h1>
          <p className="text-gray-600 mb-6">
            Funcionalidade em desenvolvimento
          </p>
          <Button
            onClick={() => router.push('/')}
            className="bg-[#C45C33] hover:bg-[#A54A28] text-white"
          >
            Voltar à Home
          </Button>
        </div>
      </main>
    </div>
  )
}
