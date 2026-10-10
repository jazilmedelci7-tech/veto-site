// Protection provisoire : le vrai système de connexion se fera avec le backend (voir README).
const PASSWORD: string = import.meta.env.VITE_ADMIN_PASSWORD ?? 'veto2026'
export const isAuth = () => sessionStorage.getItem('vet-auth') === '1'
export const login = (p: string) => { if (p === PASSWORD) { sessionStorage.setItem('vet-auth', '1'); return true } return false }
export const logout = () => sessionStorage.removeItem('vet-auth')
