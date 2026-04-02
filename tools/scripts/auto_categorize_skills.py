#!/usr/bin/env python3
"""
Auto-categorization script for skills based on keyword analysis.
"""

import os
import json
import re
from pathlib import Path
from typing import Dict, List, Tuple

# Category keywords configuration
CATEGORY_KEYWORDS = {
    'backend': [
        'nodejs', 'node.js', 'express', 'fastapi', 'django', 'flask', 'spring',
        'java', 'python', 'golang', 'rust', 'server', 'api', 'rest', 'graphql',
        'database', 'sql', 'mongodb', 'postgres', 'mysql'
    ],
    'web-development': [
        'react', 'vue', 'angular', 'html', 'css', 'javascript', 'typescript',
        'frontend', 'tailwind', 'bootstrap', 'webpack', 'vite', 'pwa',
        'responsive', 'seo', 'three.js', 'webgl', '3d'
    ],
    'database': [
        'database', 'sql', 'postgres', 'mysql', 'mongodb', 'firestore', 'redis',
        'orm', 'schema', 'query', 'index', 'migration'
    ],
    'ai-ml': [
        'ai', 'machine learning', 'ml', 'tensorflow', 'pytorch', 'nlp',
        'llm', 'gpt', 'transformer', 'embedding', 'training', 'neural network'
    ],
    'devops': [
        'docker', 'kubernetes', 'ci/cd', 'git', 'jenkins', 'terraform',
        'ansible', 'deploy', 'container', 'monitoring', 'infrastructure'
    ],
    'cloud': [
        'aws', 'azure', 'gcp', 'serverless', 'lambda', 'storage', 'cdn',
        'cloud', 'virtual machine', 'vpc', 's3', 'blob storage'
    ],
    'security': [
        'encryption', 'cryptography', 'jwt', 'oauth', 'authentication',
        'authorization', 'vulnerability', 'penetration', 'security', 'ssl'
    ],
    'testing': [
        'test', 'jest', 'mocha', 'pytest', 'cypress', 'selenium', 'unit test',
        'e2e', 'integration', 'performance', 'load', 'security test'
    ],
    'mobile': [
        'mobile', 'react native', 'flutter', 'ios', 'android', 'swift',
        'kotlin', 'app', 'mobile development', 'cross-platform'
    ],
    'automation': [
        'automation', 'workflow', 'scripting', 'robot', 'trigger', 'integration',
        'automation', 'bot', 'process', 'automation', 'rpa'
    ],
    'game-development': [
        'game', 'unity', 'unreal', 'godot', 'threejs', '2d', '3d', 'physics',
        'game engine', 'game development', 'game design'
    ],
    'data-science': [
        'data', 'analytics', 'pandas', 'numpy', 'statistics', 'visualization',
        'data science', 'data analysis', 'machine learning', 'data engineering'
    ],
    'content': [
        'documentation', 'seo', 'writing', 'content', 'copywriting',
        'technical writing', 'content strategy', 'content creation'
    ]
}

def analyze_skill(skill_name: str, description: str) -> Tuple[str, float, str]:
    """
    Analyze a skill and determine its category based on keywords.
    Returns category, confidence score, and reason.
    """
    # Combine name and description for analysis
    text = f"{skill_name} {description}".lower()

    # Track matches
    matches = {category: 0 for category in CATEGORY_KEYWORDS}

    # Check for exact phrase matches (weighted higher)
    for category, keywords in CATEGORY_KEYWORDS.items():
        for keyword in keywords:
            # Count occurrences of each keyword
            matches[category] += len(re.findall(rf'\b{re.escape(keyword)}\b', text))

    # Find best category
    if matches:
        best_category = max(matches, key=matches.get)
        confidence = matches[best_category] / sum(matches.values()) if sum(matches.values()) > 0 else 0
        reason = f"Matched {matches[best_category]} keywords in category '{best_category}'"

        return best_category, confidence, reason

    # Fallback: derive from skill name tokens
    tokens = re.findall(r'\b\w+\b', skill_name.lower())
    if tokens:
        return 'uncategorized', 0.0, f"No keywords matched, derived from skill name tokens: {', '.join(tokens[:3])}"

    return 'uncategorized', 0.0, "No keywords matched and no skill name tokens available"

def process_skills_directory(skills_dir: str, dry_run: bool = False) -> Dict:
    """
    Process all skills in the directory and categorize them.
    """
    skills_path = Path(skills_dir)
    results = {
        'categorized': 0,
        'already_categorized': 0,
        'failed_to_categorize': 0,
        'changes': []
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

                # Check if already categorized
                if 'category' in frontmatter and frontmatter['category'] != 'uncategorized':
                    results['already_categorized'] += 1
                    continue

                # Analyze skill
                skill_name = frontmatter.get('name', skill_dir.name)
                description = frontmatter.get('description', '')

                category, confidence, reason = analyze_skill(skill_name, description)

                # Update results
                if category != 'uncategorized':
                    results['categorized'] += 1
                    results['changes'].append({
                        'skill': skill_name,
                        'old_category': frontmatter.get('category', 'uncategorized'),
                        'new_category': category,
                        'confidence': confidence,
                        'reason': reason
                    })

                    # Apply changes if not dry run
                    if not dry_run:
                        # Update frontmatter
                        new_content = []
                        in_frontmatter = False
                        category_added = False
                        for line in content.split('\n'):
                            if line.strip() == '---':
                                if in_frontmatter:
                                    # Add category before closing frontmatter
                                    if not category_added:
                                        new_content.append(f"category: {category}")
                                        category_added = True
                                in_frontmatter = not in_frontmatter
                            new_content.append(line)

                            # Add category if not in frontmatter
                            if in_frontmatter and not category_added and 'category:' in line:
                                category_added = True

                        if not category_added:
                            # Add category at the end of frontmatter
                            new_content.insert(-1, f"category: {category}")

                        # Write updated content
                        with open(skill_file, 'w', encoding='utf-8') as f:
                            f.write('\n'.join(new_content))

                else:
                    results['failed_to_categorize'] += 1

    return results

def main():
    import argparse

    parser = argparse.ArgumentParser(description='Auto-categorize skills based on keyword analysis.')
    parser.add_argument('--dry-run', action='store_true', help='Preview changes without applying them')
    parser.add_argument('--skills-dir', default='.agents/skills/skills', help='Directory containing skills')

    args = parser.parse_args()

    print("=" * 70)
    print("AUTO-CATEGORIZATION REPORT")
    print("=" * 70)

    results = process_skills_directory(args.skills_dir, args.dry_run)

    print("\nSummary:")
    print(f"   {'✅ Categorized:'} {results['categorized']}")
    print(f"   {'⏭️  Already categorized:'} {results['already_categorized']}")
    print(f"   {'❌ Failed to categorize:'} {results['failed_to_categorize']}")
    print(f"   {'📈 Total processed:'} {results['categorized'] + results['already_categorized'] + results['failed_to_categorize']}")

    if results['changes']:
        print("\nSample changes:")
        for change in results['changes'][:10]:  # Show first 10 changes
            print(f"   • {change['skill']}")
            print(f"     {change['old_category']} → {change['new_category']}")
            print(f"     Confidence: {change['confidence']:.2f}")
            print(f"     Reason: {change['reason']}")
            print()

if __name__ == '__main__':
    main()
