'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, CreditCard, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      const { data: profile } = await supabase
        .from('user_profile')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setProfile(profile)
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user || !profile) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('user_profile')
        .update({
          full_name: profile.full_name,
          household_size: profile.household_size,
          cooking_skill: profile.cooking_skill
        })
        .eq('id', user.id)

      if (error) throw error

      alert('Perfil atualizado com sucesso! ✅')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
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
      <header className="bg-white shadow-sm border-b border-[#CFA450]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              <img 
                src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/269efe84-8406-418d-ac6a-9e4e9581d59e.png" 
                alt="Matuke Logo" 
                className="h-10 w-auto"
              />
              <span className="text-2xl font-bold text-[#1F4E3D]">M</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-[#1F4E3D] hover:bg-[#FFF9F5]"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 text-[#1F4E3D]">Meu Perfil</h2>
          <p className="text-gray-600">
            Gere as tuas informações pessoais e preferências
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="border border-[#CFA450]/30">
              <CardHeader className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-[#C45C33] to-[#A54A28] rounded-full mx-auto flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-white" />
                </div>
                <CardTitle className="text-xl text-[#1F4E3D]">{profile?.full_name || 'Chef'}</CardTitle>
                <CardDescription>{user?.email || user?.phone}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#FFF9F5] rounded-lg border border-[#CFA450]/30">
                  <span className="text-sm font-medium text-[#1F4E3D]">Créditos</span>
                  <Badge className="bg-[#C45C33] text-white text-lg">
                    {profile?.credits || 0}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#FFF9F5] rounded-lg border border-[#CFA450]/30">
                  <span className="text-sm font-medium text-[#1F4E3D]">Plano</span>
                  <Badge variant="outline" className="border-[#CFA450] text-[#1F4E3D]">
                    {profile?.subscription_status === 'trial' ? 'Teste Grátis' : 'Premium'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full bg-[#C45C33] hover:bg-[#A54A28] text-white shadow-lg">
              <CreditCard className="mr-2 h-4 w-4" />
              Adicionar Créditos
            </Button>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-[#CFA450]/30">
              <CardHeader>
                <CardTitle className="text-xl text-[#1F4E3D]">Informações Pessoais</CardTitle>
                <CardDescription>Atualiza os teus dados pessoais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[#1F4E3D] font-semibold">Nome Completo</Label>
                  <Input
                    id="name"
                    value={profile?.full_name || ''}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="border-[#CFA450] focus:ring-[#CFA450]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#1F4E3D] font-semibold">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="border-[#CFA450] bg-gray-50"
                  />
                </div>

                {user?.phone && (
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[#1F4E3D] font-semibold">Telemóvel</Label>
                    <Input
                      id="phone"
                      value={user.phone}
                      disabled
                      className="border-[#CFA450] bg-gray-50"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="household" className="text-[#1F4E3D] font-semibold">Pessoas em Casa</Label>
                  <Input
                    id="household"
                    type="number"
                    min="1"
                    max="10"
                    value={profile?.household_size || 2}
                    onChange={(e) => setProfile({ ...profile, household_size: parseInt(e.target.value) })}
                    className="border-[#CFA450] focus:ring-[#CFA450]"
                  />
                </div>

                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-[#C45C33] hover:bg-[#A54A28] text-white shadow-lg"
                >
                  {saving ? 'A guardar...' : 'Guardar Alterações'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-[#CFA450]/30">
              <CardHeader>
                <CardTitle className="text-xl text-[#1F4E3D]">Preferências Alimentares</CardTitle>
                <CardDescription>As tuas restrições e preferências</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-[#1F4E3D] font-semibold mb-2 block">Dieta</Label>
                  <div className="flex flex-wrap gap-2">
                    {profile?.dietary_preferences?.length > 0 ? (
                      profile.dietary_preferences.map((pref: string) => (
                        <Badge key={pref} variant="outline" className="border-[#CFA450] text-[#1F4E3D]">
                          {pref}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-600">Nenhuma preferência definida</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-[#1F4E3D] font-semibold mb-2 block">Alergias</Label>
                  <div className="flex flex-wrap gap-2">
                    {profile?.allergies?.length > 0 ? (
                      profile.allergies.map((allergy: string) => (
                        <Badge key={allergy} className="bg-[#C45C33] text-white">
                          {allergy}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-600">Nenhuma alergia registada</p>
                    )}
                  </div>
                </div>

                <Link href="/onboarding">
                  <Button variant="outline" className="w-full border-[#CFA450] text-[#1F4E3D] hover:bg-[#FFF9F5]">
                    <Settings className="mr-2 h-4 w-4" />
                    Atualizar Preferências
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
