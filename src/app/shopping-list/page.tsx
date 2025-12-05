'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Download, Trash2, Plus } from 'lucide-react'
import { ShoppingList, ShoppingItem } from '@/lib/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ShoppingListPage() {
  const router = useRouter()
  const [lists, setLists] = useState<ShoppingList[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (userId) {
      loadLists()
    }
  }, [userId])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUserId(user.id)
  }

  const loadLists = async () => {
    if (!userId) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setLists(data || [])
    } catch (error: any) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const toggleItem = async (listId: string, itemIndex: number) => {
    const list = lists.find(l => l.id === listId)
    if (!list) return

    const updatedItems = [...list.items]
    updatedItems[itemIndex].checked = !updatedItems[itemIndex].checked

    try {
      const { error } = await supabase
        .from('shopping_lists')
        .update({ items: updatedItems })
        .eq('id', listId)

      if (error) throw error

      setLists(lists.map(l => 
        l.id === listId ? { ...l, items: updatedItems } : l
      ))
    } catch (error: any) {
      alert(error.message)
    }
  }

  const exportToPDF = (list: ShoppingList) => {
    // Simular exportação para PDF
    const content = `
LISTA DE COMPRAS - ${list.name}
${list.start_date ? `Período: ${new Date(list.start_date).toLocaleDateString('pt-AO')} - ${new Date(list.end_date!).toLocaleDateString('pt-AO')}` : ''}

${list.items.map((item, i) => 
  `${i + 1}. ${item.checked ? '✓' : '☐'} ${item.name} - ${item.quantity} ${item.unit}`
).join('\n')}

Total de itens: ${list.items.length}
Itens marcados: ${list.items.filter(i => i.checked).length}
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lista-compras-${list.name.toLowerCase().replace(/\s+/g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)

    alert('Lista exportada com sucesso! 📄')
  }

  const getProgress = (items: ShoppingItem[]) => {
    const checked = items.filter(i => i.checked).length
    return Math.round((checked / items.length) * 100)
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
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 text-[#1F4E3D]">Listas de Compras</h2>
          <p className="text-gray-600">
            Gere e gere as tuas listas de compras
          </p>
        </div>

        {lists.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {lists.map(list => (
              <Card key={list.id} className="border border-[#CFA450]/30">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-2 text-[#1F4E3D]">{list.name}</CardTitle>
                      {list.start_date && (
                        <p className="text-sm text-gray-600">
                          {new Date(list.start_date).toLocaleDateString('pt-AO')} - {new Date(list.end_date!).toLocaleDateString('pt-AO')}
                        </p>
                      )}
                    </div>
                    <Badge variant={list.is_completed ? 'default' : 'secondary'} className="bg-[#C45C33] text-white">
                      {getProgress(list.items)}% completo
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
                    {list.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 hover:bg-[#FFF9F5] rounded">
                        <Checkbox
                          checked={item.checked}
                          onCheckedChange={() => toggleItem(list.id, index)}
                          className="border-[#CFA450] data-[state=checked]:bg-[#C45C33] data-[state=checked]:border-[#C45C33]"
                        />
                        <div className="flex-1">
                          <p className={`font-medium ${item.checked ? 'line-through text-gray-500' : 'text-[#1F4E3D]'}`}>
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} {item.unit}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => exportToPDF(list)}
                      variant="outline"
                      className="flex-1 border-[#CFA450] text-[#1F4E3D] hover:bg-[#FFF9F5]"
                    >
                      <Download className="mr-2 h-4 w-4 text-[#CFA450]" />
                      Exportar PDF
                    </Button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[#CFA450]/30">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total de itens:</span>
                      <span className="font-semibold text-[#1F4E3D]">{list.items.length}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">Itens marcados:</span>
                      <span className="font-semibold text-[#C45C33]">
                        {list.items.filter(i => i.checked).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold mb-2 text-[#1F4E3D]">Nenhuma lista de compras</h3>
            <p className="text-gray-600 mb-4">
              Cria um plano de refeições para gerar uma lista automaticamente
            </p>
            <Link href="/meal-planner">
              <Button className="bg-[#C45C33] hover:bg-[#A54A28] text-white shadow-lg">
                <Plus className="mr-2 h-4 w-4" />
                Ir para Planeador
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
