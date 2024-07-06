"use client";

import { useFileContext } from "@/context/FileContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FaArrowRight } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { CiCirclePlus } from "react-icons/ci";
import { IoArrowBack } from "react-icons/io5";
import ImagePreview from "@/components/upload/ImagePreview";
import { HiLockClosed, HiLockOpen } from "react-icons/hi2";
import axios from "axios";
import Modal from "@/components/forms/Modal";
import SecurePdfForm from "@/components/forms/SecurePdfForm";
import { securePdfFormSchema } from "@/schema";
import { z } from "zod";

const ConvertToPdf = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isConvertingWithoutPassword, setIsConvertingWithoutPassword] =
    useState<boolean>(false);
  const [isConvertingWithPassword, setIsConvertingWithPassword] =
    useState<boolean>(false);
  const [showPasswordForm, setShowPasswordForm] = useState<boolean>(false);
  const firstPdfFileName = useRef<string>("");
  const router = useRouter();
  const { files, setFiles } = useFileContext();

  useEffect(() => {
    if (files.length === 0) {
      router.push("/");
    }
  }, [router, files]);

  const handleAddImageClick = () => {
    console.log("add image clicked");
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const fileArray = [...files, ...Array.from(selectedFiles)];
      setFiles(fileArray);
      setPdfUrl(null);
    }
  };

  const handleConvertToPdfWithPassword = () => {
    setShowPasswordForm(true);
  };

  const handleConvertToPdf = async (
    isSecured: boolean,
    values?: z.infer<typeof securePdfFormSchema>
  ) => {
    if (isSecured) {
      setIsConvertingWithPassword(true);
      setShowPasswordForm(false);
    } else {
      setIsConvertingWithoutPassword(true);
    }

    const formData = new FormData();
    files.forEach((file, index) => {
      if (index === 0) {
        firstPdfFileName.current = file.name.split(".")[0];
      }
      formData.append("images", file);
    });

    if (values?.password) {
      formData.append("password", values.password);
    }

    const apiString = `/api/convert-to-pdf${isSecured ? "-secured" : ""}`;

    const response = await axios.post(apiString, formData, {
      responseType: "blob",
    });

    console.log("after getting response");

    const blob = response.data;
    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
    setIsConvertingWithoutPassword(false);
    setIsConvertingWithPassword(false);
  };

  return (
    <div className="mt-4">
      <div
        className="bg-gray-300 hover:bg-gray-500 rounded-full p-3 w-12 cursor-pointer ml-6"
        onClick={() => router.push("/")}
      >
        <IoArrowBack size={24} color="black" />
      </div>
      <div className="flex flex-wrap gap-x-4 justify-center items-end mt-4">
        {files.map((file, index) => (
          <ImagePreview key={file.name + index} file={file} />
        ))}
        {/* plus icon adding new file */}
        <div
          className="flex justify-center flex-col items-center border border-gray-400 rounded-full px-8 py-10 mx-4 bg-gray-300 cursor-pointer"
          onClick={handleAddImageClick}
        >
          <CiCirclePlus size={24} color="black" />
          <div className="text-xs">Add Images</div>
        </div>
        {/* input field for selecting images */}
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
          multiple
        />
      </div>
      <div className="flex flex-col gap-4 justify-center items-center">
        {!pdfUrl && (
          <div className="flex justify-center items-center my-4">
            <Button
              className="px-4 py-2 mx-5 text-white bg-red-500 rounded hover:bg-red-600"
              onClick={() => handleConvertToPdf(false)}
              disabled={isConvertingWithoutPassword}
            >
              <span className="mx-2">
                <HiLockOpen size={20} color="white" />
              </span>
              {isConvertingWithoutPassword
                ? "Converting... "
                : "Convert without password "}
              <span className="mx-2">
                <FaArrowRight size={20} color="white" />
              </span>
            </Button>
            <Button
              className="px-4 py-2 mx-5 text-white bg-green-500 rounded hover:bg-green-600"
              onClick={handleConvertToPdfWithPassword}
              disabled={isConvertingWithPassword}
            >
              <span className="mx-2">
                <HiLockClosed size={20} color="white" />
              </span>
              {isConvertingWithPassword
                ? "Converting... "
                : "Convert with password "}
              <span className="mx-2">
                <FaArrowRight size={20} color="white" />
              </span>
            </Button>
            <Modal
              isOpen={showPasswordForm}
              onClose={() => setShowPasswordForm(false)}
            >
              <SecurePdfForm
                onClose={() => setShowPasswordForm(false)}
                handleConvertToPdf={handleConvertToPdf}
              />
            </Modal>
          </div>
        )}
        {pdfUrl && (
          <a
            href={pdfUrl}
            download={`${firstPdfFileName.current}_merged.pdf`}
            className="block px-4 py-2 my-4 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Download PDF
          </a>
        )}
      </div>
    </div>
  );
};

export default ConvertToPdf;
