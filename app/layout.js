import './globals.css'
import Sparkles from './Sparkles'

export const metadata = {
  title: 'Ma boîte aux lettres',
  description: 'Des mots doux, scellés rien que pour moi',
  robots: { index: false, follow: false },
}
export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' }

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="bg" />
        <div className="veil" />
        <Sparkles />
        {children}
      </body>
    </html>
  )
}
