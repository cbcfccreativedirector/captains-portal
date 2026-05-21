// src/app/page.tsx
// Root — redirect to the join form
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/join')
}
