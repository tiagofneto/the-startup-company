# Deepface Service

## Prerequisites

- [Python](https://www.python.org/downloads/) version 3.9

## Getting Started

1. Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate 
```

2. Install Python dependencies:

```bash
pip install -r requirements.txt
```

3. Run the server:

```bash
gunicorn --bind 0.0.0.0:5001 --workers 4 main:app
```

The service will be available at `localhost:5001`

Note: On first run, the service will automatically download the required model weights to `~/.deepface/weights/`.

To deactivate the virtual environment when you're done:
```bash
deactivate
```
