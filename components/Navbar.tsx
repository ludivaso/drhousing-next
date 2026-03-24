'use client'


import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Menu,
  X,
  Phone,
  Mail,
  ChevronDown,
  BookOpen,
  Calculator,
  MapPin,
  Globe,
  Building2,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'


export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { t, lang, setLang } = useI18n()


  const navigation = [
    { name: t('header.home'), href: '/' },
    { name: t('header.properties'), href: '/propiedades' },
    { name: t('header.agents'), href: '/agentes' },
    { name: t('header.services'), href: '/servicios' },
    { name: t('header.contact'), href: '/contacto' },
  ]


  const resourcesItems = [
