export interface Massage {
  id: string
  type: string
  name: string
  rate: number
  duration: number
  description: string
  amenities: string[]
  icons: string[]
  available: boolean
  image_url?: string
}

