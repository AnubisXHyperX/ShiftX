import Footer from '@/components/footer'
import Navbar from '@/components/navbar'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { validateRequest } from '@/lib/auth'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Inter } from 'next/font/google'
import { getLangDir } from 'rtl-detect'
import './globals.css'
import RadixDirectionProvider from './radix-direction-provider'
import { UserProvider } from './user-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Farmer',
  description: 'Created by farmers for farmers',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user } = await validateRequest()

  const locale = await getLocale()

  const messages = await getMessages()

  const dir = getLangDir(locale)

  return (
    <html lang={locale} suppressHydrationWarning={true}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta name="description" content="For farmers, By farmers." />
        <meta property="og:title" content="Farmer" />
        <meta property="og:description" content="For farmers, By farmers." />
        <meta property="og:image" content="https://cool-workable-robin.ngrok-free.app/favicon.ico" />
        <meta property="og:url" content="https://cool-workable-robin.ngrok-free.app" />
        <meta property="og:type" content="website" />
      </head>
      <body
        className={inter.className}
        suppressHydrationWarning={true}
        dir={dir}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen justify-between flex flex-col bg-primary/90 dark:bg-primary/30">
            <NextIntlClientProvider messages={messages}>
              <RadixDirectionProvider dir={dir}>
                <UserProvider user={user}>
                  <div>
                    <Navbar />
                    <div className="py-6 xs:px-6 transition-all">
                      {children}
                    </div>
                  </div>
                  <Footer />
                </UserProvider>
              </RadixDirectionProvider>
            </NextIntlClientProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
