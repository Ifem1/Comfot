"""
Comfot contract workflow tests.
Run: python -m pytest contracts/tests/ -v
"""

import importlib.util
import json
import os
import sys
import types

import pytest


HOTEL_ADDR = "0xHotelAddress1234567890"
HOTEL_NAME = "Grand Comfot Hotel"
GUEST_REF = "guest_001"


class TreeMap(dict):
    pass


class MockMessage:
    sender_address = HOTEL_ADDR


class MockDecoratorGroup:
    @staticmethod
    def write(fn):
        return fn

    @staticmethod
    def view(fn):
        return fn


class MockNondet:
    @staticmethod
    def exec_prompt(prompt: str) -> str:
        prompt_l = prompt.lower()
        if "short actionable preference tag" in prompt_l:
            return json.dumps({
                "tags": [
                    "quiet high floor",
                    "spa routine",
                    "late checkout",
                    "feather free bedding",
                ],
                "summary": "Guest values quiet rooms, wellness, and flexible departure.",
            })
        if "senior hotel concierge" in prompt_l:
            return json.dumps({
                "room": "suite",
                "amenities": ["spa", "bar", "concierge"],
                "packages": ["wellness"],
                "upsells": ["Evening spa appointment"],
                "justification": "The suite fits the guest's quiet high-floor preference and loyalty tier.",
                "guest_message": "Your stay has been prepared around quiet comfort and wellness.",
            })
        if "independent genlayer validator" in prompt_l:
            return json.dumps({
                "overall_score": 88,
                "decision": "approve",
                "reasoning": "The recommendation aligns with the guest evidence and available inventory.",
                "dimension_scores": {
                    "preference_alignment": 90,
                    "loyalty_appropriateness": 85,
                    "special_request_coverage": 88,
                    "inventory_validity": 100,
                    "upsell_relevance": 80,
                },
                "flags": [],
            })
        return "{}"


class MockEqPrinciple:
    @staticmethod
    def prompt_comparative(fn, _description):
        return fn()


class MockContract:
    pass


mock_gl = types.SimpleNamespace(
    Contract=MockContract,
    message=MockMessage(),
    public=MockDecoratorGroup(),
    nondet=MockNondet(),
    eq_principle=MockEqPrinciple(),
)

mock_genlayer = types.ModuleType("genlayer")
mock_genlayer.gl = mock_gl
mock_genlayer.TreeMap = TreeMap
mock_genlayer.bigint = int
sys.modules["genlayer"] = mock_genlayer


CONTRACT_PATH = os.path.join(os.path.dirname(__file__), "..", "comfot_contract.py")


def make_contract():
    spec = importlib.util.spec_from_file_location("comfot_contract", CONTRACT_PATH)
    mod = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(mod)
    return mod.ComfotContract()


HOTEL_DATA = {
    "name": HOTEL_NAME,
    "property_type": "luxury",
    "description": "A luxury city hotel.",
    "location": "Lagos",
    "amenities": ["spa", "pool", "gym", "restaurant", "bar", "concierge"],
    "room_types": ["standard", "deluxe", "suite", "penthouse"],
    "packages": ["honeymoon", "business", "wellness"],
    "star_rating": 5,
}


GUEST_DATA = {
    "guest_ref": GUEST_REF,
    "loyalty_tier": "gold",
    "stay_count": 8,
    "total_spend_band": "high",
    "reviews": [
        "The spa was exceptional.",
        "Room was quiet and on a high floor.",
    ],
    "conversation_log": [
        "Guest requested late checkout.",
        "Guest asked about spa membership upgrade.",
    ],
    "special_requests": ["feather-free bedding", "high floor", "late checkout"],
    "dietary_needs": ["light meals"],
    "room_history": ["deluxe"],
    "language": "en",
}


def register_hotel(contract):
    contract.register_hotel(**HOTEL_DATA)


def submit_guest(contract, guest_ref=GUEST_REF):
    data = dict(GUEST_DATA)
    data["guest_ref"] = guest_ref
    return contract.submit_guest_profile(**data)


def test_register_hotel():
    c = make_contract()
    register_hotel(c)
    hotel = c.get_hotel(HOTEL_ADDR.lower())
    assert hotel["name"] == HOTEL_NAME
    assert hotel["property_type"] == "luxury"
    assert hotel["active"] is True
    assert len(hotel["amenities"]) == 6


def test_register_hotel_invalid_type():
    c = make_contract()
    with pytest.raises(AssertionError, match="Invalid property type"):
        c.register_hotel(
            name="Test",
            property_type="invalid",
            description="Bad type",
            location="Lagos",
            amenities=["spa"],
            room_types=["deluxe"],
            packages=[],
            star_rating=4,
        )


def test_submit_guest_profile_stores_guest_ref_and_lookup():
    c = make_contract()
    register_hotel(c)
    guest_id = submit_guest(c)
    assert guest_id == "guest_1"
    assert c.get_guest_id(HOTEL_ADDR.lower(), "Guest_001") == guest_id

    guest = c.get_guest(guest_id)
    assert guest["guest_ref"] == GUEST_REF
    assert guest["loyalty_tier"] == "gold"
    assert guest["stay_count"] == 8
    assert "feather-free bedding" in guest["special_requests"]


def test_submit_guest_updates_existing_ref_without_duplicate_index():
    c = make_contract()
    register_hotel(c)
    first_id = submit_guest(c, "repeat_ref")
    second_id = submit_guest(c, "Repeat_Ref")
    assert first_id == second_id
    assert c.get_hotel_guest_ids(HOTEL_ADDR.lower()) == [first_id]


def test_submit_guest_requires_hotel():
    c = make_contract()
    with pytest.raises(AssertionError, match="Hotel not registered"):
        submit_guest(c)


def test_request_recommendation_flow_and_ordering():
    c = make_contract()
    register_hotel(c)
    guest_id = submit_guest(c)

    rec_1 = c.request_recommendation(guest_id)
    rec_2 = c.request_recommendation(guest_id)

    assert rec_1 == "rec_1"
    assert rec_2 == "rec_2"

    rec = c.get_recommendation(rec_2)
    assert rec["guest_id"] == guest_id
    assert rec["guest_ref"] == GUEST_REF
    assert rec["sort_order"] == 2
    assert rec["suggested_room"] in HOTEL_DATA["room_types"]
    assert rec["alignment_score"] == 88
    assert rec["status"] == "approved"

    guest_recs = c.get_guest_recommendations(guest_id)
    hotel_recs = c.get_hotel_recommendations(HOTEL_ADDR.lower())
    assert [r["rec_id"] for r in guest_recs] == ["rec_2", "rec_1"]
    assert [r["rec_id"] for r in hotel_recs] == ["rec_2", "rec_1"]


def test_validation_stored_for_recommendation():
    c = make_contract()
    register_hotel(c)
    guest_id = submit_guest(c)
    rec_id = c.request_recommendation(guest_id)

    validation = c.get_validation_for_recommendation(rec_id)
    assert validation["rec_id"] == rec_id
    assert validation["guest_ref"] == GUEST_REF
    assert validation["consensus_result"] == "pass"
    assert validation["alignment_score"] == 88


def test_hotel_stats_after_recommendation():
    c = make_contract()
    register_hotel(c)
    guest_id = submit_guest(c)
    c.request_recommendation(guest_id)

    stats = c.get_hotel_stats(HOTEL_ADDR.lower())
    assert stats["total_guests"] == 1
    assert stats["total_recommendations"] == 1
    assert stats["approved"] == 1
    assert stats["avg_alignment_score"] == 88
