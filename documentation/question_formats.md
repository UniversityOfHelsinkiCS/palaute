# Question formats

May be outdated, needs review asap.

The question data (question format and answer format) is stored in JSONB which is schemaless, so the format is described here.

## Likert

Question data example:

```json
{
  "data": {
    "label": "Example label",
    "description": "Example description"
  }
}
```

Feedback data example:

```json
{
  "data": "1"
}
```

## Single choice

Question data example:

```json
{
  "data": {
    "label": "Example label",
    "options": [{ "label": "Example option label", "id": "5cc74529-5ea4-4c24-9365-568d7a792cda" }]
  }
}
```

Feedback data example:

```json
{
  "data": "5cc74529-5ea4-4c24-9365-568d7a792cda"
}
```

## Multiple choice

Question data example:

```json
{
  "data": {
    "label": "Example label",
    "options": [{ "label": "Example option label", "id": "5cc74529-5ea4-4c24-9365-568d7a792cda" }]
  }
}
```

Feedback data example:

```json
{
  "data": ["5cc74529-5ea4-4c24-9365-568d7a792cda"]
}
```

## Open

Question data example:

```json
{
  "data": {
    "label": "Example label"
  }
}
```

Feedback data example:

```json
{
  "data": "Example open feedback"
}
```
