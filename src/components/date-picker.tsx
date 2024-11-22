'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { he, th } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { SelectSingleEventHandler } from 'react-day-picker'

interface DatePickerProps {
  date?: Date
  onSelect: SelectSingleEventHandler
}

export function DatePicker(props: DatePickerProps) {
  const t = useTranslations('Stats')

  const locale = useLocale()

  const locale__ = () => {
    if (locale === 'he') {
      return he
    }
    if (locale === 'th') {
      return th
    }

    return undefined // Let picker choose its default locale
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'justify-start text-left font-normal',
            !props.date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="me-2 h-4 w-4" />
          {props.date ? (
            format(props.date, 'PPP', { locale: locale__() })
          ) : (
            <span>{t('pickDate')}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={props.date}
          onSelect={props.onSelect}
          initialFocus
          locale={locale__()}
        />
      </PopoverContent>
    </Popover>
  )
}
