'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { SidebarMenu } from '@/components/custom/sidebar-menu'
import { MultimodalInput } from '@/components/custom/multimodal-input'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    let cancelled = false
    
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (cancelled) return
        
        if (!user) {
          router.push('/login')
          return
        }

        setUser(user)

        // Verificar se tem perfil
        const { data: profile } = await supabase
          .from('user_profile')
          .select('*')
          .eq('id', user.id)
          .single()

        if (cancelled) return

        if (!profile) {
          router.push('/onboarding')
          return
        }

        setProfile(profile)
      } catch (error) {
        if (!cancelled) {
          console.error('Erro ao verificar usuário:', error)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    checkUser()

    return () => {
      cancelled = true
    }
  }, [mounted, router])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#FFF9F5] to-[#FFF5ED]">
        <div className="text-center">
          <img 
            src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/269efe84-8406-418d-ac6a-9e4e9581d59e.png" 
            alt="Matuke Logo" 
            className="h-16 w-auto mx-auto mb-4 animate-pulse"
          />
          <p className="text-gray-600">A carregar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#FFF9F5] to-[#FFF5ED]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-[#CFA450]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <SidebarMenu />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-[#1F4E3D]">Créditos</p>
              <p className="text-2xl font-bold text-[#C45C33]">{profile?.credits || 0}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <img 
            src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/269efe84-8406-418d-ac6a-9e4e9581d59e.png" 
            alt="Matuke Logo" 
            className="h-24 w-auto mx-auto"
          />
        </div>

        {/* Main Title */}
        <div className="text-center mb-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#1F4E3D]">
            O que vamos fazer hoje?
          </h1>
        </div>

        {/* Motivational Phrase */}
        <div className="text-center mb-12">
          <p className="text-sm sm:text-base text-gray-600">
            Descobre o que podes preparar hoje com o que tens em casa
          </p>
        </div>

        {/* Multimodal Input Component */}
        <MultimodalInput />
      </main>
    </div>
  )
}
