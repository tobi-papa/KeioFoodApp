export type PriceRange = '¥' | '¥¥' | '¥¥¥'

export interface Place {
  id: string
  slug: string
  name_en: string
  name_jp: string
  category: string
  address: string
  lat: number
  lng: number
  price_range: PriceRange
  hours_text: string
  cover_photo_url: string | null
  description_short_en: string
  description_short_jp: string
  description_long_en: string
  description_long_jp: string
  cash_only: boolean
  seating_capacity: number | null
  created_at: string
}

export interface PlaceAttribute {
  id: string
  place_id: string
  key: string
  value_en: string
  value_jp: string
}

export interface GradingDimension {
  id: string
  name_en: string
  name_jp: string
  emoji: string
  order: number
  active: boolean
}

export interface Review {
  id: string
  place_id: string
  display_name: string
  visited_on: string
  meal_ordered: string
  would_recommend: boolean
  comment: string | null
  created_at: string
}

export interface ReviewGrade {
  id: string
  review_id: string
  dimension_id: string
  score: number
}

export interface ReviewWithGrades extends Review {
  review_grades: ReviewGrade[]
}

export interface Notification {
  id: string
  review_id: string
  read: boolean
  created_at: string
}

export interface PlaceWithScore extends Place {
  avg_score: number | null
  review_count: number
}
