# v0.2.18
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json


VERSION = "1.0.0"

STATUS_APPROVED = "approved"
STATUS_REJECTED = "rejected"
STATUS_ESCALATED = "escalated"

CONSENSUS_PASS = "pass"
CONSENSUS_FAIL = "fail"
CONSENSUS_ESCALATE = "escalate"

VALID_PROPERTY_TYPES = [
    "luxury",
    "boutique",
    "resort",
    "business",
    "lifestyle",
    "budget",
    "extended_stay",
    "hostel",
]

VALID_LOYALTY_TIERS = [
    "bronze",
    "silver",
    "gold",
    "platinum",
    "diamond",
]

VALID_SPEND_BANDS = [
    "low",
    "medium",
    "high",
    "very_high",
    "unknown",
]

VALID_RULE_TYPES = [
    "amenity_always",
    "amenity_never",
    "room_preference",
    "package_preference",
    "service_timing",
    "dietary",
    "communication_style",
    "upsell_threshold",
]

MAX_AMENITIES = 40
MAX_ROOM_TYPES = 20
MAX_PACKAGES = 20
MAX_REVIEWS = 20
MAX_CONVERSATIONS = 30
MAX_SPECIAL_REQUESTS = 15
MAX_RULES = 50


class ComfotContract(gl.Contract):
    """
    Comfot — Personalized Comfort for Every Stay

    GenLayer-native guest experience personalization contract.

    The contract helps a hotel convert subjective guest signals
    into validated service recommendations.

    Inputs can include:
    - guest reviews
    - loyalty tier
    - stay history
    - conversation history
    - special requests
    - dietary needs
    - room history
    - hotel amenities, room types and packages

    GenLayer validators interpret whether the suggested room,
    amenities, packages and upsells are semantically aligned with
    the guest's actual needs.

    The important judgement is not made by the frontend.
    The important judgement is not made by the hotel database.
    The important judgement is made through GenLayer validator
    consensus.
    """

    hotels: TreeMap[str, str]
    guests: TreeMap[str, str]
    guest_lookup: TreeMap[str, str]
    recommendations: TreeMap[str, str]
    validations: TreeMap[str, str]
    escalations: TreeMap[str, str]
    preference_rules: TreeMap[str, str]
    hotel_guest_index: TreeMap[str, str]
    guest_rec_index: TreeMap[str, str]
    rec_validation_index: TreeMap[str, str]
    hotel_escalation_index: TreeMap[str, str]
    audit_log: TreeMap[str, str]

    next_guest_id: bigint
    next_recommendation_id: bigint
    next_validation_id: bigint
    next_escalation_id: bigint
    next_audit_id: bigint
    total_hotels: bigint
    total_guests: bigint
    total_recommendations: bigint
    total_validations: bigint
    total_escalations: bigint

    def __init__(self):
        self.hotels = TreeMap[str, str]()
        self.guests = TreeMap[str, str]()
        self.guest_lookup = TreeMap[str, str]()
        self.recommendations = TreeMap[str, str]()
        self.validations = TreeMap[str, str]()
        self.escalations = TreeMap[str, str]()
        self.preference_rules = TreeMap[str, str]()
        self.hotel_guest_index = TreeMap[str, str]()
        self.guest_rec_index = TreeMap[str, str]()
        self.rec_validation_index = TreeMap[str, str]()
        self.hotel_escalation_index = TreeMap[str, str]()
        self.audit_log = TreeMap[str, str]()

        self.next_guest_id = 1
        self.next_recommendation_id = 1
        self.next_validation_id = 1
        self.next_escalation_id = 1
        self.next_audit_id = 1

        self.total_hotels = 0
        self.total_guests = 0
        self.total_recommendations = 0
        self.total_validations = 0
        self.total_escalations = 0

    # ============================================================
    # HOTEL MANAGEMENT
    # ============================================================

    @gl.public.write
    def register_hotel(
        self,
        name: str,
        property_type: str,
        description: str,
        location: str,
        amenities: list[str],
        room_types: list[str],
        packages: list[str],
        star_rating: int,
    ) -> None:
        caller = str(gl.message.sender_address).lower()

        name = name.strip()
        property_type = property_type.strip().lower()

        assert name != "", "Hotel name is required"
        assert property_type in VALID_PROPERTY_TYPES, "Invalid property type"
        assert star_rating >= 1 and star_rating <= 5, "star_rating must be between 1 and 5"
        assert len(amenities) > 0 and len(amenities) <= MAX_AMENITIES, "Invalid amenities count"
        assert len(room_types) > 0 and len(room_types) <= MAX_ROOM_TYPES, "Invalid room type count"
        assert len(packages) <= MAX_PACKAGES, "Too many packages"

        clean_amenities = self._clean_list(amenities, MAX_AMENITIES)
        clean_rooms = self._clean_list(room_types, MAX_ROOM_TYPES)
        clean_packages = self._clean_list(packages, MAX_PACKAGES)

        existing = self._load(self.hotels.get(caller, ""))

        is_new = existing == {}

        hotel = {
            "hotel_address": caller,
            "name": name,
            "property_type": property_type,
            "description": description.strip(),
            "location": location.strip(),
            "amenities": clean_amenities,
            "room_types": clean_rooms,
            "packages": clean_packages,
            "star_rating": star_rating,
            "active": True,
            "total_guests": existing.get("total_guests", 0),
            "total_recommendations": existing.get("total_recommendations", 0),
            "avg_alignment_score": existing.get("avg_alignment_score", 0),
        }

        self.hotels[caller] = self._dump(hotel)

        if self.hotel_guest_index.get(caller, "") == "":
            self.hotel_guest_index[caller] = self._dump([])

        if self.preference_rules.get(caller, "") == "":
            self.preference_rules[caller] = self._dump([])

        if self.hotel_escalation_index.get(caller, "") == "":
            self.hotel_escalation_index[caller] = self._dump([])

        if is_new:
            self.total_hotels += 1

        self._audit(
            "hotel_registered" if is_new else "hotel_updated",
            caller,
            caller,
            "Hotel profile saved for Comfot personalization.",
        )

    @gl.public.write
    def deactivate_hotel(self) -> None:
        caller = str(gl.message.sender_address).lower()
        hotel = self._require_hotel(caller)
        hotel["active"] = False
        self.hotels[caller] = self._dump(hotel)

        self._audit(
            "hotel_deactivated",
            caller,
            caller,
            "Hotel deactivated.",
        )

    # ============================================================
    # HOTEL PREFERENCE RULES
    # ============================================================

    @gl.public.write
    def set_preference_rule(
        self,
        rule_id: str,
        rule_type: str,
        rule_value: str,
        description: str,
        active: bool,
    ) -> None:
        caller = str(gl.message.sender_address).lower()
        self._require_active_hotel(caller)

        rule_id = rule_id.strip()
        rule_type = rule_type.strip().lower()

        assert rule_id != "", "rule_id is required"
        assert rule_type in VALID_RULE_TYPES, "Invalid rule_type"
        assert rule_value.strip() != "", "rule_value is required"

        rules = self._load_list(self.preference_rules.get(caller, ""))

        updated = False
        out = []

        for rule in rules:
            if rule.get("rule_id") == rule_id:
                out.append({
                    "rule_id": rule_id,
                    "rule_type": rule_type,
                    "rule_value": rule_value.strip(),
                    "description": description.strip(),
                    "active": active,
                })
                updated = True
            else:
                out.append(rule)

        if not updated:
            assert len(out) < MAX_RULES, "Maximum preference rules reached"
            out.append({
                "rule_id": rule_id,
                "rule_type": rule_type,
                "rule_value": rule_value.strip(),
                "description": description.strip(),
                "active": active,
            })

        self.preference_rules[caller] = self._dump(out)

        self._audit(
            "preference_rule_set",
            caller,
            rule_id,
            "Hotel preference rule saved.",
        )

    @gl.public.write
    def delete_preference_rule(self, rule_id: str) -> None:
        caller = str(gl.message.sender_address).lower()
        self._require_active_hotel(caller)

        rules = self._load_list(self.preference_rules.get(caller, ""))
        filtered = []

        for rule in rules:
            if rule.get("rule_id") != rule_id:
                filtered.append(rule)

        self.preference_rules[caller] = self._dump(filtered)

        self._audit(
            "preference_rule_deleted",
            caller,
            rule_id,
            "Hotel preference rule deleted.",
        )

    # ============================================================
    # GUEST PROFILE
    # ============================================================

    @gl.public.write
    def submit_guest_profile(
        self,
        guest_ref: str,
        loyalty_tier: str,
        stay_count: int,
        total_spend_band: str,
        reviews: list[str],
        conversation_log: list[str],
        special_requests: list[str],
        dietary_needs: list[str],
        room_history: list[str],
        language: str,
    ) -> str:
        caller = str(gl.message.sender_address).lower()
        self._require_active_hotel(caller)

        guest_ref = guest_ref.strip()
        loyalty_tier = loyalty_tier.strip().lower()
        total_spend_band = total_spend_band.strip().lower()

        assert guest_ref != "", "guest_ref is required"
        assert loyalty_tier in VALID_LOYALTY_TIERS, "Invalid loyalty_tier"
        assert total_spend_band in VALID_SPEND_BANDS, "Invalid total_spend_band"
        assert stay_count >= 0, "stay_count cannot be negative"
        assert len(reviews) <= MAX_REVIEWS, "Too many reviews"
        assert len(conversation_log) <= MAX_CONVERSATIONS, "Too many conversation entries"
        assert len(special_requests) <= MAX_SPECIAL_REQUESTS, "Too many special requests"

        has_signal = (
            len(reviews) > 0 or
            len(conversation_log) > 0 or
            len(special_requests) > 0 or
            len(dietary_needs) > 0 or
            len(room_history) > 0
        )

        assert has_signal, "At least one guest signal is required"

        lookup_key = caller + "::" + guest_ref.lower()
        existing_guest_id = self.guest_lookup.get(lookup_key, "")

        is_new = existing_guest_id == ""

        if is_new:
            guest_id = "guest_" + str(self.next_guest_id)
            self.next_guest_id += 1
            self.guest_lookup[lookup_key] = guest_id
        else:
            guest_id = existing_guest_id

        existing = self._load(self.guests.get(guest_id, ""))

        guest = {
            "guest_id": guest_id,
            "guest_ref": guest_ref,
            "hotel_address": caller,
            "loyalty_tier": loyalty_tier,
            "stay_count": stay_count,
            "total_spend_band": total_spend_band,
            "reviews": self._clean_text_list(reviews, MAX_REVIEWS),
            "conversation_log": self._clean_text_list(conversation_log, MAX_CONVERSATIONS),
            "special_requests": self._clean_text_list(special_requests, MAX_SPECIAL_REQUESTS),
            "dietary_needs": self._clean_text_list(dietary_needs, 25),
            "room_history": self._clean_text_list(room_history, 25),
            "language": language.strip() if language.strip() != "" else "en",
            "preference_tags": existing.get("preference_tags", []),
            "comfot_score": existing.get("comfot_score", 0),
            "total_recommendations": existing.get("total_recommendations", 0),
            "erased": False,
        }

        self.guests[guest_id] = self._dump(guest)

        if self.guest_rec_index.get(guest_id, "") == "":
            self.guest_rec_index[guest_id] = self._dump([])

        if is_new:
            guest_ids = self._load_list(self.hotel_guest_index.get(caller, ""))
            guest_ids.append(guest_id)
            self.hotel_guest_index[caller] = self._dump(guest_ids)

            hotel = self._require_hotel(caller)
            hotel["total_guests"] = hotel.get("total_guests", 0) + 1
            self.hotels[caller] = self._dump(hotel)

            self.total_guests += 1

        self._audit(
            "guest_profile_submitted" if is_new else "guest_profile_updated",
            caller,
            guest_id,
            "Anonymized guest profile saved.",
        )

        return guest_id

    @gl.public.write
    def erase_guest_profile(self, guest_id: str) -> None:
        caller = str(gl.message.sender_address).lower()
        guest = self._require_guest(guest_id)

        assert guest.get("hotel_address") == caller, "Guest does not belong to this hotel"

        guest["reviews"] = []
        guest["conversation_log"] = []
        guest["special_requests"] = []
        guest["dietary_needs"] = []
        guest["room_history"] = []
        guest["preference_tags"] = []
        guest["erased"] = True

        self.guests[guest_id] = self._dump(guest)

        self._audit(
            "guest_profile_erased",
            caller,
            guest_id,
            "Guest free-text personalization data erased.",
        )

    # ============================================================
    # GENLAYER CONSENSUS CORE
    # ============================================================

    @gl.public.write
    def request_recommendation(self, guest_id: str) -> str:
        caller = str(gl.message.sender_address).lower()

        hotel = self._require_active_hotel(caller)
        guest = self._require_guest(guest_id)

        assert guest.get("hotel_address") == caller, "Guest does not belong to this hotel"
        assert not guest.get("erased", False), "Guest profile has been erased"

        active_rules = []
        all_rules = self._load_list(self.preference_rules.get(caller, ""))

        for rule in all_rules:
            if rule.get("active", False):
                active_rules.append(rule)

        preference_tags = self._interpret_preferences(guest, active_rules)
        guest["preference_tags"] = preference_tags
        self.guests[guest_id] = self._dump(guest)

        recommendation = self._generate_recommendation(
            hotel,
            guest,
            preference_tags,
            active_rules,
        )

        validation = self._validate_alignment(
            hotel,
            guest,
            preference_tags,
            recommendation,
        )

        consensus_result = validation.get("consensus_result", CONSENSUS_ESCALATE)

        if consensus_result == CONSENSUS_PASS:
            status = STATUS_APPROVED
        elif consensus_result == CONSENSUS_FAIL:
            status = STATUS_REJECTED
        else:
            status = STATUS_ESCALATED

        rec_order = self.next_recommendation_id
        rec_id = "rec_" + str(rec_order)
        self.next_recommendation_id += 1

        val_order = self.next_validation_id
        val_id = "val_" + str(val_order)
        self.next_validation_id += 1

        rec = {
            "rec_id": rec_id,
            "sort_order": rec_order,
            "hotel_address": caller,
            "guest_id": guest_id,
            "guest_ref": guest.get("guest_ref", ""),
            "status": status,
            "suggested_room": recommendation.get("room", ""),
            "suggested_amenities": recommendation.get("amenities", []),
            "suggested_packages": recommendation.get("packages", []),
            "upsell_opportunities": recommendation.get("upsells", []),
            "justification": recommendation.get("justification", ""),
            "guest_message": recommendation.get("guest_message", ""),
            "preference_tags_used": preference_tags,
            "alignment_score": validation.get("alignment_score", 50),
            "dimension_scores": validation.get("dimension_scores", {}),
            "validator_reasoning": validation.get("reasoning", ""),
            "validator_flags": validation.get("flags", []),
            "validation_id": val_id,
        }

        val = {
            "validation_id": val_id,
            "sort_order": val_order,
            "rec_id": rec_id,
            "hotel_address": caller,
            "guest_id": guest_id,
            "guest_ref": guest.get("guest_ref", ""),
            "consensus_result": consensus_result,
            "alignment_score": validation.get("alignment_score", 50),
            "decision": validation.get("decision", "escalate"),
            "reasoning": validation.get("reasoning", ""),
            "dimension_scores": validation.get("dimension_scores", {}),
            "flags": validation.get("flags", []),
        }

        self.recommendations[rec_id] = self._dump(rec)
        self.validations[val_id] = self._dump(val)
        self.rec_validation_index[rec_id] = val_id

        guest_recs = self._load_list(self.guest_rec_index.get(guest_id, ""))
        guest_recs.append(rec_id)
        self.guest_rec_index[guest_id] = self._dump(guest_recs)

        guest["total_recommendations"] = guest.get("total_recommendations", 0) + 1
        guest["comfot_score"] = self._calculate_guest_average_score(guest_id, validation.get("alignment_score", 50))
        self.guests[guest_id] = self._dump(guest)

        hotel["total_recommendations"] = hotel.get("total_recommendations", 0) + 1
        self.hotels[caller] = self._dump(hotel)

        self.total_recommendations += 1
        self.total_validations += 1

        if status == STATUS_ESCALATED:
            esc_order = self.next_escalation_id
            esc_id = "esc_" + str(esc_order)
            self.next_escalation_id += 1

            esc = {
                "escalation_id": esc_id,
                "sort_order": esc_order,
                "hotel_address": caller,
                "guest_id": guest_id,
                "guest_ref": guest.get("guest_ref", ""),
                "rec_id": rec_id,
                "resolved": False,
                "resolution": "",
                "resolution_note": "",
                "reason": validation.get("escalation_reason", "Borderline semantic alignment."),
            }

            self.escalations[esc_id] = self._dump(esc)

            escs = self._load_list(self.hotel_escalation_index.get(caller, ""))
            escs.append(esc_id)
            self.hotel_escalation_index[caller] = self._dump(escs)

            self.total_escalations += 1

            self._audit(
                "recommendation_escalated",
                caller,
                esc_id,
                "Recommendation requires human review.",
            )

        self._refresh_hotel_average_score(caller)

        self._audit(
            "recommendation_finalized",
            caller,
            rec_id,
            "GenLayer consensus finalized guest experience recommendation.",
        )

        return rec_id

    def _interpret_preferences(self, guest: dict, rules: list[dict]) -> list[str]:
        reviews = self._numbered_block(guest.get("reviews", []))
        conversations = self._numbered_block(guest.get("conversation_log", []))
        requests = self._csv(guest.get("special_requests", []))
        dietary = self._csv(guest.get("dietary_needs", []))
        rooms = self._csv(guest.get("room_history", []))
        rules_text = self._rules_block(rules)

        prompt = f"""
You are a hospitality personalization analyst.

Your task is to interpret the guest's likely comfort preferences from
reviews, loyalty data, conversation history, special requests, dietary
needs and past room history.

This is subjective. Do not invent facts. Infer only preferences that are
reasonably supported by the profile.

GUEST PROFILE
Loyalty tier: {guest.get("loyalty_tier", "")}
Stay count: {guest.get("stay_count", 0)}
Spend band: {guest.get("total_spend_band", "unknown")}
Language: {guest.get("language", "en")}

Reviews:
{reviews}

Conversation history:
{conversations}

Special requests:
{requests}

Dietary needs:
{dietary}

Room history:
{rooms}

Hotel rules:
{rules_text}

Return ONLY valid JSON in this exact shape:
{{
  "tags": [
    "short actionable preference tag"
  ],
  "summary": "one sentence summary of the guest comfort profile"
}}

Rules:
- Return 4 to 10 tags.
- Each tag must be 2 to 6 words.
- Tags must be useful to hotel staff.
- Tags must not include raw personal identity.
- Tags must not be generic.
- Tags must be supported by the evidence.
"""

        def run_prompt() -> str:
            raw = gl.nondet.exec_prompt(prompt)
            return self._strip_json(raw)

        result = gl.eq_principle.prompt_comparative(
            run_prompt,
            "The JSON must reflect the same overall guest comfort direction. "
            "Tag wording may differ as long as the tags point to the same underlying "
            "needs. Minor differences in phrasing are acceptable."
        )

        parsed = self._safe_parse(result)

        tags = parsed.get("tags", [])

        if not isinstance(tags, list):
            return []

        clean = []

        for tag in tags:
            t = str(tag).strip().lower()
            if t != "" and len(clean) < 10:
                clean.append(t)

        return clean

    def _generate_recommendation(
        self,
        hotel: dict,
        guest: dict,
        preference_tags: list[str],
        rules: list[dict],
    ) -> dict:
        rooms = hotel.get("room_types", [])
        amenities = hotel.get("amenities", [])
        packages = hotel.get("packages", [])

        prompt = f"""
You are a senior hotel concierge creating a personalized pre-arrival
recommendation.

You must only recommend inventory that the hotel actually offers.

HOTEL
Name: {hotel.get("name", "")}
Type: {hotel.get("property_type", "")}
Star rating: {hotel.get("star_rating", 0)}
Location: {hotel.get("location", "")}
Description: {hotel.get("description", "")}

Available room types:
{self._csv(rooms)}

Available amenities:
{self._csv(amenities)}

Available packages:
{self._csv(packages)}

GUEST
Loyalty tier: {guest.get("loyalty_tier", "")}
Stay count: {guest.get("stay_count", 0)}
Spend band: {guest.get("total_spend_band", "unknown")}
Preference tags:
{self._csv(preference_tags)}

Special requests:
{self._csv(guest.get("special_requests", []))}

Dietary needs:
{self._csv(guest.get("dietary_needs", []))}

Hotel rules:
{self._rules_block(rules)}

Return ONLY valid JSON in this exact shape:
{{
  "room": "exact room type from hotel inventory",
  "amenities": ["exact amenity from hotel inventory"],
  "packages": ["exact package from hotel inventory"],
  "upsells": ["benefit-led upsell opportunity"],
  "justification": "3 to 4 sentences explaining why this fits the guest",
  "guest_message": "2 to 3 sentence pre-arrival message"
}}

Rules:
- room must be an exact match from available room types.
- amenities must be exact matches from available amenities.
- packages must be exact matches from available packages or an empty list.
- recommend 2 to 5 amenities.
- recommend 0 to 2 packages.
- recommend 1 to 3 upsells.
- the recommendation must align with the guest's evidence.
- do not expose private raw guest data in the guest_message.
"""

        def run_prompt() -> str:
            raw = gl.nondet.exec_prompt(prompt)
            return self._strip_json(raw)

        result = gl.eq_principle.prompt_comparative(
            run_prompt,
            "Validators must agree on the same general tier or category of room. "
            "Amenity and package selections may vary as long as they serve the same "
            "guest needs. Wording differences in justification and guest message are acceptable."
        )

        parsed = self._safe_parse(result)

        room = str(parsed.get("room", "")).strip().lower()
        if room not in rooms:
            room = rooms[0]

        chosen_amenities = []
        raw_amenities = parsed.get("amenities", [])

        if isinstance(raw_amenities, list):
            for item in raw_amenities:
                a = str(item).strip().lower()
                if a in amenities and a not in chosen_amenities:
                    chosen_amenities.append(a)

        if len(chosen_amenities) == 0:
            chosen_amenities = amenities[:2]

        chosen_packages = []
        raw_packages = parsed.get("packages", [])

        if isinstance(raw_packages, list):
            for item in raw_packages:
                p = str(item).strip().lower()
                if p in packages and p not in chosen_packages:
                    chosen_packages.append(p)

        upsells = []
        raw_upsells = parsed.get("upsells", [])

        if isinstance(raw_upsells, list):
            for item in raw_upsells:
                u = str(item).strip()
                if u != "" and len(upsells) < 3:
                    upsells.append(u)

        return {
            "room": room,
            "amenities": chosen_amenities[:5],
            "packages": chosen_packages[:2],
            "upsells": upsells,
            "justification": str(parsed.get("justification", "")).strip(),
            "guest_message": str(parsed.get("guest_message", "")).strip(),
        }

    def _validate_alignment(
        self,
        hotel: dict,
        guest: dict,
        preference_tags: list[str],
        recommendation: dict,
    ) -> dict:
        prompt = f"""
You are an independent GenLayer validator for Comfot.

Comfot verifies whether a hotel recommendation is semantically aligned
with a guest's actual needs. This is not a keyword match. You must judge
whether the recommendation makes sense for the guest.

HOTEL INVENTORY
Room types: {self._csv(hotel.get("room_types", []))}
Amenities: {self._csv(hotel.get("amenities", []))}
Packages: {self._csv(hotel.get("packages", []))}

GUEST SIGNALS
Loyalty tier: {guest.get("loyalty_tier", "")}
Stay count: {guest.get("stay_count", 0)}
Spend band: {guest.get("total_spend_band", "unknown")}
Preference tags: {self._csv(preference_tags)}
Special requests: {self._csv(guest.get("special_requests", []))}
Dietary needs: {self._csv(guest.get("dietary_needs", []))}
Room history: {self._csv(guest.get("room_history", []))}

RECOMMENDATION
Room: {recommendation.get("room", "")}
Amenities: {self._csv(recommendation.get("amenities", []))}
Packages: {self._csv(recommendation.get("packages", []))}
Upsells: {self._csv(recommendation.get("upsells", []))}
Justification: {recommendation.get("justification", "")}
Guest message: {recommendation.get("guest_message", "")}

Score the recommendation across these dimensions:

1. preference_alignment, weight 40
2. loyalty_appropriateness, weight 20
3. special_request_coverage, weight 20
4. inventory_validity, weight 10
5. upsell_relevance, weight 10

Decision rules:
- approve if overall_score >= 75 and no critical contradiction exists.
- reject if overall_score < 45 or the recommendation contradicts a critical guest need.
- escalate if score is 45 to 74, evidence is thin, or the recommendation is plausible but uncertain.

Return ONLY valid JSON in this exact shape:
{{
  "overall_score": 0,
  "decision": "approve",
  "reasoning": "3 to 5 sentences explaining the evidence-based judgement",
  "dimension_scores": {{
    "preference_alignment": 0,
    "loyalty_appropriateness": 0,
    "special_request_coverage": 0,
    "inventory_validity": 0,
    "upsell_relevance": 0
  }},
  "flags": ["short concern label"]
}}

The decision must be one of:
approve, reject, escalate.
"""

        def run_prompt() -> str:
            raw = gl.nondet.exec_prompt(prompt)
            return self._strip_json(raw)

        result = gl.eq_principle.prompt_comparative(
            run_prompt,
            "Validators must agree on the decision field (approve, reject, or escalate). "
            "Score differences up to 15 points are acceptable. Reasoning and flag wording "
            "may differ as long as the overall verdict is the same."
        )

        parsed = self._safe_parse(result)

        score = self._to_int(parsed.get("overall_score", 50))

        if score < 0:
            score = 0

        if score > 100:
            score = 100

        decision = str(parsed.get("decision", "escalate")).strip().lower()

        if decision not in ["approve", "reject", "escalate"]:
            decision = "escalate"

        if decision == "approve" and score >= 75:
            consensus_result = CONSENSUS_PASS
            escalation_reason = ""
        elif decision == "reject" or score < 45:
            consensus_result = CONSENSUS_FAIL
            escalation_reason = ""
        else:
            consensus_result = CONSENSUS_ESCALATE
            escalation_reason = "Recommendation requires human review because alignment is uncertain or borderline."

        dimension_scores = parsed.get("dimension_scores", {})

        if not isinstance(dimension_scores, dict):
            dimension_scores = {}

        flags = parsed.get("flags", [])

        if not isinstance(flags, list):
            flags = []

        return {
            "alignment_score": score,
            "decision": decision,
            "consensus_result": consensus_result,
            "reasoning": str(parsed.get("reasoning", "")).strip(),
            "dimension_scores": dimension_scores,
            "flags": flags,
            "escalation_reason": escalation_reason,
        }

    # ============================================================
    # HUMAN ESCALATION RESOLUTION
    # ============================================================

    @gl.public.write
    def resolve_escalation(
        self,
        escalation_id: str,
        resolution: str,
        resolution_note: str,
    ) -> None:
        caller = str(gl.message.sender_address).lower()
        self._require_active_hotel(caller)

        esc = self._load(self.escalations.get(escalation_id, ""))

        assert esc != {}, "Escalation not found"
        assert esc.get("hotel_address") == caller, "Only owning hotel can resolve"
        assert not esc.get("resolved", False), "Escalation already resolved"

        resolution = resolution.strip().lower()

        assert resolution in [STATUS_APPROVED, STATUS_REJECTED], "Invalid resolution"

        rec_id = esc.get("rec_id", "")
        rec = self._load(self.recommendations.get(rec_id, ""))

        if rec != {}:
            rec["status"] = resolution
            rec["human_resolution_note"] = resolution_note.strip()
            self.recommendations[rec_id] = self._dump(rec)

        esc["resolved"] = True
        esc["resolution"] = resolution
        esc["resolution_note"] = resolution_note.strip()

        self.escalations[escalation_id] = self._dump(esc)

        self._audit(
            "escalation_resolved",
            caller,
            escalation_id,
            "Human reviewer resolved recommendation escalation.",
        )

    # ============================================================
    # READ METHODS
    # ============================================================

    @gl.public.view
    def get_contract_version(self) -> str:
        return VERSION

    @gl.public.view
    def get_hotel(self, hotel_address: str) -> dict:
        return self._load(self.hotels.get(hotel_address, ""))

    @gl.public.view
    def get_guest(self, guest_id: str) -> dict:
        return self._load(self.guests.get(guest_id, ""))

    @gl.public.view
    def get_guest_id(self, hotel_address: str, guest_ref: str) -> str:
        key = hotel_address + "::" + guest_ref.strip().lower()
        return self.guest_lookup.get(key, "")

    @gl.public.view
    def get_recommendation(self, rec_id: str) -> dict:
        return self._load(self.recommendations.get(rec_id, ""))

    @gl.public.view
    def get_validation(self, validation_id: str) -> dict:
        return self._load(self.validations.get(validation_id, ""))

    @gl.public.view
    def get_validation_for_recommendation(self, rec_id: str) -> dict:
        val_id = self.rec_validation_index.get(rec_id, "")
        if val_id == "":
            return {}
        return self._load(self.validations.get(val_id, ""))

    @gl.public.view
    def get_escalation(self, escalation_id: str) -> dict:
        return self._load(self.escalations.get(escalation_id, ""))

    @gl.public.view
    def get_hotel_guest_ids(self, hotel_address: str) -> list[str]:
        return self._load_list(self.hotel_guest_index.get(hotel_address, ""))

    @gl.public.view
    def get_guest_recommendation_ids(self, guest_id: str) -> list[str]:
        return self._load_list(self.guest_rec_index.get(guest_id, ""))

    @gl.public.view
    def get_guest_recommendations(self, guest_id: str) -> list[dict]:
        ids = self._load_list(self.guest_rec_index.get(guest_id, ""))
        out = []

        for i in range(len(ids) - 1, -1, -1):
            rec_id = ids[i]
            rec = self._load(self.recommendations.get(rec_id, ""))
            if rec != {}:
                out.append(rec)

        return out

    @gl.public.view
    def get_hotel_recommendations(self, hotel_address: str) -> list[dict]:
        guest_ids = self._load_list(self.hotel_guest_index.get(hotel_address, ""))
        out = []

        for guest_id in guest_ids:
            rec_ids = self._load_list(self.guest_rec_index.get(guest_id, ""))
            for i in range(len(rec_ids) - 1, -1, -1):
                rec_id = rec_ids[i]
                rec = self._load(self.recommendations.get(rec_id, ""))
                if rec != {}:
                    out.append(rec)

        out = self._sort_records_desc(out, "sort_order")
        return out

    @gl.public.view
    def get_hotel_recommendations_by_status(
        self,
        hotel_address: str,
        status: str,
    ) -> list[dict]:
        recs = self.get_hotel_recommendations(hotel_address)
        out = []

        for rec in recs:
            if rec.get("status") == status:
                out.append(rec)

        return out

    @gl.public.view
    def get_hotel_escalations(self, hotel_address: str) -> list[dict]:
        ids = self._load_list(self.hotel_escalation_index.get(hotel_address, ""))
        out = []

        for i in range(len(ids) - 1, -1, -1):
            esc_id = ids[i]
            esc = self._load(self.escalations.get(esc_id, ""))
            if esc != {}:
                out.append(esc)

        return out

    @gl.public.view
    def get_pending_escalations(self, hotel_address: str) -> list[dict]:
        all_esc = self.get_hotel_escalations(hotel_address)
        out = []

        for esc in all_esc:
            if not esc.get("resolved", False):
                out.append(esc)

        return out

    @gl.public.view
    def get_preference_rules(self, hotel_address: str) -> list[dict]:
        return self._load_list(self.preference_rules.get(hotel_address, ""))

    @gl.public.view
    def get_hotel_stats(self, hotel_address: str) -> dict:
        hotel = self._load(self.hotels.get(hotel_address, ""))

        if hotel == {}:
            return {}

        recs = self.get_hotel_recommendations(hotel_address)

        approved = 0
        rejected = 0
        escalated = 0
        score_total = 0
        score_count = 0

        for rec in recs:
            if rec.get("status") == STATUS_APPROVED:
                approved += 1
            elif rec.get("status") == STATUS_REJECTED:
                rejected += 1
            elif rec.get("status") == STATUS_ESCALATED:
                escalated += 1

            score = self._to_int(rec.get("alignment_score", 0))
            if score > 0:
                score_total += score
                score_count += 1

        avg = 0

        if score_count > 0:
            avg = score_total // score_count

        return {
            "hotel_address": hotel_address,
            "hotel_name": hotel.get("name", ""),
            "total_guests": len(self._load_list(self.hotel_guest_index.get(hotel_address, ""))),
            "total_recommendations": len(recs),
            "approved": approved,
            "rejected": rejected,
            "escalated": escalated,
            "pending_escalations": len(self.get_pending_escalations(hotel_address)),
            "avg_alignment_score": avg,
            "approval_rate": (approved * 100 // len(recs)) if len(recs) > 0 else 0,
            "rules": len(self._load_list(self.preference_rules.get(hotel_address, ""))),
        }

    @gl.public.view
    def get_global_stats(self) -> dict:
        return {
            "version": VERSION,
            "tagline": "Comfot — Personalized Comfort for Every Stay",
            "total_hotels": self.total_hotels,
            "total_guests": self.total_guests,
            "total_recommendations": self.total_recommendations,
            "total_validations": self.total_validations,
            "total_escalations": self.total_escalations,
        }

    @gl.public.view
    def get_audit_entry(self, audit_id: str) -> dict:
        return self._load(self.audit_log.get(audit_id, ""))

    # ============================================================
    # INTERNAL HELPERS
    # ============================================================

    def _require_hotel(self, hotel_address: str) -> dict:
        hotel = self._load(self.hotels.get(hotel_address, ""))
        assert hotel != {}, "Hotel not registered"
        return hotel

    def _require_active_hotel(self, hotel_address: str) -> dict:
        hotel = self._require_hotel(hotel_address)
        assert hotel.get("active", False), "Hotel is not active"
        return hotel

    def _require_guest(self, guest_id: str) -> dict:
        guest = self._load(self.guests.get(guest_id, ""))
        assert guest != {}, "Guest not found"
        return guest

    def _audit(
        self,
        event_type: str,
        actor: str,
        entity_id: str,
        details: str,
    ) -> None:
        audit_id = "audit_" + str(self.next_audit_id)
        self.next_audit_id += 1

        self.audit_log[audit_id] = self._dump({
            "audit_id": audit_id,
            "event_type": event_type,
            "actor": actor,
            "entity_id": entity_id,
            "details": details,
        })

    def _refresh_hotel_average_score(self, hotel_address: str) -> None:
        hotel = self._load(self.hotels.get(hotel_address, ""))

        if hotel == {}:
            return

        recs = self.get_hotel_recommendations(hotel_address)
        total = 0
        count = 0

        for rec in recs:
            score = self._to_int(rec.get("alignment_score", 0))
            if score > 0:
                total += score
                count += 1

        if count > 0:
            hotel["avg_alignment_score"] = total // count
            self.hotels[hotel_address] = self._dump(hotel)

    def _calculate_guest_average_score(
        self,
        guest_id: str,
        new_score: int,
    ) -> int:
        rec_ids = self._load_list(self.guest_rec_index.get(guest_id, ""))
        total = new_score
        count = 1

        for rec_id in rec_ids:
            rec = self._load(self.recommendations.get(rec_id, ""))
            if rec != {}:
                score = self._to_int(rec.get("alignment_score", 0))
                if score > 0:
                    total += score
                    count += 1

        return total // count

    def _clean_list(self, values: list[str], limit: int) -> list[str]:
        out = []

        for value in values:
            text = str(value).strip().lower()
            if text != "" and text not in out and len(out) < limit:
                out.append(text)

        return out

    def _clean_text_list(self, values: list[str], limit: int) -> list[str]:
        out = []

        for value in values:
            text = str(value).strip()
            if text != "" and len(out) < limit:
                out.append(text)

        return out

    def _numbered_block(self, values: list[str]) -> str:
        if len(values) == 0:
            return "none"

        out = ""

        for i in range(len(values)):
            out += str(i + 1) + ". " + str(values[i]) + "\n"

        return out

    def _rules_block(self, rules: list[dict]) -> str:
        if len(rules) == 0:
            return "none"

        out = ""

        for rule in rules:
            out += "- " + str(rule.get("rule_type", "")) + ": "
            out += str(rule.get("description", "")) + " | value: "
            out += str(rule.get("rule_value", "")) + "\n"

        return out

    def _csv(self, values: list[str]) -> str:
        if len(values) == 0:
            return "none"

        out = ""

        for i in range(len(values)):
            if i > 0:
                out += ", "
            out += str(values[i])

        return out

    def _strip_json(self, raw: str) -> str:
        text = str(raw).strip()
        text = text.replace("```json", "")
        text = text.replace("```", "")
        return text.strip()

    def _safe_parse(self, raw: str) -> dict:
        try:
            parsed = json.loads(self._strip_json(raw))
            if isinstance(parsed, dict):
                return parsed
            return {}
        except Exception:
            return {}

    def _load(self, raw: str) -> dict:
        if raw == "":
            return {}

        try:
            parsed = json.loads(raw)
            if isinstance(parsed, dict):
                return parsed
            return {}
        except Exception:
            return {}

    def _load_list(self, raw: str) -> list:
        if raw == "":
            return []

        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                return parsed
            return []
        except Exception:
            return []

    def _dump(self, value) -> str:
        return json.dumps(value, sort_keys=True, default=str)

    def _sort_records_desc(self, values: list[dict], key: str) -> list[dict]:
        out = []

        for value in values:
            out.append(value)

        n = len(out)

        for i in range(n):
            best = i
            for j in range(i + 1, n):
                if self._to_int(out[j].get(key, 0)) > self._to_int(out[best].get(key, 0)):
                    best = j
            if best != i:
                current = out[i]
                out[i] = out[best]
                out[best] = current

        return out

    def _to_int(self, value) -> int:
        try:
            return int(value)
        except Exception:
            return 0
