'use client'

import { useUser } from '@/app/user-provider'
import {
  LogInIcon,
  LogOutIcon,
  OctagonXIcon,
  ShieldCheckIcon,
  UserIcon,
  UsersRoundIcon
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import NavbarTitle from './navbar-title'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

const DROPDOWN_ITEM_CLASS = 'me-2 h-4 w-4'

const Navbar = () => {
  const router = useRouter()

  const user = useUser()

  const t = useTranslations('Index')

  return (
    <div
      className="h-16 bg-card w-full flex flex-row items-center border border-t-0 shadow-sm justify-between p-6 gap-6"
      dir="ltr"
    >
      <NavbarTitle />
      <div className="flex gap-3">
        {user && (
          <>
            {user.role === 'MANAGER' && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    router.push('/admin')
                  }}
                >
                  <ShieldCheckIcon />
                </Button>
              </>
            )}
          </>
        )}
        <DropdownMenu dir="rtl">
          <DropdownMenuTrigger>
            <Avatar>
              {/* <AvatarImage src="https://github.com/shadcn.png" /> */}
              <AvatarFallback>
                {user ? user.name.slice(0, 2).toUpperCase() : <UserIcon />}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={10}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            {user ? (
              <>
                {user.role === 'MANAGER' && (
                  <>
                    {/* <DropdownMenuItem
                      onClick={() => {
                        router.push('/profile')
                      }}
                    >
                      <UserIcon className={DROPDOWN_ITEM_CLASS} />
                      {t('profile')}
                    </DropdownMenuItem> */}
                    {/* <DropdownMenuItem
                      onClick={() => {
                        router.push('/products')
                      }}
                    >
                      <BananaIcon className={DROPDOWN_ITEM_CLASS} />
                      {t('products')}
                    </DropdownMenuItem> */}
                    <DropdownMenuItem
                      onClick={() => {
                        router.push('/workers')
                      }}
                    >
                      <UsersRoundIcon className={DROPDOWN_ITEM_CLASS} />
                      {t('employees')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        router.push('/blocks')
                      }}
                    >
                      <OctagonXIcon className={DROPDOWN_ITEM_CLASS} />
                      {t('blocks')}
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem
                      onClick={() => {
                        router.push('/team')
                      }}
                    >
                      <UsersIcon className={DROPDOWN_ITEM_CLASS} />
                      {t('team')}
                    </DropdownMenuItem> */}
                    {/* <DropdownMenuItem
                      onClick={() => {
                        router.push('/settings')
                      }}
                    >
                      <SettingsIcon className={DROPDOWN_ITEM_CLASS} />
                      {t('settings')}
                    </DropdownMenuItem> */}
                    {/* <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        router.push('/orders?status=deleted')
                      }}
                    >
                      <Trash2Icon className={DROPDOWN_ITEM_CLASS} />
                      {t('trash')}
                    </DropdownMenuItem> */}
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  onClick={async () => {
                    const response = await fetch(`/api/signout`, {
                      method: 'POST',
                    })

                    if (response.redirected) {
                      router.push(response.url)
                      router.refresh()
                    }
                  }}
                >
                  <LogOutIcon className={DROPDOWN_ITEM_CLASS} />
                  {t('logout')}
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem
                onClick={() => {
                  router.push('/login')
                }}
              >
                <LogInIcon className={DROPDOWN_ITEM_CLASS} />
                {t('login')}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default Navbar
