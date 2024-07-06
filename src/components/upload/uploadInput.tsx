"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaFileUpload } from "react-icons/fa";
// import ConvertToPdf from "./convertToPdf";
import { useFileContext } from "@/context/FileContext";
import { useRouter } from "next/navigation";

const UploadInput = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setFiles } = useFileContext();
  const router = useRouter();
  
  const handleButtonClick = () => {
    setFiles([]);
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const fileArray = Array.from(selectedFiles);
      setFiles(fileArray);
      router.push("/images-to-pdf");
    }
  };
  return (
    <div className="flex flex-col items-center justify-center my-5">
      <Button
        className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        onClick={handleButtonClick}
      >
        <span className="mx-2">
          <FaFileUpload color="white" size={20} />
        </span>
        Upload Images
      </Button>
      <Input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        multiple
      />
    </div>
  );
};

export default UploadInput;
