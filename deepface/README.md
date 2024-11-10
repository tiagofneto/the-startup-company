# Deepface Service

## Prerequisites

- [Python](https://www.python.org/downloads/) version 3.9

## Getting Started

1. Install Python dependencies:

```bash
pip install -r requirements.txt
```

2. Run the server:

```bash
gunicorn --bind 0.0.0.0:5001 --workers 4 main:app
```

The service will be available at `localhost:5001`

Note: On first run, the service will automatically download the required model weights to `~/.deepface/weights/`.
