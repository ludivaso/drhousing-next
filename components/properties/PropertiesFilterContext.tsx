'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

interface PropertiesFilterContextType {
  searchQuery: string
  setSearchQuery: (q: string) => void
}

const PropertiesFilterContext = createContext<PropertiesFilterContextType>({
  searchQuery: '',
  setSearchQuery: () => {},
})

export function PropertiesFilterProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('')
  return (
    <PropertiesFilterContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </PropertiesFilterContext.Provider>
  )
}

export function usePropertiesFilter() {
  return useContext(PropertiesFilterContext)
}
