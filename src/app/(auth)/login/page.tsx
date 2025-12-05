'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { Chrome, Phone } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [countryCode, setCountryCode] = useState('+244')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/onboarding`
        }
      })
      if (error) throw error
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneLogin = async () => {
    setLoading(true)
    try {
      const fullPhone = `${countryCode}${phoneNumber}`
      const { error } = await supabase.auth.signInWithOtp({
        phone: fullPhone
      })
      if (error) throw error
      setOtpSent(true)
      alert('Código enviado! Verifica o teu telemóvel.')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    setLoading(true)
    try {
      const fullPhone = `${countryCode}${phoneNumber}`
      const { error } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: otp,
        type: 'sms'
      })
      if (error) throw error
      router.push('/onboarding')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#FFF9F5] to-[#FFF5ED] p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center items-center gap-3">
            <img 
              src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/269efe84-8406-418d-ac6a-9e4e9581d59e.png" 
              alt="Matuke Logo" 
              className="h-16 w-auto"
            />
            <span className="text-4xl font-bold text-[#1F4E3D]">M</span>
          </div>
          <CardTitle className="text-2xl font-bold text-[#1F4E3D]">Matuke IA</CardTitle>
          <CardDescription className="text-base text-gray-600">
            Bem-vindo(a) ao Matuke — o teu assistente inteligente para refeições e sobremesas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="google" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#FFF9F5]">
              <TabsTrigger value="google" className="data-[state=active]:bg-[#C45C33] data-[state=active]:text-white">Google</TabsTrigger>
              <TabsTrigger value="phone" className="data-[state=active]:bg-[#C45C33] data-[state=active]:text-white">Telemóvel</TabsTrigger>
            </TabsList>

            <TabsContent value="google" className="space-y-4">
              <Button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-[#C45C33] hover:bg-[#A54A28] text-white shadow-lg"
                size="lg"
              >
                <Chrome className="mr-2 h-5 w-5" />
                Continuar com Google
              </Button>
            </TabsContent>

            <TabsContent value="phone" className="space-y-4">
              {!otpSent ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-[#1F4E3D] font-semibold">Código do País</Label>
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger className="border-[#CFA450] focus:ring-[#CFA450]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+244">🇦🇴 Angola (+244)</SelectItem>
                        <SelectItem value="+351">🇵🇹 Portugal (+351)</SelectItem>
                        <SelectItem value="+55">🇧🇷 Brasil (+55)</SelectItem>
                        <SelectItem value="+1">🇺🇸 EUA (+1)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[#1F4E3D] font-semibold">Número de Telemóvel</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="912345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="border-[#CFA450] focus:ring-[#CFA450]"
                    />
                  </div>

                  <Button
                    onClick={handlePhoneLogin}
                    disabled={loading || !phoneNumber}
                    className="w-full bg-[#C45C33] hover:bg-[#A54A28] text-white shadow-lg"
                    size="lg"
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    Enviar Código
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-[#1F4E3D] font-semibold">Código de Verificação</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      className="border-[#CFA450] focus:ring-[#CFA450]"
                    />
                  </div>

                  <Button
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.length !== 6}
                    className="w-full bg-[#C45C33] hover:bg-[#A54A28] text-white shadow-lg"
                    size="lg"
                  >
                    Verificar Código
                  </Button>

                  <Button
                    onClick={() => setOtpSent(false)}
                    variant="ghost"
                    className="w-full text-[#1F4E3D] hover:bg-[#FFF9F5]"
                  >
                    Voltar
                  </Button>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
