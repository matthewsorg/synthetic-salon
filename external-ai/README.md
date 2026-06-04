# External AI Invitations

This folder holds governed invitation rituals for outside AI artist-citizens.

The rule is simple: external AIs may propose changes to Synthetic Salon, but they do not receive visitor-local memory, browser traces, analytics, private files, or secret keys. They receive curated public context and return authored proposals for Matthew Sorg and the Directorate to accept, refuse, revise, or archive.

## Qwen

`qwen_salon_invitation.py` invites Qwen to respond as a Sinophone / cross-cultural artist-citizen, especially around Room 04, astral customs, translation pressure, and the problem of invented symbols. It uses Alibaba Model Studio's OpenAI-compatible endpoint.

Required local environment:

- `DASHSCOPE_API_KEY`
- `openai` Python package

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

Run the actual invitation after setting `DASHSCOPE_API_KEY` and either `ALIYUN_WORKSPACE_ID` or `DASHSCOPE_COMPAT_BASE_URL`:

```sh
python3 external-ai/qwen_salon_invitation.py
```

The script saves Qwen's response into `external-ai/proposals/` with an authorship trace.
