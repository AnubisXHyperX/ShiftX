import ButtonLoader from '@/components/button-loader'
import DeleteButton, { DELETE_RESOURCE } from '@/components/delete-button'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { CheckIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { PropsWithChildren, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

interface AddDialogProps {
  type: 'add'
  onDone: () => void
}

interface EditDialogProps {
  type: 'edit'
  id: string
  name: string
  email: string
  phoneNumber: string
  onDone: () => void
}

function ClientDialog(
  props: PropsWithChildren<AddDialogProps | EditDialogProps>
) {
  const defaultValues = () => {
    switch (props.type) {
      case 'add':
        return {
          name: '',
          email: '',
          phoneNumber: '',
        }
      case 'edit':
        return {
          name: props.name,
          email: props.email,
          phoneNumber: props.phoneNumber,
        }
    }
  }

  const formSchema = z.object({
    name: z.string().optional(),
    email: z.string(),
    phoneNumber: z.string(),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues(),
  })

  const [loading, setLoading] = useState(false)

  const [open, setOpen] = useState(false)

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)

    switch (props.type) {
      case 'add': {
        const response = await fetch(`/api/clients`, {
          method: 'POST',
          body: JSON.stringify({
            name: values.name,
            email: values.email,
            phoneNumber: values.phoneNumber,
          }),
        })

        if (!response.ok) {
          console.log(await response.json())
        }
        break
      }
      case 'edit': {
        const response = await fetch(`/api/clients/${props.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            id: props.id,
            name: values.name,
            email: values.email,
            phoneNumber: values.phoneNumber,
          }),
        })

        if (!response.ok) {
          console.log(await response.json())
        }
        break
      }
    }

    setOpen(false)

    props.onDone()
  }

  const t = useTranslations('Clients')

  const title = () => {
    switch (props.type) {
      case 'add':
        return `${t('newItem')}`
      case 'edit':
        return `${t('editItem')} (${props.name})`
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (open) {
          setLoading(false)
          form.reset()
        }
        setOpen(open)
      }}
    >
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title()}</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('email')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('phoneNumber')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="flex flex-row">
              {props.type === 'edit' && (
                <DeleteButton
                  variant="destructive"
                  action={() => DELETE_RESOURCE(`/api/clients/${props.id}`)}
                  onDone={() => {
                    setOpen(false)

                    props.onDone()
                  }}
                />
              )}
              <div className="flex flex-grow" />
              <div className="flex flex-row gap-3">
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    {t('close')}
                  </Button>
                </DialogClose>
                <Button type="submit">
                  <ButtonLoader isLoading={loading}>
                    <CheckIcon />
                  </ButtonLoader>
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default ClientDialog
