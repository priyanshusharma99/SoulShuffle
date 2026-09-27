import sys
import re

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\app\(tabs)\index.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    text_stack = []

    for i, line in enumerate(lines):
        # Count <Text
        # But beware of self closing? Text doesn't usually self close.
        # Find all <Text
        for m in re.finditer(r'<Text\b[^>]*>', line):
            text_stack.append(i + 1)
        
        # Find all </Text>
        for m in re.finditer(r'</Text>', line):
            if text_stack:
                text_stack.pop()
            else:
                print(f"Extra closing </Text> at line {i + 1}")

    if text_stack:
        for line_num in text_stack:
            print(f"Unclosed <Text> opened at line {line_num}")
    else:
        print("All <Text> tags are balanced!")

if __name__ == '__main__':
    main()
