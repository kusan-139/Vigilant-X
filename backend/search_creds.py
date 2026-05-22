import os

def search_files(directory):
    for root, dirs, files in os.walk(directory):
        # Skip node_modules, .git, and other heavy/temp folders
        dirs[:] = [d for d in dirs if d not in ('node_modules', '.git', '__pycache__', 'dev-dist')]
        for file in files:
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    for term in ["service_role", "password", "postgres://", "postgresql://"]:
                        if term in content.lower():
                            print(f"Found '{term}' in {filepath}")
                            # Print lines containing the term (excluding long JWTs or giant tokens to be safe/clean)
                            lines = content.split('\n')
                            for idx, line in enumerate(lines):
                                if term in line.lower():
                                    print(f"  Line {idx+1}: {line.strip()[:200]}")
            except Exception as e:
                pass

search_files(".")
