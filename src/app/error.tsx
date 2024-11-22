'use client'

import { Card } from '@/components/ui/card'
import { useTranslations } from 'next-intl'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorComp(props: ErrorProps) {
  const t = useTranslations('Index')

  return (
    <div className="flex justify-center">
      <Card className="p-3 italic">{t('error')}</Card>
    </div>
  )
}
