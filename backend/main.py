from auth_token import auth_token
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
import torch
from torch import autocast
from diffusers import StableDiffusionPipeline
from io import BytesIO
import base64 

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

print(device)

model_id = "stabilityai/stable-diffusion-2-1"

if(device != "mps"):
    pipe = StableDiffusionPipeline.from_pretrained(model_id, revision="fp16", torch_dtype=torch.float16, use_auth_token=auth_token)
else:
    pipe = StableDiffusionPipeline.from_pretrained(model_id, use_auth_token=auth_token)

pipe.to(device)

if torch.backends.mps.is_available():
    pipe.enable_attention_slicing()

@app.get("/")
def generate(prompt: str): 
    print(prompt)
    if (device != "mps"):
        with autocast(): 
            image = pipe(prompt, guidance_scale=8.5).images[0]
    else:
        image = pipe(prompt, guidance_scale=8.5).images[0]

    image.save("testimage.png")
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    imgstr = base64.b64encode(buffer.getvalue())

    return Response(content=imgstr, media_type="image/png")