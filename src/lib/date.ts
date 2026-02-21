import { format, parseISO } from 'date-fns'
import { enUS } from 'date-fns/locale'

export const formatDate = (dateString: string, formatStr: string = 'dd MMM yyyy') => {
  if (!dateString) return ''
  return format(parseISO(dateString), formatStr, { locale: enUS })
}

export const formatRange = (start: string, end: string) => {
  if (!start || !end) return ''
  const s = parseISO(start)
  const e = parseISO(end)
  return `${format(s, 'd MMM')} - ${format(e, 'd MMM yyyy')}`
}
