CREATE TABLE IF NOT EXISTS pet_center.password_reset_tokens (
    reset_token_id VARCHAR(30) PRIMARY KEY,
    user_id VARCHAR(30) NOT NULL
        REFERENCES pet_center.users(user_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    token_hash CHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_password_reset_expiry CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS idx_password_reset_user_created
    ON pet_center.password_reset_tokens(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_password_reset_expiry
    ON pet_center.password_reset_tokens(expires_at)
    WHERE used_at IS NULL;
