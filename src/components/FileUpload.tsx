"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Image,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { FileType, ProcessingStage } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  stage: ProcessingStage;
  progress: number;
  error?: string;
  onCancel: () => void;
}

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "text/plain": [".txt"],
  "application/vnd.ms-powerpoint": [".ppt"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
};

const MAX_FILE_SIZE = 20 * 1024 * 1024;

function getFileType(mimeType: string): FileType {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.includes("wordprocessingml")) return "docx";
  if (mimeType === "text/plain") return "txt";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "ppt";
  if (mimeType.startsWith("image/")) return "image";
  return "txt";
}

function getFileIcon(fileType: FileType) {
  switch (fileType) {
    case "pdf":
    case "docx":
    case "txt":
      return FileText;
    case "image":
      return Image;
    default:
      return File;
  }
}

const STAGE_MESSAGES: Record<ProcessingStage, string> = {
  uploading: "Uploading file...",
  extracting: "Extracting text content...",
  understanding: "Understanding content structure...",
  sectioning: "Breaking into learning sections...",
  fetching: "Finding best resources for each section...",
  complete: "Processing complete!",
  error: "An error occurred",
};

export function FileUpload({
  onFileSelect,
  isProcessing,
  stage,
  progress,
  error,
  onCancel,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragError, setDragError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: { errors: { message: string }[] }[]) => {
      setDragError(null);

      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0];
        setDragError(error.message);
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (file.size > MAX_FILE_SIZE) {
          setDragError("File size exceeds 20MB limit");
          return;
        }
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    disabled: isProcessing,
  });

  const handleCancel = () => {
    setSelectedFile(null);
    setDragError(null);
    onCancel();
  };

  const fileType = selectedFile ? getFileType(selectedFile.type) : null;
  const FileIcon = fileType ? getFileIcon(fileType) : File;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!isProcessing && !selectedFile ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div
              {...getRootProps()}
              className={cn(
                "relative rounded-2xl transition-all duration-300 cursor-pointer group",
                isDragActive && !isDragReject && "scale-[1.02]",
                isDragReject && "border-red-500"
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 rounded-2xl blur-xl opacity-0 transition-opacity duration-300",
                  isDragActive && "opacity-50",
                  isDragReject
                    ? "bg-red-500/30"
                    : "bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-cyan-500/30"
                )}
              />

              <div
                className={cn(
                  "relative glass rounded-2xl border-2 border-dashed transition-all duration-300",
                  isDragActive && !isDragReject
                    ? "border-indigo-400 bg-indigo-500/10"
                    : isDragReject
                    ? "border-red-400 bg-red-500/10"
                    : "border-white/20 hover:border-indigo-400/50 hover:bg-white/5"
                )}
              >
                <input {...getInputProps()} />

                <div className="p-12 text-center">
                  <motion.div
                    className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 mb-6"
                    animate={isDragActive ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                  >
                    <Upload
                      className={cn(
                        "w-10 h-10 transition-colors",
                        isDragActive ? "text-indigo-300" : "text-indigo-400"
                      )}
                    />
                  </motion.div>

                  <h3 className="text-xl font-semibold text-white mb-2">
                    {isDragActive
                      ? isDragReject
                        ? "Invalid file type"
                        : "Drop your file here"
                      : "Upload learning material"}
                  </h3>

                  <p className="text-gray-400 mb-4">
                    Drag & drop or click to select a file
                  </p>

                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {["PDF", "DOCX", "TXT", "PPT", "PNG", "JPG"].map((type) => (
                      <span
                        key={type}
                        className="px-3 py-1 text-xs font-medium text-gray-400 bg-white/5 rounded-full"
                      >
                        {type}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-gray-500">Maximum file size: 20MB</p>
                </div>
              </div>
            </div>

            {dragError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 glass rounded-xl flex items-center gap-3 text-red-400"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{dragError}</span>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass rounded-2xl p-8"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                <FileIcon className="w-8 h-8 text-indigo-400" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-semibold text-white truncate">
                  {selectedFile?.name}
                </h4>
                <p className="text-sm text-gray-400">
                  {selectedFile && (selectedFile.size / 1024 / 1024).toFixed(2)} MB •{" "}
                  {fileType?.toUpperCase()}
                </p>
              </div>

              {!isProcessing && (
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {stage === "error" ? (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  ) : stage === "complete" ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                  )}
                  <span
                    className={cn(
                      "text-sm font-medium",
                      stage === "error"
                        ? "text-red-400"
                        : stage === "complete"
                        ? "text-green-400"
                        : "text-white"
                    )}
                  >
                    {STAGE_MESSAGES[stage]}
                  </span>
                </div>
                <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
              </div>

              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full",
                    stage === "error"
                      ? "bg-red-500"
                      : stage === "complete"
                      ? "bg-green-500"
                      : "bg-gradient-to-r from-indigo-500 to-purple-500"
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                  <p className="text-sm text-red-400">{error}</p>
                  <button
                    onClick={handleCancel}
                    className="mt-2 text-sm text-red-300 hover:text-red-200 underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              <ProcessingSteps currentStage={stage} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProcessingSteps({ currentStage }: { currentStage: ProcessingStage }) {
  const steps: { stage: ProcessingStage; label: string }[] = [
    { stage: "uploading", label: "Upload" },
    { stage: "extracting", label: "Extract" },
    { stage: "understanding", label: "Analyze" },
    { stage: "sectioning", label: "Section" },
    { stage: "fetching", label: "Resources" },
  ];

  const stageOrder: ProcessingStage[] = [
    "uploading",
    "extracting",
    "understanding",
    "sectioning",
    "fetching",
    "complete",
  ];

  const currentIndex = stageOrder.indexOf(currentStage);

  return (
    <div className="flex items-center justify-between mt-6 px-2">
      {steps.map((step, index) => {
        const stepIndex = stageOrder.indexOf(step.stage);
        const isComplete = currentIndex > stepIndex;
        const isCurrent = currentStage === step.stage;

        return (
          <div key={step.stage} className="flex flex-col items-center gap-2">
            <motion.div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                isComplete
                  ? "bg-green-500/20 text-green-400"
                  : isCurrent
                  ? "bg-indigo-500/30 text-indigo-300"
                  : "bg-white/5 text-gray-500"
              )}
              animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: isCurrent ? Infinity : 0 }}
            >
              {isComplete ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <span>{index + 1}</span>
              )}
            </motion.div>
            <span
              className={cn(
                "text-xs",
                isComplete
                  ? "text-green-400"
                  : isCurrent
                  ? "text-indigo-300"
                  : "text-gray-500"
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
