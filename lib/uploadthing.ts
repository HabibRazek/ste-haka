import { createUploadthing, type FileRouter } from "uploadthing/server";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define a product image uploader
  productImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  }).onUploadComplete(async ({ file }) => {
    console.log("Upload complete:", file.url);
    return { url: file.url };
  }),

  // Document uploader for comptabilité (PDF, images, etc.)
  documentUploader: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
    image: { maxFileSize: "8MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    console.log("Document upload complete:", file.url);
    return { url: file.url };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

