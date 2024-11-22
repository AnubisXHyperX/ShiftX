import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { validateRequest } from '@/lib/auth'
import Greet from './greet'
import UserFlights from './userFlights'

export default async function Page() {
  const { user } = await validateRequest()

  return (
    <Card className="mx-auto xs:max-w-lg rounded-none xs:rounded-lg">
      <CardHeader>
        <CardTitle className="text-xl">
          <Greet name={user ? user.name : undefined} />
        </CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      {/* {user?.role === 'MANAGER' && ( */}
      <CardContent className="flex flex-col gap-6">
        <UserFlights />
      </CardContent>
      {/* )} */}
    </Card>
  )
}
