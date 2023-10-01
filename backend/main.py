from auth_token import auth_token
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import torch
from torch import autocast
from diffusers import StableDiffusionPipeline
from io import BytesIO
import zipfile

app = FastAPI()

app.add_middleware(
    CORSMiddleware, 
    allow_credentials=True, 
    allow_origins=["*"], 
    allow_methods=["*"], 
    allow_headers=["*"]
)

if torch.backends.mps.is_available():
    device = "mps"
elif torch.cuda.is_available():
    device = "cuda"
else:
    device = "cpu"

model_id = "stabilityai/stable-diffusion-2-1"

if(device != "mps"):
    pipe = StableDiffusionPipeline.from_pretrained(model_id, revision="fp16", torch_dtype=torch.float16, use_auth_token=auth_token)
else:
    pipe = StableDiffusionPipeline.from_pretrained(model_id, use_auth_token=auth_token)

pipe.to(device)

if torch.backends.mps.is_available():
    pipe.enable_attention_slicing()

@app.get("/")
def generate(prompt: str, negPrompt: str, numPrompt:int=1): 
    #different guidance scale depending on the "complexity" of the prompt
    scale = 9 if len(prompt.split(" ")) < 10 else 15

    print(prompt)
    print(negPrompt)
    if (device != "mps"):
        with autocast(): 
            images = pipe(prompt, guidance_scale=scale, negative_prompt=negPrompt, num_images_per_prompt=numPrompt).images
    else:
        images = pipe(prompt, guidance_scale=scale, negative_prompt=negPrompt, num_images_per_prompt=numPrompt).images

    print(images)

    # Create a BytesIO stream to hold the zip file
    zip_buffer = BytesIO()

    # Create a zip file and add the images to it
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for i, img in enumerate(images):
            img_bytes = BytesIO()
            img.save(img_bytes, format="PNG")
            img_bytes.seek(0)
            zipf.writestr(f"image_{i + 1}.png", img_bytes.read())

    # Return the zip file as a streaming response
    zip_buffer.seek(0)
    return StreamingResponse(iter([zip_buffer.getvalue()]), media_type="application/zip")
