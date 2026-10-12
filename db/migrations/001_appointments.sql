CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY,
  reference varchar(24) NOT NULL UNIQUE,
  booking_key uuid NOT NULL UNIQUE,
  request_hash char(64) NOT NULL,
  full_name varchar(100) NOT NULL,
  email varchar(254) NOT NULL,
  phone varchar(25) NOT NULL,
  service varchar(24) NOT NULL CHECK (service IN ('sworn','notarized','delivery','consultation','other')),
  notes varchar(600) NOT NULL DEFAULT '',
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  time_zone varchar(32) NOT NULL DEFAULT 'Europe/Istanbul' CHECK (time_zone = 'Europe/Istanbul'),
  status varchar(12) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed','cancelled')),
  privacy_acknowledged_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cancelled_at timestamptz,
  CHECK (ends_at = starts_at + INTERVAL '20 minutes'),
  CHECK (EXTRACT(MINUTE FROM starts_at AT TIME ZONE 'Europe/Istanbul') IN (0,20,40)),
  CHECK (EXTRACT(SECOND FROM starts_at) = 0),
  CHECK ((status = 'confirmed' AND cancelled_at IS NULL) OR (status = 'cancelled' AND cancelled_at IS NOT NULL))
);
CREATE UNIQUE INDEX IF NOT EXISTS appointments_active_slot ON appointments(starts_at) WHERE status = 'confirmed';
CREATE INDEX IF NOT EXISTS appointments_day ON appointments(starts_at, status);

CREATE TABLE IF NOT EXISTS appointment_notifications (
  id uuid PRIMARY KEY,
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  recipient_kind varchar(12) NOT NULL CHECK (recipient_kind IN ('office','customer')),
  status varchar(12) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','sent','failed','skipped')),
  attempts integer NOT NULL DEFAULT 0,
  available_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lease_until timestamptz,
  lease_token uuid,
  last_error varchar(32),
  sent_at timestamptz,
  UNIQUE(appointment_id,recipient_kind)
);
CREATE INDEX IF NOT EXISTS appointment_notifications_due ON appointment_notifications(status, available_at);
CREATE TABLE IF NOT EXISTS appointment_rate_limits (
  key char(64) PRIMARY KEY,
  count integer NOT NULL DEFAULT 1,
  expires_at timestamptz NOT NULL
);
