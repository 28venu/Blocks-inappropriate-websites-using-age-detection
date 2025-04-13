from flask_cors import CORS
from flask import Flask, request, jsonify
from PIL import Image
import torch
import cv2
import numpy as np
from transformers import ViTImageProcessor, ViTForImageClassification
import io
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

app = Flask(__name__)
CORS(app)

# Initialize model and processor
model = ViTForImageClassification.from_pretrained('nateraw/vit-age-classifier')
processor = ViTImageProcessor.from_pretrained('nateraw/vit-age-classifier')

# Age ranges for each class
age_ranges = {
    0: "0-2",
    1: "3-9",
    2: "10-19",
    3: "20-29",
    4: "30-39",
    5: "40-49",
    6: "50-59",
    7: "60-69",
    8: "70-79",
    9: "80+"
}


def predict_age(image):
    """Predict the age category from an image and return 1
    if age is 18 or above, otherwise 0."""
    inputs = processor(images=image, return_tensors='pt')
    with torch.no_grad():
        output = model(**inputs)
    proba = output.logits.softmax(1)
    preds = proba.argmax(1).item()
    return 1 if preds >= 3 else 0


def is_face_present(image):
    """Check if a face is present in the given image."""
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

    image_np = np.array(image)
    image_cv = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
    gray = cv2.cvtColor(image_cv, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    return len(faces) > 0  # Returns True if a face is detected, else False


@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files['image']
    img = Image.open(io.BytesIO(file.read())).convert("RGB")

    is_face = is_face_present(img)
    check = predict_age(img) if is_face else 0
    print(check)
    return jsonify({"result": check})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
