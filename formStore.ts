interface FormData {
  operator: string;
  waktu: string;
  bukti: string;
  lokasi: string;
  catatan: string;
}

// Keyed by userId, auto-clears after 5 minutes
const store = new Map<string, FormData>();

export function saveForm(userId: string, data: FormData) {
  store.set(userId, data);
  setTimeout(() => store.delete(userId), 5 * 60 * 1000);
}

export function getForm(userId: string): FormData | undefined {
  return store.get(userId);
}

export function deleteForm(userId: string) {
  store.delete(userId);
}