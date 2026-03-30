'use client';

import { useState } from 'react';

export function AvatarUpload({ name = 'profileImageDataUrl' }: { name?: string }) {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <div className="stack">
      <label className="muted">Profile picture</label>
      {preview ? <img src={preview} alt="Preview" className="avatar" /> : null}
      <input
        type="file"
        accept="image/*"
        className="input"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => setPreview(String(reader.result));
          reader.readAsDataURL(file);
        }}
      />
      <input type="hidden" name={name} value={preview ?? ''} />
      <p className="muted">Stored in PostgreSQL so it survives Railway redeploys.</p>
    </div>
  );
}
