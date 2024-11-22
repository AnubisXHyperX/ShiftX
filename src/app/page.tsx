'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import Greet from './greet'
import { useUser } from './user-provider'
import UserFlights from './userFlights'

export default function Page() {
  const user = useUser()


  const t = useTranslations('Index')

  const isHebrew = t('lang') === 'en'

  return (
    <Card className="mx-auto xs:max-w-lg rounded-none xs:rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl">
          <Greet name={isHebrew && user && user.hebrewName ? user.name : user?.hebrewName} />
        </CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      {/* {user?.role === 'MANAGER' && ( */}
      {user && (
        <CardContent className="flex flex-col gap-6">
          <UserFlights />
        </CardContent>
      )}
    </Card>
  )
}
