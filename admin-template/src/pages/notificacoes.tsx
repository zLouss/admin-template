import Layout from '@/components/template/Layout'
import useAppData from '@/data/hook/UseAppData'

export default function Notificacoes() {

  const { alternarTema } = useAppData()

  return (
    <Layout titulo="Notificações" subtitulo="Gerencie suas notificações">
      <button onClick={alternarTema}>Alternar Tema</button>
    </Layout>
  )
}