import React from "react";
import { CordovaCameraImage } from "../../types/Photo";

type Props = {
  handlePhotoSelect: (
    file: File | CordovaCameraImage,
    fromCamera: boolean
  ) => void;
};

export const DesktopPhotoFallback = React.forwardRef<HTMLInputElement, Props>(
  ({ handlePhotoSelect }: Props, ref) => {
    return (
      <input
        className="hidden"
        type="file"
        accept="image/*"
        id={"fileInput"}
        ref={ref}
        onChange={(e) => {
          const file = e.target && e.target.files && e.target.files[0];
          if (file) {
            // there's probably a more direct way to figure out if the image
            // that we loaded is from the camera, but for now just check that
            // the lastModified date is < 30s ago
            const fileDate = file.lastModified;
            const ageInMinutes = (new Date().getTime() - fileDate) / 1000 / 60;
            const imgFromCamera = isNaN(ageInMinutes) || ageInMinutes < 0.5;
            handlePhotoSelect(file, imgFromCamera);
          }
        }}
      />
    );
  }
);
