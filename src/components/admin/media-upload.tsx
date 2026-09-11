"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, CheckCircle, AlertCircle, CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_SIZE = 10 * 1024 * 1024;

interface UploadFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function validateFile(file: File): string | null {
  if (!(ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
    return `Invalid file type "${file.type}". Accepted: JPEG, PNG, WebP.`;
  }
  if (file.size > MAX_SIZE) {
    return `File too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Max: 10 MB.`;
  }
  return null;
}

interface MediaUploadProps {
  onComplete: () => void;
}

export function MediaUpload({ onComplete }: MediaUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const items: UploadFile[] = [];
    for (const file of Array.from(newFiles)) {
      const validationError = validateFile(file);
      items.push({
        id: generateId(),
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: validationError ? "error" : "pending",
        error: validationError ?? undefined,
      });
    }
    setFiles((prev) => [...prev, ...items]);
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = "";
    }
  }

  function removeFile(id: string) {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  }

  async function uploadFile(uploadFile: UploadFile): Promise<void> {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === uploadFile.id ? { ...f, status: "uploading" as const, progress: 0 } : f,
      ),
    );

    try {
      const formData = new FormData();
      formData.append("file", uploadFile.file);

      const xhr = new XMLHttpRequest();

      const result = await new Promise<typeof uploadFile.status>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setFiles((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id ? { ...f, progress: pct } : f,
              ),
            );
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve("success" as const);
          } else {
            try {
              const body = JSON.parse(xhr.responseText);
              reject(new Error(body.error ?? "Upload failed."));
            } catch {
              reject(new Error("Upload failed."));
            }
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Network error.")));

        xhr.open("POST", "/api/admin/media/upload");
        xhr.send(formData);
      });

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: result, progress: 100 }
            : f,
        ),
      );
    } catch (err) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: "error" as const, error: err instanceof Error ? err.message : "Upload failed." }
            : f,
        ),
      );
    }
  }

  async function uploadAll() {
    const pending = files.filter((f) => f.status === "pending");
    await Promise.all(pending.map((f) => uploadFile(f)));
    const allDone = files
      .filter((f) => f.status === "pending")
      .every((f) => f.status !== "pending");
    if (allDone) onComplete();
  }

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const uploadingCount = files.filter((f) => f.status === "uploading").length;
  const isUploading = uploadingCount > 0;

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          dragging
            ? "border-accent bg-accent/5"
            : "border-border hover:border-accent/50"
        }`}
      >
        <CloudUpload className="mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          Drop files here or click to browse
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          JPEG, PNG, WebP — Max 10 MB each
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleFileInput}
        className="hidden"
      />

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 rounded-md border border-border bg-background p-3"
            >
              <img
                src={f.preview}
                alt={f.file.name}
                className="h-10 w-10 shrink-0 rounded object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {f.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(f.file.size / (1024 * 1024)).toFixed(1)} MB
                </p>
                {f.status === "uploading" && (
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                )}
                {f.status === "success" && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <CheckCircle className="h-3 w-3" /> Uploaded
                  </p>
                )}
                {f.status === "error" && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                    <AlertCircle className="h-3 w-3" /> {f.error}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeFile(f.id)}
                disabled={f.status === "uploading"}
                className="shrink-0 rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {pendingCount} pending, {uploadingCount} uploading
          </p>
          <Button
            variant="primary"
            size="sm"
            disabled={pendingCount === 0 || isUploading}
            onClick={uploadAll}
          >
            <Upload className="mr-1.5 h-4 w-4" />
            {isUploading ? "Uploading..." : `Upload ${pendingCount} file(s)`}
          </Button>
        </div>
      )}
    </div>
  );
}
