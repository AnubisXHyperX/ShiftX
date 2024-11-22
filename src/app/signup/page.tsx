'use client'

import ButtonLoader from '@/components/button-loader'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

export default function Page() {
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const t = useTranslations('SignUp')

  const formSchema = z.object({
    name: z.string().min(5, ''),
    hebrewName: z.string().min(5, ''),
    email: z.string().email(''),
    password: z.string().min(4, ''),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)

    const response = await fetch(`/api/signup`, {
      method: 'POST',
      body: JSON.stringify(values),
    })

    if (!response.ok) {
      setLoading(false)
      return
    }

    if (response.redirected) {
      router.push(response.url)
      router.refresh()
    }
  }

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">{t('title')}</CardTitle>
        <CardDescription>{t('caption')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('name')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hebrewName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('hebrewName')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('email')}</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('password')}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button className="w-full" type="submit">
              <ButtonLoader isLoading={loading}>{t('signUp')}</ButtonLoader>
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          {t('hasAccount')}{' '}
          <Link href="/login" className="underline">
            {t('signIn')}
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
