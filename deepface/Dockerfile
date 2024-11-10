FROM python:3.9-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    ffmpeg \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Pre-download the model weights
RUN mkdir -p /root/.deepface/weights && \
    curl -L https://github.com/serengil/deepface_models/releases/download/v1.0/vgg_face_weights.h5 \
    -o /root/.deepface/weights/vgg_face_weights.h5

COPY . .

EXPOSE 5001

CMD ["gunicorn", "--bind", "0.0.0.0:5001", "--workers", "4", "--access-logfile", "-", "--error-logfile", "-", "--capture-output", "main:app"] 