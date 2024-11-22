'use client'

import PageLoader from '@/components/page-loader'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { fetcher } from '@/lib/fetcher'
import { ClientsResponse } from '@/lib/types'
import { PlusIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { notFound } from 'next/navigation'
import useSWR from 'swr'
import { useUser } from '../user-provider'
import ClientDialog from './clients-dialog'

export default function Page() {
  const {
    data: clients,
    error,
    isLoading,
    mutate,
  } = useSWR<ClientsResponse>('/api/clients', fetcher)

  const t = useTranslations('Clients')

  const user = useUser()

  if (user?.role !== 'MANAGER') {
    notFound()
  }

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <Card className="mx-auto max-w-4xl rounded-none xs:rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl">{t('title')}</CardTitle>
        <CardDescription>{t('caption')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {clients?.map((client, index) => (
          <ClientDialog
            key={JSON.stringify(client)}
            type="edit"
            id={client.id}
            name={client.name}
            email={client.email}
            phoneNumber={client.phoneNumber}
            onDone={mutate}
          >
            <Button key={client.id} variant="secondary">
              {client.name}
            </Button>
          </ClientDialog>
        ))}
        <ClientDialog type="add" onDone={mutate}>
          <Button variant="secondary" size="icon">
            <PlusIcon />
          </Button>
        </ClientDialog>
      </CardContent>
    </Card>
  )
}
