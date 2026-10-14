FROM python:3.11-slim

WORKDIR /app

# Install dependensi sistem untuk LightGBM
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Salin source code API dan model artefak
COPY app/ ./app/
COPY ../ml/artifacts/ ./ml/artifacts/

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
