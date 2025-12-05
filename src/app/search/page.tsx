'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Camera, Loader2, Clock, Users, ChefHat } from 'lucide-react'
import { Recipe } from '@/lib/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SearchPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [credits, setCredits] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)

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

    const { data: profile } = await supabase
      .from('user_profile')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (profile) {
      setCredits(profile.credits)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim() || !userId) return

    if (credits <= 0) {
      alert('Não tens créditos suficientes! Adiciona mais créditos para continuar.')
      return
    }

    setLoading(true)
    try {
      // Pesquisar receitas
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`)
        .eq('is_public', true)
        .limit(10)

      if (error) throw error

      setRecipes(data || [])

      // Registar pesquisa e deduzir crédito
      await supabase.from('search_history').insert({
        user_id: userId,
        search_type: 'text',
        search_query: searchQuery,
        results_count: data?.length || 0,
        credits_used: 1
      })

      await supabase
        .from('user_profile')
        .update({ credits: credits - 1 })
        .eq('id', userId)

      setCredits(credits - 1)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImageSearch = () => {
    alert('Funcionalidade de pesquisa por imagem em desenvolvimento! 📸')
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
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-lg bg-[#FFF9F5] text-[#C45C33] border border-[#CFA450]">
                {credits} créditos
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 text-[#1F4E3D]">Pesquisar Receitas</h2>
          <p className="text-gray-600">
            Encontra receitas deliciosas por nome, ingredientes ou tipo de prato
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Ex: Muamba de galinha, Calulu, Arroz..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="text-lg border-[#CFA450] focus:ring-[#CFA450]"
            />
            <Button
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              className="bg-[#C45C33] hover:bg-[#A54A28] text-white shadow-lg"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </Button>
          </div>
          <Button
            onClick={handleImageSearch}
            variant="outline"
            className="border-[#CFA450] text-[#1F4E3D] hover:bg-[#FFF9F5]"
          >
            <Camera className="mr-2 h-5 w-5 text-[#CFA450]" />
            Pesquisar por Foto
          </Button>
        </div>

        {/* Results */}
        {recipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <Card key={recipe.id} className="hover:shadow-xl transition-all hover:scale-105 border border-[#CFA450]/30">
                <CardHeader>
                  {recipe.image_url && (
                    <img
                      src={recipe.image_url}
                      alt={recipe.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                  <CardTitle className="text-xl text-[#1F4E3D]">{recipe.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {recipe.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {recipe.difficulty && (
                      <Badge variant="outline" className="border-[#CFA450] text-[#1F4E3D]">
                        <ChefHat className="mr-1 h-3 w-3" />
                        {recipe.difficulty}
                      </Badge>
                    )}
                    {recipe.prep_time && (
                      <Badge variant="outline" className="border-[#CFA450] text-[#1F4E3D]">
                        <Clock className="mr-1 h-3 w-3" />
                        {recipe.prep_time} min
                      </Badge>
                    )}
                    {recipe.servings && (
                      <Badge variant="outline" className="border-[#CFA450] text-[#1F4E3D]">
                        <Users className="mr-1 h-3 w-3" />
                        {recipe.servings} porções
                      </Badge>
                    )}
                  </div>
                  <Link href={`/recipe/${recipe.id}`}>
                    <Button className="w-full bg-[#C45C33] hover:bg-[#A54A28] text-white shadow-lg">
                      Ver Receita
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2 text-[#1F4E3D]">Nenhuma receita encontrada</h3>
            <p className="text-gray-600">
              {searchQuery
                ? 'Tenta pesquisar com outros termos'
                : 'Começa a pesquisar para encontrar receitas incríveis'}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
