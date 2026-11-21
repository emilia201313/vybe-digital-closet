import asyncio
import io
import logging
import os
from functools import lru_cache
from threading import Lock

import torch
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from PIL import Image, UnidentifiedImageError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vybe-gpu-api")

WEIGHTS_DIR = os.getenv("FASHN_WEIGHTS_DIR", "./weights")
MAX_UPLOAD_BYTES = 10 * 1024 * 1024
MAX_IMAGE_PIXELS = 20_000_000
ALLOWED_CATEGORIES = {"tops", "bottoms", "one-pieces"}
inference_lock = Lock()

app = FastAPI(title="VYBE local virtual try-on", version="1.0.0")
allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "VYBE_ALLOWED_ORIGINS",
        "http://localhost:5500,http://127.0.0.1:5500",
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@lru_cache(maxsize=1)
def get_pipeline():
    from fashn_vton import TryOnPipeline

    return TryOnPipeline(weights_dir=WEIGHTS_DIR)


@app.on_event("startup")
def load_model():
    if not torch.cuda.is_available():
        raise RuntimeError(
            "Não foi detetada uma GPU NVIDIA/CUDA. Este serviço precisa de uma GPU compatível."
        )
    logger.info("A carregar o modelo FASHN VTON a partir de %s", WEIGHTS_DIR)
    get_pipeline()
    logger.info("Modelo pronto. GPU: %s", torch.cuda.get_device_name(0))


async def read_image(upload: UploadFile) -> Image.Image:
    raw = await upload.read(MAX_UPLOAD_BYTES + 1)
    if len(raw) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Cada imagem tem de ter menos de 10 MB.")
    try:
        image = Image.open(io.BytesIO(raw))
        if image.width * image.height > MAX_IMAGE_PIXELS:
            raise HTTPException(status_code=413, detail="A imagem tem uma resolução demasiado elevada.")
        image.load()
        return image.convert("RGB")
    except (UnidentifiedImageError, OSError):
        raise HTTPException(status_code=400, detail="Não foi possível ler uma das imagens.") from None


@app.get("/health")
def health():
    return {"status": "ok", "gpu": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None}


@app.post("/tryon")
async def try_on(
    person_image: UploadFile = File(...),
    garment_image: UploadFile = File(...),
    category: str = Form(...),
):
    if category not in ALLOWED_CATEGORIES:
        raise HTTPException(status_code=400, detail="Categoria inválida.")

    person, garment = await asyncio.gather(read_image(person_image), read_image(garment_image))

    def generate():
        with inference_lock:
            result = get_pipeline()(
                person_image=person,
                garment_image=garment,
                category=category,
            )
        output = io.BytesIO()
        result.images[0].save(output, format="PNG")
        return output.getvalue()

    try:
        image_bytes = await asyncio.to_thread(generate)
    except Exception:
        logger.exception("Falha na geração da prova virtual")
        raise HTTPException(status_code=500, detail="A geração falhou. Consulta o terminal do servidor para mais informação.") from None

    return Response(
        content=image_bytes,
        media_type="image/png",
        headers={"Cache-Control": "no-store"},
    )
