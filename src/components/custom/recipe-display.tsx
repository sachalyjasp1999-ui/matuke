'use client'

import { Recipe } from '@/lib/openai'
import { Button } from '@/components/ui/button'
import { Clock, Users, ChefHat, AlertTriangle, Lightbulb, Calendar, ShoppingCart, BookmarkPlus } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface RecipeDisplayProps {
  recipe: Recipe
  warnings?: string[]
  substitutions?: Array<{ ingredient: string; substitute: string }>
  onAddToPlanner?: () => void
  onAddToShoppingList?: () => void
  onSaveRecipe?: () => void
}

export function RecipeDisplay({ 
  recipe, 
  warnings, 
  substitutions,
  onAddToPlanner,
  onAddToShoppingList,
  onSaveRecipe
}: RecipeDisplayProps) {
  const [activeVariation, setActiveVariation] = useState<'quick' | 'economical' | 'healthy' | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const difficultyColors = {
    'Fácil': 'bg-green-100 text-green-800',
    'Médio': 'bg-yellow-100 text-yellow-800',
    'Difícil': 'bg-red-100 text-red-800'
  }

  const handleSaveRecipe = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('É necessário estar autenticado para guardar receitas')
        return
      }

      const { error } = await supabase
        .from('saved_recipes')
        .insert({
          user_id: user.id,
          receita: recipe
        })

      if (error) throw error

      setSaved(true)
      if (onSaveRecipe) onSaveRecipe()
      
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Erro ao guardar receita:', error)
      alert('Erro ao guardar receita. Tenta novamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleAddToShoppingList = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('É necessário estar autenticado')
        return
      }

      // Adicionar ingredientes à lista de compras
      const items = recipe.ingredients.map(ing => ({
        user_id: user.id,
        name: ing.name,
        quantity: ing.quantity,
        category: 'Receita',
        purchased: false
      }))

      const { error } = await supabase
        .from('shopping_list')
        .insert(items)

      if (error) throw error

      alert('Ingredientes adicionados à lista de compras!')
      if (onAddToShoppingList) onAddToShoppingList()
    } catch (error) {
      console.error('Erro ao adicionar à lista:', error)
      alert('Erro ao adicionar ingredientes. Tenta novamente.')
    }
  }

  const handleAddToPlanner = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('É necessário estar autenticado')
        return
      }

      // Adicionar ao planeador (implementação básica)
      alert('Funcionalidade de planeamento será implementada em breve!')
      if (onAddToPlanner) onAddToPlanner()
    } catch (error) {
      console.error('Erro ao adicionar ao planeador:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-800 mb-2">Atenção!</h3>
              {warnings.map((warning, idx) => (
                <p key={idx} className="text-red-700 text-sm mb-1">{warning}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Substitutions */}
      {substitutions && substitutions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Substituições Sugeridas
          </h3>
          <ul className="space-y-1">
            {substitutions.map((sub, idx) => (
              <li key={idx} className="text-sm text-blue-800">
                <span className="font-medium">{sub.ingredient}</span> → {sub.substitute}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recipe Header */}
      <div className="bg-white rounded-lg border-2 border-[#CFA450] p-6 shadow-lg">
        <h2 className="text-3xl font-bold text-[#1F4E3D] mb-2">{recipe.title}</h2>
        {recipe.description && (
          <p className="text-gray-600 mb-4">{recipe.description}</p>
        )}

        {/* Recipe Meta */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-5 w-5 text-[#C45C33]" />
            <span className="font-medium">{recipe.prepTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-5 w-5 text-[#C45C33]" />
            <span className="font-medium">{recipe.servings} porções</span>
          </div>
          <div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyColors[recipe.difficulty]}`}>
              {recipe.difficulty}
            </span>
          </div>
        </div>

        {/* Ingredients */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-[#1F4E3D] mb-3 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Ingredientes
          </h3>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, idx) => (
              <li 
                key={idx} 
                className={`flex items-start gap-2 ${ingredient.isRestricted ? 'text-red-600 font-semibold' : 'text-gray-700'}`}
              >
                <span className="h-2 w-2 bg-[#C45C33] rounded-full mt-2 flex-shrink-0"></span>
                <span>
                  <span className="font-medium">{ingredient.quantity}</span> {ingredient.name}
                  {ingredient.isRestricted && <span className="ml-2 text-xs">(⚠️ Restrito)</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-[#1F4E3D] mb-3 flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Modo de Preparo
          </h3>
          <ol className="space-y-3">
            {recipe.steps.map((step, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-[#C45C33] text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </span>
                <p className="text-gray-700 pt-1">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Variations */}
        {recipe.variations && (
          <div className="mb-6">
            <h3 className="text-xl font-bold text-[#1F4E3D] mb-3">Variações</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {recipe.variations.quick && (
                <Button
                  variant="outline"
                  onClick={() => setActiveVariation(activeVariation === 'quick' ? null : 'quick')}
                  className="border-[#CFA450] hover:bg-[#FFF9F5]"
                >
                  ⚡ Versão Rápida
                </Button>
              )}
              {recipe.variations.economical && (
                <Button
                  variant="outline"
                  onClick={() => setActiveVariation(activeVariation === 'economical' ? null : 'economical')}
                  className="border-[#CFA450] hover:bg-[#FFF9F5]"
                >
                  💰 Versão Económica
                </Button>
              )}
              {recipe.variations.healthy && (
                <Button
                  variant="outline"
                  onClick={() => setActiveVariation(activeVariation === 'healthy' ? null : 'healthy')}
                  className="border-[#CFA450] hover:bg-[#FFF9F5]"
                >
                  🥗 Versão Saudável
                </Button>
              )}
            </div>
            
            {activeVariation && (
              <div className="mt-3 p-4 bg-[#FFF9F5] rounded-lg border border-[#CFA450]/30">
                <p className="text-gray-700">{recipe.variations[activeVariation]}</p>
              </div>
            )}
          </div>
        )}

        {/* Chef Tips */}
        {recipe.chefTips && recipe.chefTips.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-bold text-[#1F4E3D] mb-3 flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Truques do Chef Matuke
            </h3>
            <ul className="space-y-2">
              {recipe.chefTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <span className="text-[#C45C33] font-bold">💡</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Video Suggestions */}
        {recipe.videoSuggestions && recipe.videoSuggestions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-bold text-[#1F4E3D] mb-3">Vídeos Relacionados</h3>
            <div className="space-y-2">
              {recipe.videoSuggestions.map((video, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">📺 {video}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-[#CFA450]/30">
          <Button
            onClick={handleAddToPlanner}
            className="bg-[#1F4E3D] hover:bg-[#163A2D] text-white"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Adicionar ao Planeamento
          </Button>
          <Button
            onClick={handleAddToShoppingList}
            className="bg-[#C45C33] hover:bg-[#A54A28] text-white"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Adicionar à Lista de Compras
          </Button>
          <Button
            onClick={handleSaveRecipe}
            disabled={saving || saved}
            className="bg-[#CFA450] hover:bg-[#B8934A] text-white"
          >
            <BookmarkPlus className="h-4 w-4 mr-2" />
            {saved ? 'Guardada!' : saving ? 'A guardar...' : 'Guardar Receita'}
          </Button>
        </div>
      </div>
    </div>
  )
}
