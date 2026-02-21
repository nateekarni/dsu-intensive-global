import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProjectForm } from '@/components/admin/ProjectForm'

export const metadata = {
  title: 'Create Project - Admin',
}

export default function CreateProjectPage() {
  return (
    <div className="w-full px-2 sm:px-6 space-y-6 pt-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Create New Project</h2>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <ProjectForm />
      </div>
    </div>
  )
}
