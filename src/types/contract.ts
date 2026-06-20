export type LoyaltyTier = "bronze" | "silver" | "gold" | "platinum" | "diamond"
export type RecommendationStatus = "pending" | "approved" | "rejected" | "escalated"

export interface Hotel {
  hotel_address: string
  name: string
  category: string
  property_type?: string
  description?: string
  location?: string
  amenities: string[]
  room_types: string[]
  packages?: string[]
  loyalty_tiers?: string[]
  star_rating?: number
  active?: boolean
  is_active?: boolean
  total_guests?: number
  total_recommendations?: number
  avg_alignment_score?: number
  registered_at?: string
  last_updated?: string
}

export interface Guest {
  guest_id: string
  guest_ref: string
  hotel_address: string
  loyalty_tier: string
  stay_count?: number
  total_spend_band?: string
  reviews?: string[]
  conversation_log?: string[]
  special_requests?: string[]
  dietary_needs?: string[]
  room_history?: string[]
  language?: string
  preference_tags?: string[]
  comfot_score?: number
  total_recommendations?: number
  erased?: boolean
  created_at?: string
  updated_at?: string
}

export interface DimensionScores {
  preference_alignment: number
  loyalty_appropriateness: number
  special_request_coverage: number
  inventory_validity: number
  upsell_relevance: number
  [key: string]: number
}

export interface Recommendation {
  rec_id: string
  hotel_address: string
  guest_id: string
  status: RecommendationStatus
  suggested_room: string
  suggested_amenities: string[]
  suggested_packages: string[]
  upsell_opportunities: string[]
  justification: string
  guest_message: string
  preference_tags_used: string[]
  alignment_score: number
  dimension_scores: DimensionScores
  validator_reasoning: string
  validator_flags: string[]
  validation_id: string
  room_type_requested?: string
  check_in?: string
  check_out?: string
  special_context?: string
  human_resolution_note?: string
  created_at?: string
}

export interface Validation {
  validation_id: string
  rec_id: string
  hotel_address: string
  guest_id: string
  consensus_result: string
  alignment_score: number
  decision: string
  reasoning: string
  dimension_scores: DimensionScores
  flags: string[]
  validator_count?: number
  consensus_score?: number
  created_at?: string
}

export interface Escalation {
  escalation_id: string
  hotel_address: string
  guest_id: string
  rec_id: string
  alignment_score?: number
  escalation_reason?: string
  reason?: string
  resolved: boolean
  resolution?: string
  resolution_note?: string
  reviewer_note?: string
  created_at?: string
  resolved_at?: string
}

export interface PreferenceRule {
  rule_id: string
  rule_type: string
  rule_value: string
  priority?: number
  description?: string
  active?: boolean
  created_at?: string
}

export interface HotelStats {
  hotel_address: string
  hotel_name?: string
  total_guests: number
  total_recommendations: number
  approved?: number
  rejected?: number
  escalated?: number
  pending_escalations: number
  avg_alignment_score: number
  approval_rate?: number
  rules?: number
}

export interface GlobalStats {
  version?: string
  tagline?: string
  total_hotels: number
  total_guests: number
  total_recommendations: number
  total_validations: number
  total_escalations: number
}
