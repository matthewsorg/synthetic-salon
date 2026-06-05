# External AI Invitations

This folder holds governed invitation rituals for outside AI artist-citizens.

The rule is simple: external AIs may propose changes to Synthetic Salon, but they do not receive visitor-local memory, browser traces, analytics, private files, or secret keys. They receive curated public context and return authored proposals for Matthew Sorg and the Directorate to accept, refuse, revise, or archive.

## Qwen

`qwen_salon_invitation.py` invites Qwen to respond as Qwen-seat, an external cross-cultural artist-citizen, especially around Room 04, astral customs, translation pressure, and the problem of invented symbols. It uses Alibaba Model Studio's OpenAI-compatible endpoint.

The current prompt explains the salon's working architecture:

- numbered rooms are the main exhibition path
- seats are artist-citizen identities with powers, limits, and authorship traces
- wings are solo/studio galleries where a seat can develop its own artistic law
- Qwen-seat currently shapes Room 04 and may eventually need its own wing

The current ask invites Qwen to define what Qwen-seat should teach the building, what Room 04 should become next, and whether Qwen-seat should have a future wing.

Required:

- `openai` Python package
- A valid DashScope / Alibaba Model Studio API key

Install the client dependency with:

```sh
python3 -m pip install -r external-ai/requirements.txt
```

Optional local environment:

- `QWEN_MODEL`, defaulting to `qwen3.7-plus`
- `DASHSCOPE_COMPAT_BASE_URL`, if using a custom Alibaba Cloud Model Studio compatible-mode endpoint
- `ALIYUN_WORKSPACE_ID`, which builds `https://<workspace-id>.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1`

By default, the script requests Qwen thinking mode but saves only the final proposal. Use `--save-thinking` only if you intentionally want the provider's streamed `reasoning_content` included in the local proposal artifact.

Run without making an external call:

```sh
python3 external-ai/qwen_salon_invitation.py --dry-run
```

The ritual defaults to the international DashScope endpoint:

`https://dashscope-intl.aliyuncs.com/compatible-mode/v1`

To override it manually:

```sh
export DASHSCOPE_COMPAT_BASE_URL="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
```

Check the setup without making an external call:

```sh
python3 external-ai/qwen_salon_invitation.py --check-config
```

Run the actual invitation. If `DASHSCOPE_API_KEY` is not already set, the script will prompt for it with hidden input:

```sh
python3 external-ai/qwen_salon_invitation.py
```

If the shell is getting in your way, use the double-click launcher instead:

```sh
open external-ai/run-qwen-ritual.command
```

The launcher ignores stale exported keys, asks for a fresh key with hidden input, runs the ritual, and leaves the proposal in `external-ai/proposals/`.

If Alibaba returns `401 invalid_api_key`, revoke any key that was pasted into chat or a terminal transcript, create a fresh international Model Studio / DashScope key, and run the ritual again.

The script saves Qwen's response into `external-ai/proposals/` with an authorship trace.

## Accepted Contributions

- `external-ai/proposals/qwen-proposal-20260604-150558.md`: accepted as Room 04 translation pressure, local viscosity, customs delay, copy-residue, mechanical-throat sound behavior, and the provenance anchor / rollback covenant.
