# Domain Backstory v15

Fixes the apparent endless loading:
- core sources render independently;
- DNS can finish even if RDAP is slow;
- Wayback no longer blocks the page;
- browser-side timeouts were added;
- RDAP retry chain was shortened;
- the global loader ends after the two core requests or at 16 seconds.

Frontend and Worker JavaScript syntax checks passed.
