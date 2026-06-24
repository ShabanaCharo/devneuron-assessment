# FGSM Adversarial Attack — DevNeuron Assessment

## Deployed URLs
- **Frontend:** https://fgsm-frontend-otdf.onrender.com
- **Backend API:** https://fgsm-backend-6hn4.onrender.com
- **API Docs:** https://fgsm-backend-6hn4.onrender.com/docs

## How to Run Locally

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app_fgsm:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## What is FGSM?

The Fast Gradient Sign Method (FGSM) is an adversarial attack technique introduced by Goodfellow et al. in 2014. It works by computing the gradient of the model's loss function with respect to the input image, then perturbing the image in the direction that maximizes the loss. The formula is: x_adv = x + epsilon × sign(∇x Loss(model(x), y)). This creates a new image that looks nearly identical to the original but causes the model to misclassify it.

The epsilon parameter controls attack strength. A small epsilon produces subtle, nearly invisible perturbations while a large epsilon creates stronger but more visible distortions. FGSM is a single-step attack making it very fast and computationally efficient compared to iterative methods.

## Observations

- At epsilon=0.0, the model achieved ~99% accuracy on MNIST test set
- As epsilon increased, accuracy dropped significantly reaching below 20% at epsilon=0.5
- The "7" digit proved particularly robust to FGSM attacks at lower epsilon values
- Increasing epsilon made attacks stronger but also made perturbations more visible
- The adversarial images are visibly grayer and noisier than the originals

## Deployment

- **Frontend** deployed on Render Web Service (Next.js)
- **Backend** deployed on Render Web Service (FastAPI + PyTorch)
- AWS deployment was attempted but failed due to billing verification issues with Pakistani bank cards
- Render was used as the alternative as permitted by the assessment guidelines

## References
- Goodfellow et al., "Explaining and Harnessing Adversarial Examples" (2014): https://arxiv.org/abs/1412.6572