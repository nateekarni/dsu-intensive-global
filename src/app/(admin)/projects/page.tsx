import { mockPrograms } from '@/data/mockPrograms'
import { ProjectTable } from '@/components/admin/ProjectTable'

export const metadata = {
  title: 'Manage Projects - Admin',
}

export default function AdminProjectsPage() {
  return (
    <div className="w-full px-2 sm:px-6">
      <ProjectTable initialData={mockPrograms} />
    </div>
  )
}
