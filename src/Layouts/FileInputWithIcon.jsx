import { UploadIcon, XIcon, FileIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Input } from "@/Components/ui/input";

const MAX_FILE_SIZE_MB = 4; // Passport photos usually ≤ 4MB
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MIN_DIMENSION = 400;  // Minimum 400x400 px
const MAX_DIMENSION = 2000; // Maximum 2000x2000 px

const FileInputWithPreview = ({ name, value, onChange }) => {
  const fileInputRef = useRef(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);

  const openPicker = () => fileInputRef.current?.click();

  const isImage = (file) => IMAGE_TYPES.includes(file?.type);

  // ✅ Async validation for dimensions & aspect ratio
  const validateImageDimensions = (file) => {
    return new Promise((resolve) => {
      if (!isImage(file)) {
        resolve('Only image files (JPEG, PNG, WebP) are allowed');
        return;
      }

      const img = new Image();
      img.onload = () => {
        const { width, height } = img;

        // Check aspect ratio (must be square: 1:1 ± tolerance)
        const aspectRatio = width / height;
        if (Math.abs(aspectRatio - 1) > 0.1) {
          resolve('Image must be square (1:1 aspect ratio)');
          return;
        }

        // Check minimum size
        if (width < MIN_DIMENSION || height < MIN_DIMENSION) {
          resolve(`Image must be at least ${MIN_DIMENSION}x${MIN_DIMENSION} pixels`);
          return;
        }

        // Check maximum size
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          resolve(`Image must not exceed ${MAX_DIMENSION}x${MAX_DIMENSION} pixels`);
          return;
        }

        resolve(null);
      };

      img.onerror = () => {
        resolve('Invalid or corrupted image file');
      };

      // Load image from file
      img.src = URL.createObjectURL(file);
    });
  };

  const validateFile = async (file) => {
    // File size check
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File must be smaller than ${MAX_FILE_SIZE_MB}MB`;
    }

    // Image-specific checks
    if (isImage(file)) {
      const dimensionError = await validateImageDimensions(file);
      if (dimensionError) return dimensionError;
    }

    return null;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = await validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Clear previous state
    setError("");
    setFileInfo({ name: file.name, type: file.type });

    // Set preview for images
    if (isImage(file)) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    } else {
      setPreview(null);
    }

    // Notify parent
    onChange?.({ target: { name, value: file } });
  };

  const clearFile = () => {
    setPreview(null);
    setError("");
    setFileInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onChange?.({ target: { name, value: null } });
  };

  return (
    <div className="w-full max-w-sm space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept={IMAGE_TYPES.join(",")} // Enforce in input too
      />

      <div onClick={openPicker} className="relative cursor-pointer">
        <Input
          readOnly
          value={fileInfo ? `${fileInfo.name} (${fileInfo.type})` : ""}
          placeholder="Select passport photo"
          className="pr-10 cursor-pointer"
        />
        <UploadIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      </div>

      {/* Image Preview (square) */}
      {preview && (
        <div className="relative w-20 h-20 border rounded-lg overflow-hidden">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={clearFile}
            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
          >
            <XIcon size={14} />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Help Text */}
      {!error && (
        <p className="text-xs text-muted-foreground">
          Passport photo: square (1:1), {MIN_DIMENSION}×{MIN_DIMENSION}–{MAX_DIMENSION} px, ≤{MAX_FILE_SIZE_MB}MB
        </p>
      )}
    </div>
  );
};

export default FileInputWithPreview;