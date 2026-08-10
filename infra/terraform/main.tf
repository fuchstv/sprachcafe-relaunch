# Terraform Configuration - AWS Infrastructure for SprachCafé Relaunch
# S3 Media Storage Bucket, Private Access Block, CloudFront OAC, CORS, IAM Service User

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "sprachcafe-relaunch"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# ==============================================================================
# 1. S3 BUCKET FOR MEDIA STORAGE
# ==============================================================================
resource "aws_s3_bucket" "media_storage" {
  bucket        = var.bucket_name
  force_destroy = false
}

# Server-Side Encryption Configuration
resource "aws_s3_bucket_server_side_encryption_configuration" "media_storage_encryption" {
  bucket = aws_s3_bucket.media_storage.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block all direct public access (Private Bucket)
resource "aws_s3_bucket_public_access_block" "media_storage_public_block" {
  bucket = aws_s3_bucket.media_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CORS Configuration for Uploads from Headless CMS and Web Applications
resource "aws_s3_bucket_cors_configuration" "media_storage_cors" {
  bucket = aws_s3_bucket.media_storage.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    allowed_origins = [
      "https://sprachcafe-polnisch.org",
      "https://www.sprachcafe-polnisch.org",
      "https://admin.sprachcafe-polnisch.org",
      "https://beta.sprachcafe-polnisch.org",
      "http://localhost:8055",
      "http://localhost:3000"
    ]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# ==============================================================================
# 2. CLOUDFRONT DISTRIBUTION WITH ORIGIN ACCESS CONTROL (OAC)
# ==============================================================================
resource "aws_cloudfront_origin_access_control" "media_oac" {
  name                              = "sprachcafe-media-oac"
  description                       = "CloudFront Origin Access Control for SprachCafe Media Assets"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "media_distribution" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "CDN for SprachCafe Media Storage Assets"
  default_root_object = ""

  origin {
    domain_name              = aws_s3_bucket.media_storage.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.media_oac.id
    origin_id                = "S3-sprachcafe-media-storage"
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-sprachcafe-media-storage"

    forwarded_values {
      query_string = false
      headers      = ["Origin", "Access-Control-Request-Headers", "Access-Control-Request-Method"]

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000
    compress               = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

# S3 Bucket Policy allowing CloudFront OAC to read private assets
resource "aws_s3_bucket_policy" "media_storage_policy" {
  bucket = aws_s3_bucket.media_storage.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontServicePrincipalReadOnly"
        Effect    = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.media_storage.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.media_distribution.arn
          }
        }
      }
    ]
  })
}

# ==============================================================================
# 3. DEDICATED IAM SERVICE USER FOR HEADLESS CMS CONTAINER
# ==============================================================================
resource "aws_iam_user" "cms_s3_user" {
  name = "sprachcafe-cms-s3-user"

  tags = {
    Description = "Dedicated Service User for Headless CMS S3 Media Uploads"
  }
}

resource "aws_iam_access_key" "cms_s3_user_key" {
  user = aws_iam_user.cms_s3_user.name
}

resource "aws_iam_policy" "cms_s3_policy" {
  name        = "sprachcafe-cms-s3-policy"
  description = "IAM Policy for Headless CMS to upload and manage media assets in S3"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowS3BucketManagement"
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetBucketLocation"
        ]
        Resource = aws_s3_bucket.media_storage.arn
      },
      {
        Sid    = "AllowS3ObjectOperations"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:PutObjectAcl"
        ]
        Resource = "${aws_s3_bucket.media_storage.arn}/*"
      }
    ]
  })
}

resource "aws_iam_user_policy_attachment" "cms_s3_attach" {
  user       = aws_iam_user.cms_s3_user.name
  policy_arn = aws_iam_policy.cms_s3_policy.arn
}

# Backup Bucket Configuration
resource "aws_s3_bucket" "backup_bucket" {
  bucket        = "sprachcafe-backups-${var.environment}"
  force_destroy = false
}

resource "aws_s3_bucket_public_access_block" "backup_bucket_access" {
  bucket = aws_s3_bucket.backup_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
