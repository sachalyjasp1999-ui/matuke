import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const { query, userRestrictions } = await request.json()

    // Verificação melhorada da chave API
    const apiKey = process.env.OPENAI_API_KEY
    
    if (!apiKey || apiKey.trim() === '' || apiKey === 'sk-proj-...') {
      console.error('❌ OPENAI_API_KEY não configurada ou inválida')
      return NextResponse.json(
        { error: 'Chave da OpenAI não configurada. Verifica se a chave da OpenAI está configurada no arquivo .env.local' },
        { status: 500 }
      )
    }

    console.log('✅ Chave API encontrada, iniciando chamada...')

    const openai = new OpenAI({
      apiKey: apiKey
    })

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

    const content = response.choices[0].message.content
    if (!content) {
      return NextResponse.json(
        { error: 'Resposta vazia da API' },
        { status: 500 }
      )
    }

    console.log('✅ Resposta recebida da OpenAI')
    const result = JSON.parse(content)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('❌ Erro ao analisar texto:', error)
    
    // Mensagens de erro mais específicas
    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'Chave da OpenAI inválida. Verifica se copiaste a chave completa.' },
        { status: 401 }
      )
    }
    
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'Quota da OpenAI excedida. Verifica o teu saldo na OpenAI.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao analisar texto. Verifica se a chave da OpenAI está configurada.' },
      { status: 500 }
    )
  }
}
