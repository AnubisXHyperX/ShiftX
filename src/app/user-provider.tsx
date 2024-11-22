'use client'

import { User } from 'lucia'
import { createContext, PropsWithChildren, useContext } from 'react'

const UserContext = createContext<User | null>(null)

interface UserProviderProps {
  user: User | null
}

function UserProvider(props: PropsWithChildren<UserProviderProps>) {
  return (
    <UserContext.Provider value={props.user}>
      {props.children}
    </UserContext.Provider>
  )
}

function useUser() {
  return useContext(UserContext)
}

export { UserProvider, useUser }
