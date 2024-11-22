import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { Trash2Icon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import ButtonLoader from './button-loader'

export const DELETE_RESOURCE = async (endpoint: string) => {
  const response = await fetch(endpoint, {
    method: 'DELETE',
  })

  if (!response.ok) {
    console.log(await response.json())
  }
}

interface DeleteButtonProps {
  variant: 'ghost' | 'destructive'
  action: () => Promise<void>
  onDone: () => void
}

function DeleteButton(props: DeleteButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const t = useTranslations('Pallets')

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant={props.variant} size="icon">
          <ButtonLoader isLoading={isLoading}>
            <Trash2Icon />
          </ButtonLoader>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('alertTitle')}</AlertDialogTitle>
          {/* <AlertDialogDescription>
            {t('deleteAlertDescription')}
          </AlertDialogDescription> */}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('alertCancel')}</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: 'destructive' })}
            onClick={async () => {
              setIsLoading(true)

              await props.action()

              props.onDone()

              setIsLoading(false)
            }}
          >
            {t('alertAccept')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteButton
