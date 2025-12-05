import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, userRestrictions } = await request.json()

    // Verificação melhorada da chave API
    const apiKey = process.env.OPENAI_API_KEY
    
    if (!apiKey || apiKey.trim() === '' || apiKey === 'sk-proj-...') {
      console.error('❌ OPENAI_API_KEY não configurada ou inválida')
      return NextResponse.json(
        { error: 'Chave da OpenAI não configurada. Verifica se a chave da OpenAI está configurada no arquivo .env.local' },
        { status: 500 }
      )
    }

    console.log('✅ Chave API encontrada, analisando imagem...')

    const openai = new OpenAI({
      apiKey: apiKey
    })

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analisa esta imagem e identifica:
1. Se são ingredientes, lista-os
2. Se é um prato pronto, sugere a receita
3. Se é uma sobremesa, dá a receita

Restrições do usuário: ${userRestrictions?.join(', ') || 'Nenhuma'}

Retorna em JSON com esta estrutura:
{
  "type": "ingredients|dish|dessert|mixed",
  "message": "descrição do que vês",
  "items": ["item1", "item2"] (se forem ingredientes),
  "recipe": {
    "title": "Nome",
    "description": "descrição",
    "prepTime": "30 minutos",
    "difficulty": "Fácil|Médio|Difícil",
    "servings": 4,
    "ingredients": [{"name": "ingrediente", "quantity": "200g", "isRestricted": false}],
    "steps": ["passo 1", "passo 2"],
    "variations": {"quick": "versão rápida", "economical": "versão económica", "healthy": "versão saudável"},
    "chefTips": ["dica 1", "dica 2"]
  },
  "warnings": ["aviso se houver ingrediente restrito"],
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

    const content = response.choices[0].message.content
    if (!content) {
      return NextResponse.json(
        { error: 'Resposta vazia da API' },
        { status: 500 }
      )
    }

    console.log('✅ Imagem analisada com sucesso')
    const result = JSON.parse(content)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('❌ Erro ao analisar imagem:', error)
    
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
      { error: error.message || 'Erro ao analisar imagem. Verifica se a chave da OpenAI está configurada.' },
      { status: 500 }
    )
  }
}
