# Community applications — parked integration

Owner decision: community membership is by application and manual review. The floating-photo section is the community invitation. Applications should eventually reach the owner's email. No provider or recipient has been configured.

## Implemented preview

Apply to join opens CommunityApplication.svelte: name, email, reason for joining, optional contribution, draft guidelines and agreement. Native validation includes length limits, email syntax and rejection of whitespace-only required answers. Check my application validates locally; it never claims a submission was sent. There is no network submission, browser storage or analytics capture of answers. Closing unmounts the form and clears its fields. Focus is trapped/restored, background is inert and scroll is locked. Floating photos pause during the application.

Guidelines are proposed copy, not a finalized policy. Production privacy wording and retention must be agreed before launch.

## Proposed secure delivery

Use Formspree with a form-ID endpoint and verified recipient email. Keep email passwords and private service credentials out of the browser and repository. The public form ID is not a secret. Enable provider-side spam filtering, CAPTCHA and a honeypot; domain restrictions supplement these controls, but are not authentication. Enforce input limits on the receiving service, not just in browser validation. No attachments or identity documents.

Protect the review inbox and provider account with MFA where supported; restrict access to reviewers. Never expose applications in public GitHub files or public spreadsheets. Treat submitted text as untrusted; do not render arbitrary HTML or follow applicant links automatically. Keep community invitation links private and send only after approval. Email notification does not constitute acceptance or verify an applicant's identity.

Before launch: publish processing purpose, provider, review contact, deletion contact and agreed retention period. Proposed unsuccessful-application retention: 90 days, including email copies; owner must confirm. Avoid collecting sensitive information and separate optional marketing consent from the application.

## Resume checklist

1. Owner creates provider account/form and verifies recipient email; supply only the public endpoint, never passwords.
2. Confirm service limits, retention, spam controls, privacy wording and final guidelines.
3. Wire HTTPS submission with pending/success/error states. Show received only after confirmed acceptance by the service; preserve answers on failure and prevent duplicate clicks.
4. Test delivery to the actual inbox, spam rejection, failure/retry, keyboard and mobile journeys using agreed test data.
5. Remove preview labels only after end-to-end delivery is confirmed. Review each application before manually sending an invitation.

References: https://help.formspree.io/articles/troubleshooting/how-to-prevent-spam/ and https://help.formspree.io/articles/form-and-project-settings/restrict-to-domain/ (researched in the preceding discussion).

No external account creation, email sending or deployment in this preview. --codex
