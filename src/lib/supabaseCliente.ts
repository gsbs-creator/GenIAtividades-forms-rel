import { createClient } from '@supabase/supabase-js'

// Pega as credenciais que guardamos no arquivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validação para garantir que as chaves foram encontradas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("As variáveis de ambiente do Supabase não foram definidas!")
}

// AQUI ESTÁ O PONTO-CHAVE: A palavra 'export' na frente da constante
// torna ela "pública" e "importável" por outros arquivos.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)