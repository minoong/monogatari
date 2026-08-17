const ACCEPTED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const ACCEPTED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "heic", "heif"]);

export const ACCEPT_IMAGE_INPUT =
  "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif";

export const MAX_IMAGE_FILE_SIZE_MB = 20;
export const MAX_IMAGE_FILE_SIZE = MAX_IMAGE_FILE_SIZE_MB * 1024 * 1024;

export const createLocalImageId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `img-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

export const getImageFileExtension = (file: File) => file.name.split(".").pop()?.toLowerCase() ?? "";

export const isAcceptedImageFile = (file: File) => {
  if (file.size <= 0 || file.size > MAX_IMAGE_FILE_SIZE) return false;
  if (ACCEPTED_MIME_TYPES.has(file.type)) return true;
  return ACCEPTED_EXTENSIONS.has(getImageFileExtension(file));
};

export const rejectImageFileReason = (file: File) => {
  if (file.size <= 0) return "비어 있는 사진은 올릴 수 없어요.";
  if (file.size > MAX_IMAGE_FILE_SIZE) return `사진은 장당 ${MAX_IMAGE_FILE_SIZE_MB}MB 이하여야 해요.`;
  if (!isAcceptedImageFile(file)) return "JPG, PNG, WEBP, HEIC 사진만 올릴 수 있어요.";
  return null;
};

export const normalizeImageMimeType = (file: File) => {
  if (file.type && file.type !== "application/octet-stream") return file.type;
  const extension = getImageFileExtension(file);
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  if (extension === "heic") return "image/heic";
  if (extension === "heif") return "image/heif";
  return "image/jpeg";
};
