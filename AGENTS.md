# AGENTS.md

## Session Notes Rule

- Append a log entry to `session-notes.md` only when the user explicitly asks to save the conversation.
- Trigger phrases include requests like "대화 저장해줘" or equivalent.
- Preserve the user's original message text exactly in each entry.
- Keep entries concise and factual.
- If no file/code change happened, still log the decision or answer.

## Entry Format

Use this format for each appended entry:

```md
## YYYY-MM-DD HH:MM (UTC)
- User message (raw): "..."
- Actions: ...
- Files changed: ...
- Git: ...
- Next: ...
```
