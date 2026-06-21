import io
import base64
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image
from io import BytesIO
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fgsm import MNISTModel, Attack

app = FastAPI(title="FGSM Attack API")

# Allow frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model once when server starts
device = torch.device("cpu")
model = MNISTModel().to(device)
model.load_state_dict(torch.load("mnist_model.pth", map_location=device))
model.eval()

criterion = nn.CrossEntropyLoss()
attack = Attack(model, criterion)

# Image preprocessing — same as training
transform = transforms.Compose([
    transforms.Grayscale(num_output_channels=1),
    transforms.Resize((28, 28)),
    transforms.ToTensor(),
    transforms.Normalize((0.1307,), (0.3081,))
])


def tensor_to_base64(tensor):
    """Convert image tensor to base64 string for JSON response."""
    # Denormalize
    tensor = tensor.squeeze().detach().cpu()
    tensor = tensor * 0.3081 + 0.1307
    tensor = torch.clamp(tensor, 0, 1)

    # Convert to PIL image
    img_array = (tensor.numpy() * 255).astype("uint8")
    img = Image.fromarray(img_array, mode="L")

    # Encode to base64
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


@app.get("/")
def root():
    return {"message": "FGSM Attack API is running!"}


@app.post("/attack")
async def run_attack(
    file: UploadFile = File(...),
    epsilon: float = Form(0.1)
):
    """
    Run FGSM attack on uploaded image.

    - file   : PNG or JPEG image
    - epsilon: attack strength (default 0.1)

    Returns clean prediction, adversarial prediction,
    base64 adversarial image, and attack success status.
    """
    # Read and preprocess uploaded image
    image_bytes = await file.read()
    pil_image = Image.open(io.BytesIO(image_bytes)).convert("L")
    image_tensor = transform(pil_image).unsqueeze(0).to(device)

    # Clean prediction
    with torch.no_grad():
        clean_output = model(image_tensor)
        clean_pred = clean_output.argmax(dim=1).item()

    # Generate adversarial image
    label = torch.tensor([clean_pred]).to(device)
    adv_image = attack.fgsm(image_tensor, label, epsilon)

    # Adversarial prediction
    with torch.no_grad():
        adv_output = model(adv_image)
        adv_pred = adv_output.argmax(dim=1).item()

    # Convert adversarial image to base64
    adv_base64 = tensor_to_base64(adv_image)

    return {
        "clean_prediction": clean_pred,
        "adversarial_prediction": adv_pred,
        "adversarial_image_base64": adv_base64,
        "attack_success": clean_pred != adv_pred,
        "epsilon": epsilon
    }