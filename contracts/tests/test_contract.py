"""
Comfot Contract — Unit Tests
Run: python -m pytest contracts/tests/ -v
(Tests run against Genlayer Studio simulator)
"""

import pytest
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

HOTEL_ADDR  = "0xHotelAddress1234567890"
HOTEL_NAME  = "Grand Comfot Hotel"
GUEST_REF   = "guest_001"

HOTEL_DATA = {
    "name": HOTEL_NAME,
    "property_type": "luxury",
    "amenities": ["spa", "pool", "gym", "restaurant", "bar", "concierge"],
    "room_types": ["standard", "deluxe", "suite", "penthouse"],
    "packages": ["honeymoon", "business", "wellness"],
}

GUEST_DATA = {
    "guest_ref": GUEST_REF,
    "loyalty_tier": "gold",
    "stay_count": 8,
    "reviews": [
        "The spa was exceptional — I visited every morning. Best way to start the day.",
        "Room was quiet and on a high floor, exactly what I needed for work.",
        "Loved the pillow menu. The feather-free option was perfect.",
        "Bar service was outstanding. The cocktail selection is world-class.",
    ],
    "conversation_log": [
        "Guest requested late checkout at 2pm on arrival.",
        "Guest asked about spa membership upgrade.",
        "Guest mentioned preference for non-smoking high floor rooms.",
    ],
    "special_requests": ["feather-free bedding", "high floor", "late checkout"],
}


class MockGLMessage:
    sender_address = HOTEL_ADDR

class MockGL:
    message = MockGLMessage()

    @staticmethod
    def exec_prompt(prompt: str) -> str:
        # Simulate LLM responses for testing
        if "preference tags" in prompt.lower():
            import json
            return json.dumps([
                "spa regular", "high floor preferred", "late checkout needed",
                "quiet room essential", "feather-free bedding", "bar visitor",
                "business traveler", "early riser"
            ])
        if "personalized stay recommendation" in prompt.lower():
            import json
            return json.dumps({
                "room": "suite",
                "amenities": ["spa", "bar", "concierge"],
                "packages": ["wellness"],
                "justification": (
                    "As a Gold loyalty member with 8 stays and a strong affinity for the spa, "
                    "the suite on a high floor offers the quiet environment this guest requires. "
                    "The wellness package and spa access align directly with their morning routine."
                )
            })
        if "independent ai validator" in prompt.lower():
            import json
            return json.dumps({
                "score": 88,
                "decision": "approve",
                "reasoning": (
                    "The suite recommendation directly addresses the guest's high-floor preference "
                    "and feather-free bedding request. Spa and wellness package align strongly with "
                    "their stated routine. Score of 88 reflects excellent alignment."
                ),
                "dimension_scores": {
                    "preference_alignment": 92,
                    "loyalty_appropriateness": 88,
                    "special_request_coverage": 85,
                    "justification_quality": 84,
                }
            })
        return "[]"


# Patch gl module before importing contract
sys.modules["gl"] = MockGL()


def make_contract():
    # Import after patching
    import importlib.util
    spec = importlib.util.spec_from_file_location(
        "comfot_contract",
        os.path.join(os.path.dirname(__file__), "..", "comfot_contract.py")
    )
    mod = importlib.util.load_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.ComfotContract()


# ─── Tests ───────────────────────────────────────────────────

def test_register_hotel():
    c = make_contract()
    c.register_hotel(**HOTEL_DATA)
    hotel = c.get_hotel(HOTEL_ADDR)
    assert hotel["name"] == HOTEL_NAME
    assert hotel["property_type"] == "luxury"
    assert hotel["active"] is True
    assert len(hotel["amenities"]) == 6


def test_register_hotel_invalid_type():
    c = make_contract()
    with pytest.raises(AssertionError):
        c.register_hotel(
            name="Test", property_type="invalid",
            amenities=["spa"], room_types=["deluxe"], packages=[]
        )


def test_submit_guest_profile():
    c = make_contract()
    c.register_hotel(**HOTEL_DATA)
    guest_id = c.submit_guest_profile(**GUEST_DATA)
    assert guest_id.startswith("g_")
    guest = c.get_guest(guest_id)
    assert guest["loyalty_tier"] == "gold"
    assert guest["stay_count"] == 8
    assert len(guest["reviews"]) == 4
    assert "feather-free bedding" in guest["special_requests"]


def test_submit_guest_requires_hotel():
    c = make_contract()
    with pytest.raises(AssertionError, match="Hotel not registered"):
        c.submit_guest_profile(**GUEST_DATA)


def test_request_recommendation():
    c = make_contract()
    c.register_hotel(**HOTEL_DATA)
    guest_id = c.submit_guest_profile(**GUEST_DATA)
    rec_id = c.request_recommendation(guest_id)
    assert rec_id.startswith("id_")

    rec = c.get_recommendation(rec_id)
    assert rec["guest_id"] == guest_id
    assert rec["suggested_room"] in HOTEL_DATA["room_types"]
    assert rec["alignment_score"] > 0
    assert rec["status"] in ["approved", "rejected", "escalated"]


def test_recommendation_sets_preference_tags():
    c = make_contract()
    c.register_hotel(**HOTEL_DATA)
    guest_id = c.submit_guest_profile(**GUEST_DATA)
    c.request_recommendation(guest_id)
    guest = c.get_guest(guest_id)
    assert len(guest["preference_tags"]) > 0


def test_validation_stored():
    c = make_contract()
    c.register_hotel(**HOTEL_DATA)
    guest_id = c.submit_guest_profile(**GUEST_DATA)
    rec_id = c.request_recommendation(guest_id)
    validation = c.get_validation_for_rec(rec_id)
    assert validation["rec_id"] == rec_id
    assert validation["consensus_result"] in ["pass", "fail", "escalate"]
    assert len(validation["validator_votes"]) > 0


def test_audit_log():
    c = make_contract()
    c.register_hotel(**HOTEL_DATA)
    guest_id = c.submit_guest_profile(**GUEST_DATA)
    c.request_recommendation(guest_id)
    log = c.get_audit_log(HOTEL_ADDR)
    assert len(log) >= 3
    event_types = [e["event_type"] for e in log]
    assert "hotel_registered" in event_types
    assert "guest_submitted" in event_types
    assert "consensus_finalized" in event_types


def test_hotel_stats():
    c = make_contract()
    c.register_hotel(**HOTEL_DATA)
    guest_id = c.submit_guest_profile(**GUEST_DATA)
    c.request_recommendation(guest_id)
    stats = c.get_hotel_stats(HOTEL_ADDR)
    assert stats["total_guests"] == 1
    assert stats["total_recommendations"] == 1
    assert stats["avg_alignment_score"] > 0


def test_guest_id_deterministic():
    c = make_contract()
    id1 = c.make_guest_id(HOTEL_ADDR, GUEST_REF)
    id2 = c.make_guest_id(HOTEL_ADDR, GUEST_REF)
    assert id1 == id2


def test_make_guest_id_case_insensitive():
    c = make_contract()
    id1 = c.make_guest_id(HOTEL_ADDR, "Guest_001")
    id2 = c.make_guest_id(HOTEL_ADDR, "guest_001")
    assert id1 == id2


if __name__ == "__main__":
    tests = [
        test_register_hotel,
        test_register_hotel_invalid_type,
        test_submit_guest_profile,
        test_submit_guest_requires_hotel,
        test_request_recommendation,
        test_recommendation_sets_preference_tags,
        test_validation_stored,
        test_audit_log,
        test_hotel_stats,
        test_guest_id_deterministic,
        test_make_guest_id_case_insensitive,
    ]
    passed = failed = 0
    for t in tests:
        try:
            t()
            print(f"  PASS  {t.__name__}")
            passed += 1
        except Exception as e:
            print(f"  FAIL  {t.__name__}: {e}")
            failed += 1
    print(f"\n{passed} passed, {failed} failed")
