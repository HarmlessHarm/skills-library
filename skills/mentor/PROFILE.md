# Learning profile

Use this reference at each skill invocation to load and manage cross-session
learning evidence before task work. History guides question selection and
prevents repeating already demonstrated concepts; the developer still explains
learning relevant to the current change.

## Consent and location

Persistence is the default. On first use, explain that concise learning evidence
will be stored locally across sessions, identify the profile location, and offer
session-only operation as an opt-out. Confirm who the learner is; never infer
identity from a Git author or shared workstation.

Use one developer-owned local file outside repositories and shared or synced
folders. The default is `~/.local/share/mentor/profile.json` on Linux. Resolve
the location and ensure it is outside version control. Keep separate profiles
for separate learners. Reuse the established preference and location in later
sessions without prompting again; access only that known path, never scan home
folders for profiles. If the developer opts out, remain session-only and do not
repeat the prompt.

## Evidence format

Use JSON with this shape:

```json
{
  "version": 1,
  "concepts": [
    {
      "concept": "boundary validation",
      "scope": "general",
      "project": null,
      "observations": [
        {
          "date": "YYYY-MM-DD",
          "context": "input-validation change",
          "assistance": "independent",
          "evidence": "Explained the boundary check and justified a new input case.",
          "uncertainty": "Retention has not yet been revisited."
        }
      ]
    }
  ]
}
```

`scope` is `general` or `project`. For project-scoped knowledge, `project` is a
developer-approved local alias; keep those observations within that project's
question selection. General concepts can inform checks across repositories.
`assistance` is `independent` or `assisted`; independent means unhinted within the
observed check, not verified absence of outside help. Record actual dates.

Store concise concept-level evidence and uncertainties only. Keep source code,
full answers, transcripts, secrets, remote URLs, and personnel rankings out of
the profile. Use generic context labels and avoid confidential domain details.
Keep assessed-content snapshots and commit permissions session-only.

Preserve distinct assisted and independent observations, including useful later
retrieval results. One success records a demonstrated concept; do not routinely
ask the developer to prove it again. Use subsequent independent evidence to
select deeper probes or revisit concepts when relevant, not to assign an
automatic global level or permanent mastery label. An unresolved gap may be
recorded without treating the whole checkpoint as a pass.

Distinguish planning reasoning from post-implementation understanding in evidence
summaries. Planning predictions are tentative until checked against the actual
code and tests; agreement on a plan is not evidence of understanding its eventual
implementation.

## Read and write

Validate the supported version, field shapes, and assistance/scope values before
using existing data. Report unreadable, malformed, or unsupported profiles;
preserve them instead of treating them as empty history.

Before saving, show the developer a concise proposed evidence summary so they
can correct misinterpretations. Update only the agreed learner's file, preserve
unrelated observations, and check for concurrent modification. Prefer an atomic
replacement using available file tooling. Confirm successful writing and verify
the saved content before claiming persistence.

Surface read, write, permission, or conflict errors explicitly. Offer an
explicit session-only continuation or a retry; retain the learning evidence in
the session meanwhile. Profile availability does not determine learning status,
and a failed write never becomes a claimed save.

## Developer control

On request, display the profile, correct a named observation, or delete selected
evidence. Treat a developer correction as their correction, not a newly observed
demonstration. Recompute question selection from the remaining evidence.

For full deletion, confirm the exact resolved profile file and delete only that
file, then verify deletion and return to session-only operation. Explain that
this cannot erase existing chat history, backups, or previously shared copies.

Sharing requires explicit agreement on the selected content and recipient each
time; default to a minimal summary the developer can review and share themselves.
Opting into storage is not consent to share. Never treat the profile as a
management scorecard or authorization to relax the current checkpoint.
