import DevForm from '../DevForm'

export const metadata = { title: 'New Development · Admin' }

export default function NewDevelopmentPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl text-foreground">New Development</h1>
        <p className="text-sm text-muted-foreground mt-1">Create a new project development entry.</p>
      </div>
      <DevForm />
    </div>
  )
}
