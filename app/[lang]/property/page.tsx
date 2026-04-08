import { redirect } from 'next/navigation'

// The property listing has moved to /propiedades
export default function PropertyListingRedirect() {
  redirect('/propiedades')
}
