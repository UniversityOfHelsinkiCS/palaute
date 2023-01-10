import { format } from 'date-fns'

export const formatClosesAt = closesAt => format(new Date(closesAt), 'dd.MM.yyyy')
