export interface VotingListRP {
  status: string
  message: string
  data: Data
}

export interface Data {
  totalItems: number
  page: number
  pageSize: number
  items: Item[]
}

export interface Item {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  selected: boolean
}
