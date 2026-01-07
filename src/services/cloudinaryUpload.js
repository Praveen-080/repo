// Client-side Cloudinary unsigned upload helper
// Requires VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UNSIGNED_PRESET

export async function uploadImageToCloudinary(file) {
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset = import.meta.env.VITE_CLOUDINARY_UNSIGNED_PRESET;
  if (!cloud || !preset) throw new Error('Cloudinary env vars missing');
  const url = `https://api.cloudinary.com/v1_1/${cloud}/upload`;
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', preset);
  const res = await fetch(url, { method: 'POST', body: fd });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Cloudinary upload failed: ${res.status}`);
  }
  const data = await res.json();
  return { secure_url: data.secure_url, public_id: data.public_id };
}

export default { uploadImageToCloudinary };
