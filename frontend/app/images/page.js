import { list } from '@vercel/blob';
import Image from 'next/image';
 
export default async function Page() {
  async function allImages() {
    const blobs = await list();
    return blobs;
  }
  const images = await allImages();
 
  return (
    <section>
      {/* instead of the actual iimage i wanted to display there name and when click it will redirect to the link of the image */}
      <div>Images</div>
      {images.blobs.map((image) => (
        <Image
          priority
          key={image.pathname}
          src={image.url}
          alt="Image"
          width={200}
          height={200}
        />
      ))}
    </section>
  );
}