import torch
import torch.nn as nn


class MNISTModel(nn.Module):
    def __init__(self):
        super(MNISTModel, self).__init__()
        self.conv1 = nn.Conv2d(1, 32, 3, 1)
        self.conv2 = nn.Conv2d(32, 64, 3, 1)
        self.dropout = nn.Dropout(0.25)
        self.fc1 = nn.Linear(9216, 128)
        self.fc2 = nn.Linear(128, 10)

    def forward(self, x):
        x = torch.relu(self.conv1(x))
        x = torch.relu(self.conv2(x))
        x = torch.max_pool2d(x, 2)
        x = self.dropout(x)
        x = torch.flatten(x, 1)
        x = torch.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.fc2(x)
        return x


class Attack:
    def __init__(self, model, criterion):
        self.model = model
        self.criterion = criterion

    def fgsm(self, image, label, epsilon):
        image = image.clone().detach().requires_grad_(True)
        output = self.model(image)
        loss = self.criterion(output, label)
        self.model.zero_grad()
        loss.backward()
        gradient_sign = image.grad.data.sign()
        adversarial_image = image + epsilon * gradient_sign
        adversarial_image = torch.clamp(adversarial_image, 0, 1)
        return adversarial_image.detach()