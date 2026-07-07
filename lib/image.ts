/**
 * 이미지(dataURL 또는 File/Blob)를 최대 변 길이 `max`로 축소한 PNG Blob으로 변환.
 * 브라우저 전용 (canvas 사용). 저장 용량과 해상도를 낮추기 위해 사용.
 */
export async function downscaleToBlob(
  src: string | Blob,
  max = 512,
): Promise<Blob> {
  const url = typeof src === "string" ? src : URL.createObjectURL(src);
  try {
    const img = await loadImage(url);
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas 생성 실패");
    ctx.drawImage(img, 0, 0, w, h);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("이미지 변환 실패"))),
        "image/png",
      ),
    );
  } finally {
    if (typeof src !== "string") URL.revokeObjectURL(url);
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("이미지 로드 실패"));
    img.src = url;
  });
}
