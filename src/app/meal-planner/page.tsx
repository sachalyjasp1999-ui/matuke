'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Plus, ShoppingCart, Download } from 'lucide-react'
import { MealPlan } from '@/lib/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const mealTypes = ['pequeno-almoço', 'almoço', 'jantar', 'lanche']

export default function MealPlannerPage() {
  const router = useRouter()
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [currentWeek, setCurrentWeek] = useState(new Date())

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (userId) {
      loadMealPlans()
    }
  }, [userId, currentWeek])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUserId(user.id)
  }

  const getWeekDates = () => {
    const start = new Date(currentWeek)
    start.setDate(start.getDate() - start.getDay())
    
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const loadMealPlans = async () => {
    if (!userId) return

    setLoading(true)
    try {
      const weekDates = getWeekDates()
      const startDate = weekDates[0].toISOString().split('T')[0]
      const endDate = weekDates[6].toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('meal_planner')
        .select(`
          *,
          recipe:recipes(*)
        `)
        .eq('user_id', userId)
        .gte('meal_date', startDate)
        .lte('meal_date', endDate)
        .order('meal_date', { ascending: true })

      if (error) throw error
      setMealPlans(data || [])
    } catch (error: any) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const generateShoppingList = async () => {
    if (!userId || mealPlans.length === 0) {
      alert('Adiciona refeições ao planeador primeiro!')
      return
    }

    try {
      const weekDates = getWeekDates()
      const ingredients: any[] = []

      mealPlans.forEach(plan => {
        if (plan.recipe?.ingredients) {
          plan.recipe.ingredients.forEach((ing: any) => {
            ingredients.push({
              name: ing.name,
              quantity: ing.quantity,
              unit: ing.unit,
              checked: false,
              recipe_id: plan.recipe_id
            })
          })
        }
      })

      const { error } = await supabase
        .from('shopping_lists')
        .insert({
          user_id: userId,
          name: `Lista da Semana - ${weekDates[0].toLocaleDateString('pt-AO')}`,
          items: ingredients,
          start_date: weekDates[0].toISOString().split('T')[0],
          end_date: weekDates[6].toISOString().split('T')[0],
          is_completed: false
        })

      if (error) throw error

      alert('Lista de compras gerada com sucesso! 🛒')
      router.push('/shopping-list')
    } catch (error: any) {
      alert(error.message)
    }
  }

  const getMealForDateAndType = (date: Date, mealType: string) => {
    const dateStr = date.toISOString().split('T')[0]
    return mealPlans.find(
      plan => plan.meal_date === dateStr && plan.meal_type === mealType
    )
  }

  const weekDates = getWeekDates()

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
            <div className="flex gap-2">
              <Button
                onClick={generateShoppingList}
                variant="outline"
                className="border-[#CFA450] text-[#1F4E3D] hover:bg-[#FFF9F5]"
              >
                <ShoppingCart className="mr-2 h-4 w-4 text-[#CFA450]" />
                Gerar Lista
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 text-[#1F4E3D]">Planeador de Refeições</h2>
          <p className="text-gray-600">
            Organiza as tuas refeições da semana
          </p>
        </div>

        {/* Week Navigation */}
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            className="border-[#CFA450] text-[#1F4E3D] hover:bg-[#FFF9F5]"
            onClick={() => {
              const newDate = new Date(currentWeek)
              newDate.setDate(newDate.getDate() - 7)
              setCurrentWeek(newDate)
            }}
          >
            ← Semana Anterior
          </Button>
          <h3 className="text-lg font-semibold text-[#1F4E3D]">
            {weekDates[0].toLocaleDateString('pt-AO', { day: 'numeric', month: 'short' })} - {weekDates[6].toLocaleDateString('pt-AO', { day: 'numeric', month: 'short', year: 'numeric' })}
          </h3>
          <Button
            variant="outline"
            className="border-[#CFA450] text-[#1F4E3D] hover:bg-[#FFF9F5]"
            onClick={() => {
              const newDate = new Date(currentWeek)
              newDate.setDate(newDate.getDate() + 7)
              setCurrentWeek(newDate)
            }}
          >
            Próxima Semana →
          </Button>
        </div>

        {/* Meal Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-8 gap-2">
              {/* Header */}
              <div className="font-semibold p-2"></div>
              {weekDates.map((date, i) => (
                <div key={i} className="font-semibold text-center p-2 bg-white rounded-lg border border-[#CFA450]/30">
                  <div className="text-sm text-gray-600">{daysOfWeek[date.getDay()]}</div>
                  <div className="text-lg text-[#1F4E3D]">{date.getDate()}</div>
                </div>
              ))}

              {/* Meal Rows */}
              {mealTypes.map(mealType => (
                <>
                  <div key={mealType} className="font-medium p-2 flex items-center capitalize text-[#1F4E3D]">
                    {mealType}
                  </div>
                  {weekDates.map((date, i) => {
                    const meal = getMealForDateAndType(date, mealType)
                    return (
                      <div key={`${mealType}-${i}`} className="p-1">
                        {meal ? (
                          <Card className="h-full bg-[#FFF9F5] border-[#CFA450]">
                            <CardContent className="p-2">
                              <p className="text-xs font-medium line-clamp-2 text-[#1F4E3D]">
                                {meal.recipe?.title}
                              </p>
                              <Badge variant="secondary" className="text-xs mt-1 bg-[#C45C33] text-white">
                                {meal.servings} porções
                              </Badge>
                            </CardContent>
                          </Card>
                        ) : (
                          <Button
                            variant="outline"
                            className="w-full h-full min-h-[60px] border-dashed border-[#CFA450] text-[#CFA450] hover:bg-[#FFF9F5]"
                            onClick={() => alert('Funcionalidade de adicionar refeição em desenvolvimento!')}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </>
              ))}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {mealPlans.length === 0 && !loading && (
          <div className="text-center py-12 mt-8">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2 text-[#1F4E3D]">Nenhuma refeição planeada</h3>
            <p className="text-gray-600 mb-4">
              Começa a adicionar refeições ao teu planeador
            </p>
            <Link href="/search">
              <Button className="bg-[#C45C33] hover:bg-[#A54A28] text-white shadow-lg">
                <Plus className="mr-2 h-4 w-4" />
                Pesquisar Receitas
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
