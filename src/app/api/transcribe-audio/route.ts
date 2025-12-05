import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }

    // Verificação melhorada da chave API
    const apiKey = process.env.OPENAI_API_KEY
    
    if (!apiKey || apiKey.trim() === '' || apiKey === 'sk-proj-...') {
      console.error('❌ OPENAI_API_KEY não configurada ou inválida')
      return NextResponse.json(
        { error: 'Chave da OpenAI não configurada. Verifica se a chave da OpenAI está configurada no arquivo .env.local' },
        { status: 500 }
      )
    }

    console.log('✅ Chave API encontrada, transcrevendo áudio...')

    const openai = new OpenAI({
      apiKey: apiKey
    })

    const response = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'pt'
    })

    console.log('✅ Áudio transcrito com sucesso')
    return NextResponse.json({ text: response.text })
  } catch (error: any) {
    console.error('❌ Erro ao transcrever áudio:', error)
    
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
      { error: error.message || 'Erro ao transcrever áudio. Verifica se a chave da OpenAI está configurada.' },
      { status: 500 }
    )
  }
}
