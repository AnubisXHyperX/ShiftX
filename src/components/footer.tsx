import { useTranslations } from 'next-intl'
import { LanguagePicker } from './language-picker'
import { ModeToggle } from './mode-toggle'
import { ScrollArea, ScrollBar } from './ui/scroll-area'

const Footer = () => {
  const t = useTranslations('Index')

  return (
    <footer className="flex items-center justify-center">
      <ScrollArea className="whitespace-nowrap bg-card border border-b-0 shadow-sm rounded-t-md mx-2 ">
        <div className="flex w-max">
          <LanguagePicker />
          <ModeToggle />
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </footer>
  )
}

export default Footer
