# Backend Tests

## Run

From `backend/`:

```bash
PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 pytest -q
```

This avoids unrelated global pytest plugin interference in local environments.
