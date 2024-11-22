'use client'

import { DirectionProvider } from '@radix-ui/react-direction'
import { PropsWithChildren } from 'react'

interface RTLProps {
  dir: 'ltr' | 'rtl'
}

function RadixDirectionProvider(props: PropsWithChildren<RTLProps>) {
  return <DirectionProvider dir={props.dir}>{props.children}</DirectionProvider>
}

export default RadixDirectionProvider
