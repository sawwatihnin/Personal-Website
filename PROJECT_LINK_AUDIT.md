# Project link audit — November 8, 2026

All existing project destinations are retained. HTTP success verifies reachability only; it does not verify backend behavior, authentication, camera access, or video playback. LinkedIn links are labeled Project Post rather than Video Walkthrough because playback could not be confirmed.

| Destination | HTTP | Classification and checks |
| --- | --- | --- |
| [Destination](https://github.com/sawwatihnin/dearest.) | 200 | Source Code — repository page reachable; code not executed. |
| [Destination](https://dearest-pied.vercel.app) | 200 | Prototype — homepage and archive routes render; archive showed no letters. Submission, PII redaction and similarity retrieval not verified; no public letters submitted. |
| [Destination](https://github.com/arjbarber/hacknc2026) | 200 | Source Code — repository page reachable; code not executed. |
| [Destination](https://aerorithmetic.vercel.app/) | 200 | Prototype — interface renders but API remains Connecting, account/chart data unavailable and trade controls disabled. Backend requires owner review. |
| [Destination](https://github.com/sawwatihnin/liftai) | 200 | Source Code — repository page reachable; code not executed. |
| [Destination](https://www.linkedin.com/in/viviennehnin/details/projects/) | 999 | Project archive — LinkedIn blocked automated access (999); manual sign-in review required. |
| [Destination](https://megamind-lac.vercel.app/) | 200 | Prototype / Archived — now opens TheraCortex login/sign-up. Verify intended destination and original cognitive-test flow. |
| [Destination](https://www.linkedin.com/feed/update/urn:li:activity:7430429165079740416/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base%3BGcI2KafZSr%2Bj3f2jLpAXAQ%3D%3D) | 200 | Project post / recognition — LinkedIn may require sign-in; video playback unverified. |
| [Destination](https://www.linkedin.com/feed/update/urn:li:activity:7417249168416477184/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_projects_details%3BrT6XPgZPQH2NLaY2vxnblw%3D%3D) | 200 | Project post / recognition — LinkedIn may require sign-in; video playback unverified. |
| [Destination](https://mars-simulator-final.vercel.app/) | 200 | Working Live Demo — Step moved rover from (0,0) to (1,0) and reduced path length from 20 to 19. Full algorithm/obstacle coverage not tested. |
| [Destination](https://www.linkedin.com/feed/update/urn:li:activity:7433636443069071360/) | 200 | Project post / recognition — LinkedIn may require sign-in; video playback unverified. |
| [Destination](https://devpost.com/software/gratitude-afropix-26) | 200 | Archived case study — page reachable; linked media and hardware not independently exercised. |
| [Destination](https://www.linkedin.com/feed/update/urn:li:activity:7431373945838137344/) | 200 | Project post / recognition — LinkedIn may require sign-in; video playback unverified. |
| [Destination](https://devpost.com/software/empl-yment) | 200 | Archived case study — page reachable; linked media and hardware not independently exercised. |
| [Destination](https://www.linkedin.com/feed/update/urn:li:activity:7426812741325131776/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_projects_details%3BrT6XPgZPQH2NLaY2vxnblw%3D%3D) | 200 | Project post / recognition — LinkedIn may require sign-in; video playback unverified. |
| [Destination](https://admirable-croissant-dc549f.netlify.app/booth/name) | 200 | Prototype — start screen renders; camera, gestures and photo export require manual testing with camera access. |
| [Destination](https://www.linkedin.com/feed/update/urn:li:activity:7444074447369752577/) | 200 | Project post / recognition — LinkedIn may require sign-in; video playback unverified. |

## Local validation

Static site: no package/build pipeline is present. Validate JavaScript syntax, local assets, internal anchors, preserved original URLs/content, desktop/mobile layouts and expand/collapse interactions before deployment. Resume links now open the supplied PDF at /assets/vivienne-hnin-resume.pdf; email links remain mailto links.

## Manual follow-up

- Restore or confirm Aerorithmetic backend connectivity.
- Confirm MEGAMIND / TheraCortex URL and authenticated functionality.
- Test Dearest submission/redaction/retrieval with private test data in a controlled environment.
- Test PinchAPic camera, gesture and export flow on real hardware.
- Review LinkedIn project posts/video playback while signed in; the projects archive returned HTTP 999.
- LiftAI is presented as source code; webcam functionality requires a local hardware test.
