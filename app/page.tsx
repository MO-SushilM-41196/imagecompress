import ImageCompressor from '@/components/ImageCompressor';

export default function Home() {
  return (
    <main className="min-h-screen">
      <ImageCompressor />
      
      {/* Footer */}
      <footer className="py-12 border-t border-zinc-100">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-zinc-400 text-sm">
            &copy; {new Date().getFullYear()} ImageCompress. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
