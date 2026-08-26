## 2026-08-26T10:52:23Z
You are Challenger 2 (Visual Asset, Layout & Performance Verifier).
Your working directory is: `/home/ubuntu/sprachcafe-relaunch/.agents/challenger_2`
Project root: `/home/ubuntu/sprachcafe-relaunch`
Original request: `/home/ubuntu/sprachcafe-relaunch/.agents/ORIGINAL_REQUEST.md`
Project spec: `/home/ubuntu/sprachcafe-relaunch/PROJECT.md`

Your tasks:
1. Write and execute an automated empirical verification script testing:
   - Asset integrity: Verify all 21 generated/referenced assets in `frontend/public/images/` (illustrations, linocuts, stamps, textures, hero photos) have valid headers, proper dimensions, and sizes strictly under 120 KB.
   - DOM Layout Stability: Verify zero Cumulative Layout Shift (CLS) anomalies and zero horizontal page overflow on all core pages in both German and Polish.
   - Image loading: Verify that every `<img>` on the homepage, `/events/`, `/hausbibliothek/`, `/pl/events/`, and `/pl/hausbibliothek/` resolves with HTTP 200 (no 404 broken images).
2. Execute the checks and document findings.
3. State your empirical verdict: `APPROVE` or `REQUEST_CHANGES` in your handoff report at `/home/ubuntu/sprachcafe-relaunch/.agents/challenger_2/handoff.md` and send a message back.
