import route from 'next/router'
import { JSXElementConstructor, PromiseLikeOfReactNode, ReactElement, ReactNode, ReactPortal, createContext, useEffect, useState } from 'react'
import firebase from '../../firebase/config'
import Usuario from '@/model/Usuario'
import Cookies from 'js-cookie'

interface AuthContextProps {
    usuario?: Usuario
    loginGoogle?: () => Promise<void>
    cadastrar: (email: string, senha: string) => Promise<void>
    login: (email: string, senha: string) => Promise<void>
    logout: () => Promise<void>
    carregando?: boolean
}

const AuthContext = createContext<AuthContextProps>({
    cadastrar: function (email: string, senha: string): Promise<void> {
        throw new Error('Function not implemented.')
    },
    login: function (email: string, senha: string): Promise<void> {
        throw new Error('Function not implemented.')
    },
    logout: function (): Promise<void> {
        throw new Error('Function not implemented.')
    }
})

async function usuarioNormalizado(usuarioFirebase: firebase.User): Promise<Usuario> {
    const token = await usuarioFirebase.getIdToken()
    return {
        uid: usuarioFirebase.uid,
        nome: usuarioFirebase.displayName ?? "",
        email: usuarioFirebase.email ?? "",
        token,
        provedor: usuarioFirebase.providerData[0]?.providerId,
        imagemUrl: usuarioFirebase.photoURL ?? ""
    }
}

function gerenciarCookie(logado: string) {
    if (logado === 'true') {
        Cookies.set('admin-template-auth', logado, {
            expires: 7
        })
    } else {
        Cookies.remove('admin-template-auth')
    }
}

export function AuthProvider(props: any) {
    const [carregando, setCarregando] = useState(true)
    const [usuario, setUsuario] = useState<Usuario>()

    async function configurarSessao(usuarioFirebase: firebase.User | null) {
        if (usuarioFirebase?.email) {
            const usuario = await usuarioNormalizado(usuarioFirebase)
            setUsuario(usuario)
            gerenciarCookie('true')
            setCarregando(false)
            return usuario.email
        } else {
            setUsuario(undefined)
            gerenciarCookie('false')
            setCarregando(false)
            return false
        }
    }

    async function login(email: string, senha: string) {
        try {
            setCarregando(true)
            const resp = await firebase.auth().signInWithEmailAndPassword(email, senha)
            await configurarSessao(resp.user)
            route.push('/')
        } finally {
            setCarregando(false)
        }
    }
    
    async function cadastrar(email: string, senha: string) {
        try {
            setCarregando(true)
            const resp = await firebase.auth().createUserWithEmailAndPassword(email, senha)
            await configurarSessao(resp.user)
            route.push('/')
        } finally {
            setCarregando(false)
        }
    }

    async function loginGoogle() {
        try {
            setCarregando(true)
            const resp = await firebase.auth().signInWithPopup(
                new firebase.auth.GoogleAuthProvider()
            )
            await configurarSessao(resp.user)
            route.push('/')
        } finally {
            setCarregando(false)
        }
    }

    async function logout() {
        try {
            setCarregando(true)
            await firebase.auth().signOut()
            await configurarSessao(null)
        } finally {
            setCarregando(false)
        }
    }

    useEffect(() => {
        if (Cookies.get('admin-template-auth')) {
            const cancelar = firebase.auth().onIdTokenChanged(configurarSessao)
            return () => cancelar()
        } else {
            setCarregando(false)
        }
    }, [])

    return (
        <AuthContext.Provider value={{
            usuario,
            cadastrar,
            login,
            loginGoogle,
            logout,
            carregando
        }}>
            {props.children}
        </AuthContext.Provider>
    )
}

export default AuthContext