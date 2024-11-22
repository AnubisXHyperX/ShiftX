'use client'

import Loader from '@/components/loader'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { fetcher } from '@/lib/fetcher'
import { PricesResponse } from '@/lib/types'
import { SlashIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import useSWR from 'swr'

export default function PriceTable() {
  const t = useTranslations('Index')

  const {
    data: prices,
    error,
    isLoading,
    mutate,
  } = useSWR<PricesResponse>('/api/prices', fetcher)

  return (
    <>
      {isLoading && <Loader size="md" />}
      {prices && prices.length > 0 && (
        <>
          <div className="font-semibold">{t('pricesTitle')}</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('product')}</TableHead>
                <TableHead>{t('typeA')}</TableHead>
                <TableHead>{t('best')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prices.map((price, index) => (
                <TableRow key={index}>
                  <TableCell>{price.productName}</TableCell>
                  <TableCell>₪{price.typeA}</TableCell>
                  <TableCell>
                    {price.best ? (
                      '₪' + price.best
                    ) : (
                      <SlashIcon className="h-4 w-4" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </>
  )
}
