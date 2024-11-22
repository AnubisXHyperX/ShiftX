import { Card } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function NotFound() {
  const t = useTranslations('Index')

  return (
    <div className="flex justify-center">
      <Card className="p-3 flex flex-row gap-3">
        <Link className="italic" href="/">
          {t('notFound')}
        </Link>
      </Card>
    </div>
  )
}
