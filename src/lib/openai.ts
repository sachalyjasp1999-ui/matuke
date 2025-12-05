export interface Recipe {
  title: string
  description?: string
  prepTime: string
  difficulty: 'Fácil' | 'Médio' | 'Difícil'
  servings: number
  ingredients: Array<{
    name: string
    quantity: string
    isRestricted?: boolean
  }>
  steps: string[]
  variations: {
    quick?: string
    economical?: string
    healthy?: string
  }
  chefTips: string[]
  videoSuggestions?: string[]
}

export interface AnalysisResult {
  type: 'ingredients' | 'dish' | 'dessert' | 'text' | 'mixed'
  message: string
  items?: string[]
  recipe?: Recipe
  warnings?: string[]
  substitutions?: Array<{
    ingredient: string
    substitute: string
  }>
}

export async function analyzeImageWithVision(imageBase64: string, userRestrictions?: string[]): Promise<AnalysisResult> {
  try {
    const response = await fetch('/api/analyze-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageBase64,
        userRestrictions
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao analisar imagem')
    }

    return await response.json()
  } catch (error) {
    console.error('Erro ao analisar imagem:', error)
    throw error
  }
}

export async function analyzeTextQuery(query: string, userRestrictions?: string[]): Promise<AnalysisResult> {
  try {
    const response = await fetch('/api/analyze-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        userRestrictions
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao analisar texto')
    }

    return await response.json()
  } catch (error) {
    console.error('Erro ao analisar texto:', error)
    throw error
  }
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.webm')

    const response = await fetch('/api/transcribe-audio', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao transcrever áudio')
    }

    const data = await response.json()
    return data.text
  } catch (error) {
    console.error('Erro ao transcrever áudio:', error)
    throw error
  }
}
