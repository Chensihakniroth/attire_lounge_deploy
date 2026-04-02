#!/usr/bin/env python3
"""
Bundle-based categorization system for curated skills.
Allows initialization with only selected bundles.
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Set

def load_skills_index(index_file: str) -> List[Dict]:
    """Load the existing skills index."""
    with open(index_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        # Return the list of skills
        return data.get('skills', [])

def categorize_by_bundles(skills: List[Dict]) -> Dict:
    """
    Categorize skills by bundles based on their category.
    Creates a bundle-based structure for curated initialization.
    """
    bundles = {}

    for skill in skills:
        # Each skill is a dictionary with 'name', 'category', etc.
        category = skill.get('category', 'uncategorized')

        # Create bundle if it doesn't exist
        if category not in bundles:
            bundles[category] = {
                'name': category,
                'description': f'Bundle for {category} skills',
                'skills': [],
                'count': 0
            }

        # Add skill to bundle
        bundles[category]['skills'].append(skill)
        bundles[category]['count'] += 1

    return bundles

def generate_bundle_index(bundles: Dict, output_file: str):
    """Generate a bundle-based index file."""
    bundle_data = {
        'bundles': list(bundles.values()),
        'total_bundles': len(bundles),
        'total_skills': sum(b['count'] for b in bundles.values())
    }

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(bundle_data, f, indent=2)

    print(f"Bundle index generated successfully!")
    print(f"Total bundles: {bundle_data['total_bundles']}")
    print(f"Total skills: {bundle_data['total_skills']}")

    # Show bundle distribution
    print("\nBundle Distribution:")
    sorted_bundles = sorted(bundles.values(), key=lambda x: x['count'], reverse=True)
    for bundle in sorted_bundles:
        print(f"  {bundle['name']}: {bundle['count']} skills")

def create_curated_bundle(bundles: Dict, curated_skills: List[str], output_file: str):
    """
    Create a curated bundle with only selected skills.
    Used for initialization with curated skill sets.
    """
    curated_bundle = {
        'name': 'curated',
        'description': 'Curated bundle with selected skills',
        'skills': [],
        'count': 0
    }

    # Find skills that match curated list
    for skill in curated_skills:
        for bundle_name, bundle_data in bundles.items():
            for s in bundle_data['skills']:
                if s['name'] == skill:
                    curated_bundle['skills'].append(s)
                    curated_bundle['count'] += 1

    # Save curated bundle
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(curated_bundle, f, indent=2)

    print(f"Curated bundle created with {curated_bundle['count']} skills")

def create_antigravity_bundles(bundles: Dict, output_dir: str):
    """
    Create Antigravity-style bundle files based on the bundle structure.
    Each bundle gets its own JSON file for easy initialization.
    """
    os.makedirs(output_dir, exist_ok=True)

    for bundle_name, bundle_data in bundles.items():
        bundle_file = os.path.join(output_dir, f"{bundle_name}.json")
        with open(bundle_file, 'w', encoding='utf-8') as f:
            json.dump({
                'name': bundle_name,
                'description': bundle_data['description'],
                'skills': [skill['name'] for skill in bundle_data['skills']],
                'count': bundle_data['count']
            }, f, indent=2)

        print(f"Created bundle file: {bundle_file}")

if __name__ == "__main__":
    # Load existing skills index
    skills = load_skills_index('skills_index.json')

    # Categorize by bundles
    bundles = categorize_by_bundles(skills)

    # Generate bundle index
    generate_bundle_index(bundles, 'bundles_index.json')

    # Create Antigravity-style bundle files
    create_antigravity_bundles(bundles, 'bundles')

    # Example: Create curated bundle (you can customize this list)
    curated_skills = [
        'concise-planning',
        'lint-and-validate',
        'git-pushing',
        'systematic-debugging',
        'frontend-developer',
        'backend-dev-guidelines',
        'react-best-practices'
    ]
    create_curated_bundle(bundles, curated_skills, 'curated_bundle.json')
