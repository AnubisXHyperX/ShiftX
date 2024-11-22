'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { setCookie } from 'cookies-next'
import { entries } from 'lodash'
import { GlobeIcon } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'

export function LanguagePicker() {
  const mapping: { [key: string]: string } = {
    he: 'עברית',
    en: 'English',
  }

  const router = useRouter()

  const locale = useLocale()

  const t = useTranslations('Index')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="link" size="sm">
          {t('language')}
          <GlobeIcon className="ms-2 w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(value) => {
            setCookie('lang', value)

            router.refresh()
          }}
        >
          {entries(mapping).map(([key, value]) => (
            <DropdownMenuRadioItem key={key} value={key}>
              {value}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
