type fileUploadThumbnail = {
  file: File;
  maxWidth: number;
  maxHeight: number;
  onError?: (e: any) => void;
  onSuccess: (v: string) => void;
};

type FileUploadThumbnail = {
  new (props: fileUploadThumbnail): {
    createThumbnail: () => void;
  };
};

declare module 'file-upload-thumbnail' {
  const a: FileUploadThumbnail;
  export default a;
}
