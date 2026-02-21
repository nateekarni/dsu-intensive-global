import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProjectForm } from '@/components/admin/ProjectForm'
import { mockPrograms } from '@/data/mockPrograms'

export const metadata = {
  title: 'Edit Project - Admin',
}

export default async function EditProjectPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const project = mockPrograms.find((p) => p.id === params.id)

  if (!project) {
    notFound()
  }

  return (
    <div className="w-full px-2 sm:px-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold tracking-tight">Edit Project: {project.title}</h2>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <ProjectForm initialData={project} isEditing />
      </div>
    </div>
  )
}
