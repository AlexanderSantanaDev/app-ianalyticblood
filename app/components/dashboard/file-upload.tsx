// "use client";

// import { useState } from "react";
// import { FileUploadProps } from "@/types/dashboard";
// import { Button } from "@/components/ui/button";
// import { Upload } from "lucide-react";
// import { useApiFetch } from "@/lib/api/client";
// import { uploadFile } from "@/lib/api/analysis";
// import { useLoading } from "hooks/loading-context";

// export const FileUpload = ({ onUpload }: FileUploadProps) => {
//   const [isDragging, setIsDragging] = useState(false);
//   const [file, setFile] = useState<File | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
//   const apiFetch = useApiFetch();
//   const { setIsLoading } = useLoading(); // 👈 Usamos el contexto para controlar isLoading

//   const handleChange = (f: File) => {
//     setFile(f);
//     if (f.type.startsWith("image/")) {
//       const reader = new FileReader();
//       reader.onloadend = () => setPreviewUrl(reader.result as string);
//       reader.readAsDataURL(f);
//     }
//   };

//   const handleProcess = async () => {
//     if (!file) return;
//     setIsLoading(true); // 👈 Usamos setIsLoading en lugar de setIsSending
//     try {
//       await uploadFile(file, apiFetch);
//       onUpload(file);
//     } catch (err: any) {
//       alert(err.message);
//     } finally {
//       setIsLoading(false); // 👈 Usamos setIsLoading en lugar de setIsSending
//       setFile(null);
//       setPreviewUrl(null);
//     }
//   };

//   const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };

//   const handleDragLeave = () => setIsDragging(false);

//   const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
//     e.preventDefault();
//     setIsDragging(false);
//     const files = e.dataTransfer.files;
//     if (files && files.length > 0) {
//       const droppedFile = files[0];
//       const isPdf = droppedFile.type === "application/pdf";
//       const isImage = droppedFile.type.startsWith("image/");
//       if (isPdf || isImage) {
//         handleChange(droppedFile);
//       } else {
//         console.warn("Formato de archivo no válido. Sube un PDF o una imagen.");
//       }
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     e.preventDefault();
//     const { files } = e.target;
//     if (files && files.length > 0) {
//       const selectedFile = files[0];
//       const isPdf = selectedFile.type === "application/pdf";
//       const isImage = selectedFile.type.startsWith("image/");
//       if (isPdf || isImage) {
//         handleChange(selectedFile);
//       } else {
//         console.warn("Formato de archivo no válido. Sube un PDF o una imagen.");
//       }
//     }
//   };

//   return (
//     <div
//       className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
//         isDragging ? "border-primary bg-primary/5" : "border-border"
//       }`} // 👈 Eliminamos el estilo condicional para el loader
//       onDragOver={handleDragOver}
//       onDragLeave={handleDragLeave}
//       onDrop={handleDrop}
//     >
//       {/* 👈 Eliminamos la condición para mostrar el Loader aquí */}
//       <div className="mx-auto w-16 h-16 mb-4 text-muted-foreground">
//         <Upload className="w-full h-full" />
//       </div>
//       <h3 className="text-lg font-medium mb-2">
//         {file ? file.name : "Arrastra y suelta tu PDF o imagen aquí"}
//       </h3>
//       <p className="text-muted-foreground mb-4">
//         {file
//           ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
//           : "o haz clic para seleccionar un archivo"}
//       </p>
//       <input
//         type="file"
//         id="file-upload"
//         className="hidden"
//         accept=".pdf,image/*"
//         onChange={handleFileChange}
//       />
//       <label htmlFor="file-upload">
//         <Button
//           variant={file ? "outline" : "default"}
//           onClick={(e) => {
//             e.preventDefault();
//             document.getElementById("file-upload")?.click();
//           }}
//           className={file ? "" : "gradient-bg"}
//         >
//           {file ? "Cambiar archivo" : "Seleccionar archivo"}
//         </Button>
//       </label>
//       {previewUrl && (
//         <div className="mt-4">
//           <img
//             src={previewUrl}
//             alt="Vista previa"
//             className="w-32 h-32 object-cover rounded-lg mx-auto"
//           />
//         </div>
//       )}
//       {file && (
//         <Button className="ml-2 gradient-bg" onClick={handleProcess}>
//           Procesar archivo{" "}
//           {/* 👈 Eliminamos el texto "Subiendo…" porque el overlay ya indica que está cargando */}
//         </Button>
//       )}
//     </div>
//   );
// };

"use client";

import { useState } from "react";
import { FileUploadProps } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useApiFetch } from "@/lib/api/client";
import { uploadFile } from "@/lib/api/analysis";
import { useLoading } from "hooks/loading-context";
import { Loader } from "@/components/ui/loader";

export const FileUpload = ({ onUpload }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const apiFetch = useApiFetch();
  const { isLoading, setIsLoading } = useLoading();

  const handleChange = (f: File) => {
    setFile(f);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(f);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsLoading(true);
    try {
      await uploadFile(file, apiFetch);
      onUpload(file);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
      setFile(null);
      setPreviewUrl(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const droppedFile = files[0];
      const isPdf = droppedFile.type === "application/pdf";
      const isImage = droppedFile.type.startsWith("image/");
      if (isPdf || isImage) {
        handleChange(droppedFile);
      } else {
        console.warn("Formato de archivo no válido. Sube un PDF o una imagen.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const { files } = e.target;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      const isPdf = selectedFile.type === "application/pdf";
      const isImage = selectedFile.type.startsWith("image/");
      if (isPdf || isImage) {
        handleChange(selectedFile);
      } else {
        console.warn("Formato de archivo no válido. Sube un PDF o una imagen.");
      }
    }
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
        isDragging ? "border-primary bg-primary/5" : "border-border"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl z-10">
          <div className="flex flex-col gap-4 items-center">
            <Loader />
            <p className="text-white text-lg font-medium">Analizando...</p>
          </div>
        </div>
      )}
      <div className="mx-auto w-16 h-16 mb-4 text-muted-foreground">
        <Upload className="w-full h-full" />
      </div>
      <h3 className="text-lg font-medium mb-2">
        {file ? file.name : "Arrastra y suelta tu PDF o imagen aquí"}
      </h3>
      <p className="text-muted-foreground mb-4">
        {file
          ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
          : "o haz clic para seleccionar un archivo"}
      </p>
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept=".pdf,image/*"
        onChange={handleFileChange}
      />
      <label htmlFor="file-upload">
        <Button
          variant={file ? "outline" : "default"}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("file-upload")?.click();
          }}
          className={file ? "" : "gradient-bg"}
          disabled={isLoading}
        >
          {file ? "Cambiar archivo" : "Seleccionar archivo"}
        </Button>
      </label>
      {previewUrl && (
        <div className="mt-4">
          <img
            src={previewUrl}
            alt="Vista previa"
            className="w-32 h-32 object-cover rounded-lg mx-auto"
          />
        </div>
      )}
      {file && (
        <Button className="ml-2 gradient-bg" onClick={handleProcess} disabled={isLoading}>
          Procesar archivo
        </Button>
      )}
    </div>
  );
};
