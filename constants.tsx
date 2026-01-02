
import React from 'react';

export const POSES = [
  { id: 'shop-display', label: 'Shop Display', icon: 'fa-shop', description: 'Relaxed posture, slight side angle for a natural look' },
  { id: 'walking', label: 'Walking Motion', icon: 'fa-person-walking', description: 'Dynamic movement showing fabric drape' },
  { id: 'side-profile', label: 'Side Profile', icon: 'fa-user', description: 'Shows silhouette and side seams' },
  { id: 'back-view', label: 'Back View', icon: 'fa-user', description: 'Displays rear construction and pockets' },
  { id: 'sitting', label: 'Relaxed Sitting', icon: 'fa-chair', description: 'Casual lifestyle context' },
  { id: 'crouching', label: 'Urban Crouch', icon: 'fa-child-reaching', description: 'Modern street-style aesthetic' },
];

export const RACES = [
  { id: 'diverse', label: 'Diverse' },
  { id: 'caucasian', label: 'Caucasian' },
  { id: 'black', label: 'Black' },
  { id: 'asian', label: 'Asian' },
  { id: 'hispanic', label: 'Hispanic' },
  { id: 'south-asian', label: 'South Asian' },
  { id: 'middle-eastern', label: 'Middle Eastern' },
];

export const BACKGROUNDS = [
  { id: 'clean', label: 'Clean', icon: 'fa-border-none', description: 'Minimalist studio setup with soft shadows' },
  { id: 'urban', label: 'Urban', icon: 'fa-city', description: 'Modern city street, concrete and glass' },
  { id: 'outdoors', label: 'Outdoors', icon: 'fa-tree', description: 'Natural daylight in a park or garden' },
  { id: 'active', label: 'Active', icon: 'fa-bolt', description: 'Dynamic sports court or gym environment' },
];

export const ASPECT_RATIOS = [
  { id: '1:1', label: 'Square (1:1)' },
  { id: '3:4', label: 'Portrait (3:4)' },
  { id: '4:3', label: 'Landscape (4:3)' },
  { id: '9:16', label: 'Story (9:16)' },
  { id: '16:9', label: 'Wide (16:9)' },
];

export const MODEL_SHOT_PROMPT = (config: { modelType: string, modelRace: string, pose: string, background: string, customInstructions?: string }) => {
  let envDescription = '';
  switch (config.background) {
    case 'Urban':
      envDescription = 'A stylish urban city street at golden hour, featuring concrete textures and modern architecture.';
      break;
    case 'Outdoors':
      envDescription = 'A lush outdoor setting with vibrant tropical plants, soft natural sunlight, and a premium resort vibe.';
      break;
    case 'Active':
      envDescription = 'A modern and colorful basketball court or community space with clean lines and dynamic energy.';
      break;
    default:
      envDescription = 'A professional high-key photo studio with a clean white floor and background, subtle depth, and soft lighting.';
  }

  const raceDesc = config.modelRace === 'Diverse' ? 'fashion model' : `${config.modelRace} fashion model`;

  return `
    High-end professional photography for Zimbabalooba brand.
    Subject: A ${config.modelType} ${raceDesc} wearing the exact African cotton pants from the uploaded image.
    Pose: The model is in a ${config.pose === 'Shop Display' ? 'relaxed, natural posture, standing at a slight 3/4 side angle' : config.pose} position.
    Environment: ${envDescription}
    
    ${config.customInstructions ? `ADDITIONAL STYLE NOTES: ${config.customInstructions}` : ''}

    CRITICAL BRAND DETAILS:
    - Preserve the exact hand-dyed patterns, vibrant colors, and 100% African cotton texture of the original pants.
    - Ensure the fabric looks natural, with realistic folds and drape based on the ${config.pose}.
    - The model should have an "adventurous and joyful" expression or vibe.
    Aesthetics:
    - Full body framing from hips to feet.
    - Model wears minimalist footwear that doesn't distract from the vibrant pants.
    - Lighting should highlight the unique dye patterns and high-quality weave of the fabric.
    - Professional depth of field, model is in sharp focus.
    Resolution: Studio-grade quality, commercial advertisement ready.
  `;
};
