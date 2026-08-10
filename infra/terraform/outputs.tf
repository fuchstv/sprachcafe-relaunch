output "s3_bucket_name" {
  description = "Name of the created S3 media storage bucket"
  value       = aws_s3_bucket.media_storage.id
}

output "s3_bucket_arn" {
  description = "ARN of the S3 media storage bucket"
  value       = aws_s3_bucket.media_storage.arn
}

output "aws_region" {
  description = "AWS region of the S3 bucket"
  value       = var.aws_region
}

output "cloudfront_distribution_domain_name" {
  description = "Domain name of the CloudFront CDN distribution"
  value       = aws_cloudfront_distribution.media_distribution.domain_name
}

output "cms_s3_user_name" {
  description = "IAM username created for Headless CMS container"
  value       = aws_iam_user.cms_s3_user.name
}

output "cms_s3_user_access_key_id" {
  description = "AWS Access Key ID for Headless CMS container"
  value       = aws_iam_access_key.cms_s3_user_key.id
  sensitive   = true
}

output "cms_s3_user_secret_access_key" {
  description = "AWS Secret Access Key for Headless CMS container"
  value       = aws_iam_access_key.cms_s3_user_key.secret
  sensitive   = true
}
