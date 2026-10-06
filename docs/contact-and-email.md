# Contacts, email and address privacy

How the site publishes contact channels without handing a personal address to spam harvesters, and how the domain mailbox and git identity are set up. The repository is public: anything committed, including commit metadata and PR text, stays readable.

## 1. One source of truth

- Every public profile and contact channel lives in `src/config/profile.ts`: `github`, `linkedin`, `orcid`, `habr`, `email`, `telegram`. The header, footer, homepages, CV, `/contact`, `/ru/contact` and the Person JSON-LD read from it. Never write a profile URL or handle directly into a component.
- `null` means not configured: the channel is hidden everywhere and left out of structured data.
- The build validates every value. A malformed URL or a placeholder (`example`, `your`, `todo`, …) fails the build instead of being published.
- To add a channel, add the field to `Profile`, a rule to `profileRules`, a definition to `linkDefinitions`, and the id to the lists that should show it (`contactChannels`, `footerProfiles`, `cvProfiles`, `sameAs`).

## 2. Email stays out of plain text

- The address is stored as parts: `email: { user: 'fedor', domain: 'fpakhurov.com' }`. Never write it whole anywhere in the repository, in commit messages or in PR descriptions.
- The contact page shows a "Show address" button. A small script assembles the address on click and swaps in a `mailto:` link. Harvesters that scan HTML for `@` or `mailto:` find nothing.
- The email is not in the JSON-LD. Structured data is the easiest place for a harvester to read, and search engines do not need it.
- Without JavaScript the Email row does nothing; the other channels still work.
- Check after a build: `grep -rlE "fedor@|mailto:[a-z]" dist` must print nothing. The only `mailto` in `dist` is the `mailto:${…}` template inside the script.
- Use a domain address, not a personal inbox. If the address starts receiving spam, delete the alias and publish a new one; the personal inbox behind it never appears on the site.

## 3. Domain mailbox

DNS for `fpakhurov.com` is hosted at Beget. The A records (`185.199.108–111.153`) and `www → fpakhurov.github.io` serve GitHub Pages; leave them alone when changing mail records.

### Option A: Beget mail

If the Beget control panel offers **Почта** for the domain on the current plan, create the `fedor` address there as a mailbox or as a forward to the personal inbox. The MX (`mx1/mx2.beget.com`) and SPF (`v=spf1 redirect=beget.com`) records already point at Beget, so no DNS change is needed. If mail requires a paid hosting plan, use option B.

### Option B: ImprovMX forwarding (free)

The free plan covers one domain, 25 aliases and 500 forwarded messages a day. It receives only; it does not send.

1. At improvmx.com, add the domain `fpakhurov.com` and the inbox to forward to.
2. Replace the default catch-all `*` alias with a single alias `fedor`. A catch-all forwards spam sent to any made-up address.
3. In the Beget DNS editor for `fpakhurov.com`:
   - replace the MX records with `mx1.improvmx.com` (priority 10) and `mx2.improvmx.com` (priority 20);
   - replace the SPF TXT record with `v=spf1 include:spf.improvmx.com ~all`.
4. Wait until the ImprovMX dashboard shows the domain as active (minutes to a few hours).
5. Send a test message to the address from another account and check that it arrives, including the spam folder.

### Replying from the domain address

Optional. Gmail's **Send mail as** can send as the domain address through `smtp.gmail.com` with an app password (requires two-factor sign-in). Add `include:_spf.google.com` to the SPF record. Without the domain's own DKIM signature some recipients may see "via gmail.com" or file the message as spam. Reliable sending needs a paid mailbox (Beget hosting, Google Workspace or similar).

## 4. Commit email

Commit metadata is public: anyone can read the author address of every commit, for example by adding `.patch` to a commit URL.

- This repository commits as `63148053+fpakhurov@users.noreply.github.com`. It is set as `user.email` in the repository's own git config, which every worktree shares, and in the separate clone at `~/code/fpakhurov.com-claude`. A new clone needs `git config user.email 63148053+fpakhurov@users.noreply.github.com`.
- GitHub → Settings → Emails: turn on **Keep my email addresses private**, so merges and edits made on github.com also use the noreply address.
- On the same page, **Block command line pushes that expose my email** rejects pushes of commits that carry the private address. Turn it on only once branches with older commits have been pushed or merged; otherwise those pushes fail.
- Earlier commits on `main` keep the old author address. Removing it would mean rewriting and force-pushing `main`, which breaks every clone, worktree and open branch. That was decided against.
