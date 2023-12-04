import './globals.css'
import { Inter } from 'next/font/google'
import { ToolSwitcherProvider } from './context/toolSwitcherContext';
import "prismjs/themes/prism-dark.css";
import { ThemeProvider } from "@/components/themeProvider"

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Chatbot',
  description: 'Created by Jean-Marcel Galloy',
}

export default function RootLayout({ children }) {
  return (

    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ToolSwitcherProvider>
            {children}
          </ToolSwitcherProvider>
        </ThemeProvider>
      </body>
    </html>

  )
}
