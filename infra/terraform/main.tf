# Terraform Configuration - AWS Infrastructure for SprachCafé Relaunch
# Phase 1: Infrastructure

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

# S3 Bucket for CMS Media Assets
resource "aws_s3_bucket" "media_bucket" {
  bucket        = "sprachcafe-media-${var.environment}"
  force_destroy = false
}

resource "aws_s3_bucket_public_access_block" "media_bucket_access" {
  bucket = aws_s3_bucket.media_bucket.id

  block_public_acls       = true
  block_public_policy     = false
  ignore_public_acls      = true
  restrict_public_buckets = false
}

# S3 Bucket for Database Backups
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
