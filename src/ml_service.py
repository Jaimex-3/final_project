#!/usr/bin/env python3
"""
ML/CV Service for Photo Verification
Uses structural similarity (SSIM) for image comparison
"""

import sys
import json
from skimage import io, transform, metrics
from skimage.color import rgb2gray
import numpy as np
from PIL import Image
import os


def load_and_preprocess_image(image_path, target_size=(256, 256)):
    """
    Load and preprocess an image for comparison
    
    Args:
        image_path: Path to the image file
        target_size: Target size for resizing (width, height)
    
    Returns:
        Preprocessed grayscale image array
    """
    try:
        # Load image
        img = io.imread(image_path)
        
        # Convert to RGB if needed (handle RGBA, grayscale, etc.)
        if len(img.shape) == 2:  # Grayscale
            img = np.stack([img] * 3, axis=-1)
        elif img.shape[2] == 4:  # RGBA
            img = img[:, :, :3]
        
        # Resize to target size
        img_resized = transform.resize(img, target_size, anti_aliasing=True)
        
        # Convert to grayscale
        img_gray = rgb2gray(img_resized)
        
        return img_gray
    except Exception as e:
        raise Exception(f"Error loading image {image_path}: {str(e)}")


def compare_images(image1_path, image2_path):
    """
    Compare two images using Structural Similarity Index (SSIM)
    
    Args:
        image1_path: Path to first image (captured photo)
        image2_path: Path to second image (registered photo)
    
    Returns:
        Dictionary with comparison results
    """
    try:
        # Load and preprocess images
        img1 = load_and_preprocess_image(image1_path)
        img2 = load_and_preprocess_image(image2_path)
        
        # Calculate SSIM
        ssim_score = metrics.structural_similarity(img1, img2, data_range=1.0)
        
        # Convert SSIM (-1 to 1) to confidence score (0 to 100)
        # SSIM of 1 means identical images
        # SSIM of 0 means no similarity
        # SSIM can be negative for very different images
        confidence_score = max(0, min(100, ssim_score * 100))
        
        # Determine match result based on threshold (70%)
        threshold = 70.0
        is_match = confidence_score >= threshold
        
        result = {
            "success": True,
            "confidence_score": round(confidence_score, 2),
            "is_match": is_match,
            "threshold": threshold,
            "method": "SSIM (Structural Similarity Index)",
            "image1": image1_path,
            "image2": image2_path
        }
        
        return result
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "confidence_score": 0.0,
            "is_match": False
        }


def verify_photo(captured_photo_path, registered_photo_path):
    """
    Main verification function
    
    Args:
        captured_photo_path: Path to captured photo during check-in
        registered_photo_path: Path to registered student photo
    
    Returns:
        JSON string with verification results
    """
    # Validate inputs
    if not os.path.exists(captured_photo_path):
        return json.dumps({
            "success": False,
            "error": f"Captured photo not found: {captured_photo_path}",
            "confidence_score": 0.0,
            "is_match": False
        })
    
    if not os.path.exists(registered_photo_path):
        return json.dumps({
            "success": False,
            "error": f"Registered photo not found: {registered_photo_path}",
            "confidence_score": 0.0,
            "is_match": False
        })
    
    # Compare images
    result = compare_images(captured_photo_path, registered_photo_path)
    
    return json.dumps(result, indent=2)


if __name__ == "__main__":
    # Command-line interface
    if len(sys.argv) != 3:
        print(json.dumps({
            "success": False,
            "error": "Usage: python3 ml_service.py <captured_photo_path> <registered_photo_path>",
            "confidence_score": 0.0,
            "is_match": False
        }))
        sys.exit(1)
    
    captured_photo = sys.argv[1]
    registered_photo = sys.argv[2]
    
    result = verify_photo(captured_photo, registered_photo)
    print(result)
