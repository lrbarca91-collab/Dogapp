FROM python:3.11-slim

WORKDIR /app

# Copy requirements first (better caching)
COPY Backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY Backend/ .

# If you have models or other folders
# COPY Backend/app.py .
# COPY Backend/models.py .
# etc.

EXPOSE 5000
CMD ["python", "app.py"]