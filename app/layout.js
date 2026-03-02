import './globals.css'

export const metadata = {
  title: 'BridgeWay',
  description: 'Find community resources near you',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}