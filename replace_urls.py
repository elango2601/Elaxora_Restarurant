import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Replace template literals: `http://127.0.0.1:3001/path` -> `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001'}/path`
    content = re.sub(
        r'`http://127\.0\.0\.1:3001(/[^`]+)?`',
        r'`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}\1`',
        content
    )

    # Replace string literals: 'http://127.0.0.1:3001/path' -> `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001'}/path`
    content = re.sub(
        r"'http://127\.0\.0\.1:3001(/[^']+)?'",
        r'`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}\1`',
        content
    )

    # WebSockets template literals
    content = re.sub(
        r'`ws://127\.0\.0\.1:3001(/[^`]+)?`',
        r'`${process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:3001"}\1`',
        content
    )

    # WebSockets string literals
    content = re.sub(
        r"'ws://127\.0\.0\.1:3001(/[^']+)?'",
        r'`${process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:3001"}\1`',
        content
    )

    with open(filepath, 'w') as f:
        f.write(content)

for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
            process_file(os.path.join(root, file))

print("URL replacement complete.")
