# Launch verification

Verified on October 21, 2026 (America/Los_Angeles).

## Website

- GitHub Pages deployment of `a9e9431acccbd62ae24e2a91aeb62b4261b415e4` succeeded.
- The live HTTPS site loads. Navigating to `http://www.jiggiscreation.com/` resolves to `https://jiggiscreation.com/`.
- Local JavaScript syntax checks and `npm run build` pass.
- All page image assets load, and all fragment-link targets exist.
- WebGL sculpture renders. Palette selection and pause/play state changes work.
- Emulated `prefers-reduced-motion: reduce` pauses the sculpture automatically.
- No warnings or errors were recorded in the inspected browser console.

| Chrome viewport | Horizontal overflow |
| --- | --- |
| 320 x 740 | None |
| 390 x 844 | None |
| 768 x 1024 | None |
| 1440 x 900 | None |
| 2560 x 1440 | None |

Phone and tablet full-page screenshots were reviewed. This checks responsive layouts in Chrome, not physical iPhone/Android hardware or Safari. The editorial photo's fixed-height cropping was corrected; its phone layout now preserves all four people. Animation controls are hidden in HTML until graphics initialize, and hide again on context loss. The no-WebGL and no-JavaScript paths were reviewed in source, not exhaustively device-tested.

Local proof screenshots are in ignored `qa/desktop.jpg` and `qa/phone-world.jpg`.

## Domain and email

- Namecheap uses `kami.ns.cloudflare.com` and `zac.ns.cloudflare.com`.
- Cloudflare holds the four GitHub Pages A records and the `www` CNAME.
- GitHub Pages has the custom domain and Enforce HTTPS enabled.
- Cloudflare Email Routing rule `shital@jiggiscreation.com` to verified destination `shital@guni.ai` is active.
- A test sent from the owner's separate Gmail account to the new address arrived in the `shital@guni.ai` inbox. Subject reference: `JC-20261021`.
- This is incoming forwarding. Outbound sending as the new address is not configured.

## Local repository metadata

The source files are saved in `D:\GitHubSrc\jiggiscreation`. GitHub contains the commits and successful deployments. The managed workspace makes `.git` read-only, so local Git history could not be synchronized from this session.

For this particular empty local repository, run in your own PowerShell:

```powershell
& 'D:\GitHubSrc\jiggiscreation\tools\connect-repository.ps1'
```

The script checks the repository, empty branch and index, expected origin, and exact source hashes before connecting main to the published history. It stops on local changes and never overwrites working-tree files. Ordinary cloned repositories do not need it.
