'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft } from 'lucide-react'

const dietaryOptions = [
  'Vegetariano',
  'Vegano',
  'Sem Glúten',
  'Sem Lactose',
  'Halal',
  'Kosher',
  'Baixo Carboidrato',
  'Paleo'
]

const allergyOptions = [
  'Nozes',
  'Amendoim',
  'Leite',
  'Ovos',
  'Peixe',
  'Marisco',
  'Soja',
  'Trigo/Glúten'
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    full_name: '',
    household_size: 2,
    cooking_skill: 'intermediário' as 'iniciante' | 'intermediário' | 'avançado',
    dietary_preferences: [] as string[],
    allergies: [] as string[]
  })

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUserId(user.id)
  }

  const handleDietaryToggle = (option: string) => {
    setFormData(prev => ({
      ...prev,
      dietary_preferences: prev.dietary_preferences.includes(option)
        ? prev.dietary_preferences.filter(item => item !== option)
        : [...prev.dietary_preferences, option]
    }))
  }

  const handleAllergyToggle = (option: string) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.includes(option)
        ? prev.allergies.filter(item => item !== option)
        : [...prev.allergies, option]
    }))
  }

  const handleComplete = async () => {
    if (!userId) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('user_profile')
        .insert({
          id: userId,
          ...formData,
          credits: 10,
          trial_used: false,
          subscription_status: 'trial'
        })

      if (error) throw error

      router.push('/dashboard')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#FFF9F5] to-[#FFF5ED] p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0">
        <CardHeader className="space-y-4">
          <div className="flex justify-center items-center gap-3 mb-4">
            <img 
              src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/269efe84-8406-418d-ac6a-9e4e9581d59e.png" 
              alt="Matuke Logo" 
              className="h-12 w-auto"
            />
            <span className="text-3xl font-bold text-[#1F4E3D]">M</span>
          </div>
          <CardTitle className="text-2xl text-[#1F4E3D] text-center">
            Vamos Conhecer-te Melhor
          </CardTitle>
          <CardDescription className="text-center text-base">
            Passo {step} de 4 - Personaliza a tua experiência
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#1F4E3D] font-semibold">Como te chamas?</Label>
                <Input
                  id="name"
                  placeholder="O teu nome"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="border-[#CFA450] focus:ring-[#CFA450]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="household" className="text-[#1F4E3D] font-semibold">Quantas pessoas vivem contigo?</Label>
                <Select
                  value={formData.household_size.toString()}
                  onValueChange={(value) => setFormData({ ...formData, household_size: parseInt(value) })}
                >
                  <SelectTrigger className="border-[#CFA450] focus:ring-[#CFA450]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'pessoa' : 'pessoas'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skill" className="text-[#1F4E3D] font-semibold">Qual é o teu nível de culinária?</Label>
                <Select
                  value={formData.cooking_skill}
                  onValueChange={(value: any) => setFormData({ ...formData, cooking_skill: value })}
                >
                  <SelectTrigger className="border-[#CFA450] focus:ring-[#CFA450]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iniciante">Iniciante</SelectItem>
                    <SelectItem value="intermediário">Intermediário</SelectItem>
                    <SelectItem value="avançado">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label className="text-lg mb-4 block text-[#1F4E3D] font-semibold">Preferências Alimentares</Label>
                <p className="text-sm text-gray-600 mb-4">
                  Seleciona todas as que se aplicam
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {dietaryOptions.map(option => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={option}
                        checked={formData.dietary_preferences.includes(option)}
                        onCheckedChange={() => handleDietaryToggle(option)}
                        className="border-[#CFA450] data-[state=checked]:bg-[#C45C33] data-[state=checked]:border-[#C45C33]"
                      />
                      <Label htmlFor={option} className="cursor-pointer text-gray-700">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label className="text-lg mb-4 block text-[#1F4E3D] font-semibold">Alergias Alimentares</Label>
                <p className="text-sm text-gray-600 mb-4">
                  Seleciona todas as que tens
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {allergyOptions.map(option => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={option}
                        checked={formData.allergies.includes(option)}
                        onCheckedChange={() => handleAllergyToggle(option)}
                        className="border-[#CFA450] data-[state=checked]:bg-[#C45C33] data-[state=checked]:border-[#C45C33]"
                      />
                      <Label htmlFor={option} className="cursor-pointer text-gray-700">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-[#1F4E3D]">Tudo Pronto!</h3>
              <p className="text-gray-600">
                Tens <span className="font-bold text-[#C45C33]">10 créditos grátis</span> para começares a explorar receitas.
              </p>
              <div className="bg-[#FFF9F5] p-4 rounded-lg mt-4 border border-[#CFA450]">
                <p className="text-sm text-gray-700">
                  Cada pesquisa usa 1 crédito. Podes ganhar mais créditos partilhando receitas ou subscrevendo.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="border-[#1F4E3D] text-[#1F4E3D] hover:bg-[#FFF9F5]"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            )}

            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                className="ml-auto bg-[#C45C33] hover:bg-[#A54A28] text-white shadow-lg"
              >
                Continuar
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="ml-auto bg-[#C45C33] hover:bg-[#A54A28] text-white shadow-lg"
              >
                Começar a Usar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
