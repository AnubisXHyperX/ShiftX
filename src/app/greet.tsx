'use client'

import { useTranslations } from 'next-intl'

interface GreetProps {
  name?: string
}

const Greet = (props: GreetProps) => {
  const t = useTranslations('Index')

  return <div>{t('greet', { name: props.name ?? t('guest') })}</div>
}

export default Greet
