import Layout from '@/components/template/Layout'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <Layout titulo="Página Inicial" subtitulo="Em construção...">
      <h3>Conteúdo</h3>
    </Layout>
  )
}
