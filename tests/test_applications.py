import pytest


@pytest.mark.asyncio
async def test_create_and_get_application(client, sample_application):
    create_resp = await client.post("/applications", json=sample_application)
    assert create_resp.status_code == 201
    created = create_resp.json()
    assert created["company"] == "Acme Co"
    assert created["status"] == "applied"

    get_resp = await client.get(f"/applications/{created['id']}")
    assert get_resp.status_code == 200
    assert get_resp.json()["role"] == "Frontend Engineer"


# --- Day 3 exercises -----------------------------------------------------
#
# 1. test_list_applications_filters_by_track
#    Create two applications on different tracks (e.g. "frontend" and
#    "python"), then GET /applications?track=python and assert only the
#    Python one comes back.
#
# 2. test_update_application_status
#    Create an application, PATCH it with {"status": "interview"}, then
#    GET it back and assert the status actually changed.
#
# 3. test_get_application_404
#    GET /applications/999 on an empty DB and assert you get a 404 —
#    make sure the "not found" path is actually covered, not just the
#    happy path.
