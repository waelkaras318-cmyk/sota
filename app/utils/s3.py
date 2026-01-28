"""
S3 helper to generate pre-signed PUT URLs and public GET URLs.
If using MinIO in dev, provide endpoint_url in boto3 client via environment vars.
"""
import boto3
from botocore.client import Config
from app.core.config import settings
import os
from urllib.parse import urljoin

def s3_client():
    # For MinIO dev, set AWS_* env vars and optionally S3_ENDPOINT_URL
    endpoint_url = os.getenv("S3_ENDPOINT_URL") or None
    return boto3.client(
        "s3",
        region_name=settings.AWS_REGION or None,
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID") or settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY") or settings.AWS_SECRET_ACCESS_KEY,
        endpoint_url=endpoint_url,
        config=Config(signature_version="s3v4")
    )

def generate_presigned_put(key: str, expires_in=3600):
    client = s3_client()
    bucket = os.getenv("S3_BUCKET") or settings.S3_BUCKET
    url = client.generate_presigned_url(
        'put_object',
        Params={'Bucket': bucket, 'Key': key},
        ExpiresIn=expires_in,
        HttpMethod='PUT'
    )
    return url

def public_url(key: str):
    # If public bucket or CloudFront, adapt accordingly. For simplicity we return an S3 URL.
    endpoint = os.getenv("S3_ENDPOINT_URL")
    bucket = os.getenv("S3_BUCKET") or settings.S3_BUCKET
    if endpoint:
        # MinIO style endpoint
        return urljoin(endpoint, f"{bucket}/{key}")
    return f"https://{bucket}.s3.amazonaws.com/{key}"
