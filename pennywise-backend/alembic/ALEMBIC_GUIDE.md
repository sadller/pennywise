# Alembic Quick Reference Guide

## Setup Status ✅
- Alembic installed and configured
- `alembic.ini` updated to use environment variables
- `alembic/env.py` configured with your models

## Required .env File
```env
DATABASE_URL=postgresql+pg8000://postgres:your_password_with_at_symbol_encoded@db.qsiprynzlipnihzjazto.supabase.co:5432/postgres
```
**Note**: Replace `@` with `%40` in password

## Essential Commands

### Initial Setup
```bash
# Test configuration
python test_alembic.py

# Create first migration
alembic revision --autogenerate -m "Initial migration"

# Apply migration
alembic upgrade head
```

### Daily Workflow
```bash
# 1. Modify your model (app/models/user.py)
# 2. Generate migration
alembic revision --autogenerate -m "Description of changes"

# 3. Review generated file in alembic/versions/
# 4. Apply migration
alembic upgrade head
```

### Status & History
```bash
# Check current status
alembic current

# View history
alembic history

# Show specific migration
alembic show <revision_id>
```

### Rollback
```bash
# Rollback one step
alembic downgrade -1

# Rollback to specific revision
alembic downgrade <revision_id>

# Rollback all
alembic downgrade base
```

## Adding New Models
1. Create model file in `app/models/`
2. Import in `alembic/env.py`:
```python
from app.models.user import User
from app.models.expense import Expense  # Add new models here
```
3. Generate and apply migration

## Troubleshooting

### Connection Issues
- Verify DATABASE_URL format
- Check password URL-encoding (`@` → `%40`)
- Confirm Supabase credentials

### No Changes Detected
- Ensure models imported in `alembic/env.py`
- Check if changes actually differ from database

### Migration Conflicts
- Coordinate with team members
- Use `alembic merge` if needed

## File Locations
- Migration files: `alembic/versions/`
- Configuration: `alembic.ini`
- Environment: `alembic/env.py`
- Test script: `test_alembic.py` 