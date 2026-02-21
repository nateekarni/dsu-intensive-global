'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MoreHorizontal, Edit, Trash, Archive, Users, Plus } from 'lucide-react'
import { Program, ProgramStatus } from '@/data/mockPrograms'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { format, parseISO } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ProjectTableProps {
  initialData: Program[]
  isLoading?: boolean
  error?: string | null
}

export function ProjectTable({ initialData, isLoading, error }: ProjectTableProps) {
  const [data, setData] = useState<Program[]>(initialData)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)

  const handleArchive = (id: string) => {
    setData((prev) => prev.map((proj) => (proj.id === id ? { ...proj, status: 'archived' } : proj)))
    toast.success('Project archived successfully.') // Will be replaced by actual API call later
  }

  const confirmDelete = () => {
    if (projectToDelete) {
      setData((prev) => prev.filter((proj) => proj.id !== projectToDelete))
      toast.success('Project deleted successfully.')
      setProjectToDelete(null)
    }
  }

  const getStatusBadge = (status: ProgramStatus) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100/80">Open</Badge>
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100/80">Upcoming</Badge>
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>
      case 'archived':
        return (
          <Badge variant="outline" className="text-gray-500">
            Archived
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDateToPeriod = (startStr: string, endStr: string) => {
    try {
      const start = parseISO(startStr)
      const end = parseISO(endStr)

      const startDay = format(start, 'd')
      const endDay = format(end, 'd')
      const startMonth = format(start, 'MMM')
      const endMonth = format(end, 'MMM')
      const startYear = format(start, 'yyyy')
      const endYear = format(end, 'yyyy')

      if (startMonth === endMonth && startYear === endYear) {
        return `${startDay}-${endDay} ${startMonth} ${startYear}`
      } else if (startYear === endYear) {
        return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${startYear}`
      } else {
        return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`
      }
    } catch (_e) {
      return `${startStr} to ${endStr}`
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6 pt-4">
        <h2 className="text-3xl font-bold tracking-tight pt-2">Projects</h2>
        <Button
          asChild
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6"
        >
          <Link href="/projects/create">
            <Plus className="mr-2 h-5 w-5" /> Create Project
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead>Project</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Applicants</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-16 rounded-md" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[80px] rounded-full" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-destructive">
                  {error}
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No projects found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((project) => (
                <TableRow key={project.id} className="group transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-16 overflow-hidden rounded-md border bg-muted shrink-0">
                        <Image
                          src={project.images.cover}
                          alt={project.title}
                          fill
                          className="object-cover"
                          unoptimized // Because mock URLs are external Unsplash
                        />
                      </div>
                      <Link
                        href={`/projects/${project.id}/applicants`}
                        className="font-medium text-base hover:underline line-clamp-2"
                      >
                        {project.title}
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{project.location.city}</span>
                      <span className="text-xs text-muted-foreground">
                        {project.location.country}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDateToPeriod(project.dates.start, project.dates.end)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {project.currentParticipants} / {project.maxParticipants}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(project.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/projects/${project.id}/applicants`}
                            className="w-full cursor-pointer"
                          >
                            <Users className="mr-2 h-4 w-4" /> Applicants
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/projects/${project.id}/edit`}
                            className="w-full cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        {project.status !== 'archived' && (
                          <DropdownMenuItem
                            onClick={() => handleArchive(project.id)}
                            className="cursor-pointer"
                          >
                            <Archive className="mr-2 h-4 w-4" /> Archive
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => setProjectToDelete(project.id)}
                          className="text-destructive cursor-pointer"
                        >
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this project?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the project and remove its
              data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProjectToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
