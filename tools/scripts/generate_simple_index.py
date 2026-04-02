#!/usr/bin/env python3
"""
Simple index generator for categorized skills.
"""

import os
import json
from pathlib import Path
from typing import Dict, List

def build_skills_index(skills_dir: str) -> Dict:
    """
    Build a skills index from the categorized skills directory.
    """
    skills_path = Path(skills_dir)
    skills_index = {
        'skills': [],
        'categories': {}
    }

    # Process each skill
    for skill_dir in skills_path.iterdir():
        if skill_dir.is_dir():
            skill_file = skill_dir / 'SKILL.md'
            if skill_file.exists():
                # Read skill frontmatter
                with open(skill_file, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Extract frontmatter
                frontmatter = {}
                in_frontmatter = False
                frontmatter_lines = []
                for line in content.split('\n'):
                    if line.strip() == '---':
                        if in_frontmatter:
                            break
                        in_frontmatter = True
                        continue
                    if in_frontmatter:
                        frontmatter_lines.append(line)

                # Parse frontmatter
                for line in frontmatter_lines:
                    if ':' in line:
                        key, value = line.split(':', 1)
                        frontmatter[key.strip()] = value.strip().strip('"')

                # Add to index
                if 'category' in frontmatter:
                    skill_data = {
                        'name': frontmatter.get('name', skill_dir.name),
                        'description': frontmatter.get('description', ''),
                        'category': frontmatter['category'],
                        'date_added': frontmatter.get('date_added', ''),
                        'source': frontmatter.get('source', ''),
                        'risk': frontmatter.get('risk', 'unknown')
                    }
                    skills_index['skills'].append(skill_data)

                    # Track categories
                    if frontmatter['category'] not in skills_index['categories']:
                        skills_index['categories'][frontmatter['category']] = {
                            'count': 0,
                            'skills': []
                        }
                    skills_index['categories'][frontmatter['category']]['count'] += 1
                    skills_index['categories'][frontmatter['category']]['skills'].append(skill_data['name'])

    return skills_index

def main():
    skills_dir = '.agents/skills/skills'
    output_file = 'skills_index.json'

    # Build index
    skills_index = build_skills_index(skills_dir)

    # Save to file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(skills_index, f, indent=2)

    print(f"Skills index generated successfully!")
    print(f"Total skills: {len(skills_index['skills'])}")
    print(f"Categories: {len(skills_index['categories'])}")

    # Show category distribution
    print("\nCategory Distribution:")
    categories_sorted = sorted(
        skills_index['categories'].items(),
        key=lambda x: x[1]['count'],
        reverse=True
    )
    for category, data in categories_sorted:
        print(f"  {category}: {data['count']} skills")

if __name__ == '__main__':
    main()
