// src/lib/openai.ts
import OpenAI from 'openai'

/**
 * IMPORTANTE:
 * - Usa process.env.OPENAI_API_KEY (server-side). NÃO uses NEXT_PUBLIC_OPENAI_API_KEY.
 * - Este ficheiro deve ser utilizado apenas no servidor (API routes / server side).
 * - Se importares isto no client, vais expor a chave. Não faças isso.
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

export default openai

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
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analisa esta imagem e identifica:
1. Se são ingredientes crus, prato pronto, bolo/sobremesa ou mistura
2. Lista os itens identificados
3. Gera uma receita COMPLETA e REALISTA em português de Portugal

Restrições do usuário: ${userRestrictions?.join(', ') || 'Nenhuma'}

Retorna em JSON com esta estrutura:
{
  "type": "ingredients|dish|dessert|mixed",
  "message": "frase introdutória",
  "items": ["item1", "item2"],
  "recipe": {
    "title": "Nome da Receita",
    "description": "Descrição curta",
    "prepTime": "30 minutos",
    "difficulty": "Fácil|Médio|Difícil",
    "servings": 4,
    "ingredients": [{"name": "ingrediente", "quantity": "200g", "isRestricted": false}],
    "steps": ["Passo 1", "Passo 2"],
    "variations": {
      "quick": "versão rápida",
      "economical": "versão económica",
      "healthy": "versão saudável"
    },
    "chefTips": ["dica 1", "dica 2"],
    "videoSuggestions": ["sugestão de vídeo"]
  },
  "warnings": ["aviso sobre ingrediente restrito"],
  "substitutions": [{"ingredient": "X", "substitute": "Y"}]
}`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64
              }
            }
          ]
        }
      ],
      max_tokens: 2000
    })

    const content = response.choices?.[0]?.message?.content
    if (!content) throw new Error('Resposta vazia da API')

    const result = JSON.parse(content)
    return result
  } catch (error) {
    console.error('Erro ao analisar imagem:', error)
    throw error
  }
}

export async function analyzeTextQuery(query: string, userRestrictions?: string[]): Promise<AnalysisResult> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: `Analisa este pedido: "${query}"

Restrições do usuário: ${userRestrictions?.join(', ') || 'Nenhuma'}

Gera uma receita COMPLETA e REALISTA em português de Portugal.

Retorna em JSON com esta estrutura:
{
  "type": "text",
  "message": "Entendi o teu pedido...",
  "recipe": {
    "title": "Nome da Receita",
    "description": "Descrição curta",
    "prepTime": "30 minutos",
    "difficulty": "Fácil|Médio|Difícil",
    "servings": 4,
    "ingredients": [{"name": "ingrediente", "quantity": "200g", "isRestricted": false}],
    "steps": ["Passo 1", "Passo 2"],
    "variations": {
      "quick": "versão rápida",
      "economical": "versão económica",
      "healthy": "versão saudável"
    },
    "chefTips": ["dica 1", "dica 2"]
  },
  "warnings": ["aviso sobre ingrediente restrito"],
  "substitutions": [{"ingredient": "X", "substitute": "Y"}]
}`
        }
      ],
      max_tokens: 2000
    })

    const content = response.choices?.[0]?.message?.content
    if (!content) throw new Error('Resposta vazia da API')

    const result = JSON.parse(content)
    return result
  } catch (error) {
    console.error('Erro ao analisar texto:', error)
    throw error
  }
}

/**
 * Transcrição de áudio:
 * - Este exemplo usa fetch para a API de transcrições da OpenAI com a chave do servidor.
 * - IMPORTANTE: esta função também deve ser chamada a partir do servidor (API route). 
 *   Se fizermos fetch para a OpenAI com a chave aqui no client, a chave fica exposta.
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.webm')
    formData.append('model', 'whisper-1')
    formData.append('language', 'pt')

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        // usa a variável do servidor — isto só funciona se executado server-side
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: formData
    })

    const data = await response.json()
    return data.text
  } catch (error) {
    console.error('Erro ao transcrever áudio:', error)
    throw error
  }
}
