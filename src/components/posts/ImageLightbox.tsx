import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImageLightboxProps {
  images: Array<{
    image_id: string;
    image_url: string;
    caption?: string;
  }>;
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function ImageLightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrev,
}: ImageLightboxProps) {
  if (!images || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 bg-black/90">
        <div className="relative">
          <img
            src={currentImage?.image_url}
            alt={currentImage?.caption || `Ảnh ${currentIndex + 1}`}
            className="w-full h-auto max-h-[80vh] object-contain"
          />

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={onPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                disabled={currentIndex === 0}
              >
                ‹
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                disabled={currentIndex === images.length - 1}
              >
                ›
              </Button>
            </>
          )}

          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70"
          >
            ✕
          </Button>

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* Caption */}
          {currentImage?.caption && (
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white p-3 rounded">
              <p className="text-sm">{currentImage.caption}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
