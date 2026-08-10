variable "aws_region" {
  description = "AWS region for infrastructure resources"
  type        = string
  default     = "eu-central-1"
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "bucket_name" {
  description = "Name of the S3 Bucket for media storage"
  type        = string
  default     = "sprachcafe-media-storage"
}
