'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Camera, Upload, Mic, Loader2, X, History } from 'lucide-react'
import { analyzeImageWithVision, analyzeTextQuery, transcribeAudio, AnalysisResult } from '@/lib/openai'
import { RecipeDisplay } from './recipe-display'
import { supabase } from '@/lib/supabase'

interface SearchHistory {
  query: string
  timestamp: Date
  type: 'text' | 'image' | 'voice'
}

export function MultimodalInput() {
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [textInput, setTextInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [userRestrictions, setUserRestrictions] = useState<string[]>([])
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setMounted(true)
    return () => {
      setMounted(false)
      // Cleanup: cancelar requisições pendentes
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      // Parar gravação se estiver ativa
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    let cancelled = false

    const loadData = async () => {
      try {
        await loadUserRestrictions(cancelled)
        loadSearchHistory()
      } catch (error) {
        if (!cancelled) {
          console.error('Erro ao carregar dados:', error)
        }
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [mounted])

  const loadUserRestrictions = async (cancelled: boolean = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || cancelled) return

      const { data: profile } = await supabase
        .from('user_profile')
        .select('dietary_restrictions, allergies')
        .eq('id', user.id)
        .single()

      if (profile && !cancelled) {
        const restrictions = [
          ...(profile.dietary_restrictions || []),
          ...(profile.allergies || [])
        ]
        setUserRestrictions(restrictions)
      }
    } catch (error) {
      if (!cancelled) {
        console.error('Erro ao carregar restrições:', error)
      }
    }
  }

  const loadSearchHistory = () => {
    try {
      const stored = localStorage.getItem('matuke_search_history')
      if (stored) {
        const history = JSON.parse(stored)
        setSearchHistory(history.slice(0, 5))
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    }
  }

  const saveToHistory = (query: string, type: 'text' | 'image' | 'voice') => {
    try {
      const newHistory = [
        { query, timestamp: new Date(), type },
        ...searchHistory
      ].slice(0, 5)
      
      setSearchHistory(newHistory)
      localStorage.setItem('matuke_search_history', JSON.stringify(newHistory))
    } catch (error) {
      console.error('Erro ao salvar histórico:', error)
    }
  }

  const analyzeImage = async (imageFile: File) => {
    if (!mounted) return
    
    setAnalyzing(true)
    setResult(null)

    // Criar novo AbortController para esta requisição
    abortControllerRef.current = new AbortController()

    try {
      // Criar preview da imagem
      const reader = new FileReader()
      reader.onload = async (e) => {
        if (!mounted) return
        
        const base64Image = e.target?.result as string
        setSelectedImage(base64Image)

        try {
          const analysisResult = await analyzeImageWithVision(base64Image, userRestrictions)
          if (mounted) {
            setResult(analysisResult)
            saveToHistory('Análise de imagem', 'image')
          }
        } catch (error: any) {
          if (mounted && error.name !== 'AbortError') {
            console.error('Erro na análise:', error)
            alert('Erro ao analisar imagem. Verifica se a chave da OpenAI está configurada.')
          }
        } finally {
          if (mounted) {
            setAnalyzing(false)
          }
        }
      }
      reader.readAsDataURL(imageFile)
    } catch (error) {
      if (mounted) {
        console.error('Erro ao processar imagem:', error)
        setAnalyzing(false)
      }
    }
  }

  const analyzeText = async (text: string) => {
    if (!mounted) return
    
    setAnalyzing(true)
    setResult(null)

    // Criar novo AbortController para esta requisição
    abortControllerRef.current = new AbortController()

    try {
      const analysisResult = await analyzeTextQuery(text, userRestrictions)
      if (mounted) {
        setResult(analysisResult)
        saveToHistory(text, 'text')
      }
    } catch (error: any) {
      if (mounted && error.name !== 'AbortError') {
        console.error('Erro na análise:', error)
        alert('Erro ao analisar texto. Verifica se a chave da OpenAI está configurada.')
      }
    } finally {
      if (mounted) {
        setAnalyzing(false)
      }
    }
  }

  const handleTextSubmit = () => {
    if (textInput.trim() && mounted) {
      analyzeText(textInput)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && mounted) {
      analyzeImage(file)
    }
  }

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && mounted) {
      analyzeImage(file)
    }
  }

  const handleVoiceInput = async () => {
    if (!mounted) return
    
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        audioChunksRef.current = []

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data)
        }

        mediaRecorder.onstop = async () => {
          if (!mounted) {
            stream.getTracks().forEach(track => track.stop())
            return
          }
          
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          
          setAnalyzing(true)
          try {
            const transcription = await transcribeAudio(audioBlob)
            if (mounted) {
              setTextInput(transcription)
              await analyzeText(transcription)
              saveToHistory(transcription, 'voice')
            }
          } catch (error: any) {
            if (mounted && error.name !== 'AbortError') {
              console.error('Erro ao transcrever:', error)
              alert('Erro ao transcrever áudio. Verifica se a chave da OpenAI está configurada.')
            }
          } finally {
            if (mounted) {
              setAnalyzing(false)
            }
          }
          
          stream.getTracks().forEach(track => track.stop())
        }

        mediaRecorder.start()
        setIsRecording(true)
      } catch (error) {
        if (mounted) {
          console.error('Erro ao acessar microfone:', error)
          alert('Não foi possível acessar o microfone. Verifica as permissões.')
        }
      }
    } else {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
        setIsRecording(false)
      }
    }
  }

  const clearResult = () => {
    if (!mounted) return
    setResult(null)
    setSelectedImage(null)
    setTextInput('')
  }

  const handleHistoryClick = (item: SearchHistory) => {
    if (!mounted) return
    
    if (item.type === 'text' || item.type === 'voice') {
      setTextInput(item.query)
      analyzeText(item.query)
    }
    setShowHistory(false)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="border-[#CFA450] text-[#1F4E3D] hover:bg-[#FFF9F5]"
          >
            <History className="h-4 w-4 mr-2" />
            Histórico de Pesquisas
          </Button>

          {showHistory && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-lg border-2 border-[#CFA450] shadow-lg p-4 z-10">
              <h3 className="font-semibold text-[#1F4E3D] mb-3">Últimas 5 pesquisas</h3>
              <div className="space-y-2">
                {searchHistory.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleHistoryClick(item)}
                    className="w-full text-left p-2 hover:bg-[#FFF9F5] rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {item.type === 'image' ? '📷' : item.type === 'voice' ? '🎤' : '✍️'}
                      </span>
                      <span className="text-sm text-gray-700 flex-1 truncate">{item.query}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Camera Icon with Scanner Effect */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Button
            size="lg"
            onClick={() => cameraInputRef.current?.click()}
            disabled={analyzing}
            className="h-32 w-32 rounded-full bg-gradient-to-br from-[#C45C33] to-[#A54A28] hover:from-[#A54A28] hover:to-[#8A3D20] shadow-2xl transition-all hover:scale-105 disabled:opacity-50"
          >
            <Camera className="h-16 w-16 text-white" />
          </Button>
          
          {!analyzing && (
            <>
              <div className="absolute inset-0 rounded-full border-4 border-[#CFA450] animate-ping opacity-20"></div>
              <div className="absolute inset-0 rounded-full border-2 border-[#CFA450] animate-pulse"></div>
            </>
          )}
          
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraCapture}
            className="hidden"
          />
        </div>

        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={analyzing}
          className="border-[#CFA450] text-[#1F4E3D] hover:bg-[#FFF9F5]"
        >
          <Upload className="h-5 w-5 mr-2" />
          Carregar da galeria
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Search Bar with Voice */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            placeholder="Escreve o que tens ou o que queres fazer..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
            disabled={analyzing}
            className="pr-12 border-[#CFA450] focus:ring-[#C45C33]"
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={handleVoiceInput}
            disabled={analyzing}
            className={`absolute right-1 top-1/2 -translate-y-1/2 ${
              isRecording ? 'text-red-500 animate-pulse' : 'text-[#C45C33]'
            }`}
          >
            <Mic className="h-5 w-5" />
          </Button>
        </div>
        <Button
          onClick={handleTextSubmit}
          disabled={!textInput.trim() || analyzing}
          className="bg-[#C45C33] hover:bg-[#A54A28] text-white"
        >
          Analisar
        </Button>
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="flex items-center justify-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-red-700 font-medium">A gravar... Clique no microfone para parar</span>
        </div>
      )}

      {/* Analysis Status */}
      {analyzing && (
        <div className="flex items-center justify-center gap-3 p-6 bg-[#FFF9F5] rounded-lg border border-[#CFA450]/30">
          <Loader2 className="h-6 w-6 animate-spin text-[#C45C33]" />
          <span className="text-[#1F4E3D] font-medium">A analisar e gerar receita completa...</span>
        </div>
      )}

      {/* Selected Image Preview */}
      {selectedImage && !analyzing && (
        <div className="relative">
          <img 
            src={selectedImage} 
            alt="Imagem selecionada" 
            className="w-full h-64 object-cover rounded-lg border-2 border-[#CFA450]"
          />
        </div>
      )}

      {/* Analysis Result with Recipe */}
      {result && !analyzing && (
        <div className="space-y-4">
          <div className="relative p-6 bg-white rounded-lg border-2 border-[#CFA450] shadow-lg">
            <Button
              size="icon"
              variant="ghost"
              onClick={clearResult}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
            
            <div className="pr-8">
              <p className="text-[#1F4E3D] font-semibold text-lg mb-3">{result.message}</p>
              {result.items && result.items.length > 0 && (
                <ul className="space-y-2 mb-4">
                  {result.items.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-700">
                      <span className="h-2 w-2 bg-[#C45C33] rounded-full"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Recipe Display */}
          {result.recipe && (
            <RecipeDisplay 
              recipe={result.recipe}
              warnings={result.warnings}
              substitutions={result.substitutions}
            />
          )}
        </div>
      )}
    </div>
  )
}
