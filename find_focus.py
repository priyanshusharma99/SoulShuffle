filepath = 'app/(tabs)/dares.tsx'
with open(filepath, 'r', encoding='utf8') as f:
    content = f.read()
    lines = content.splitlines(True)

# Find the line number of useFocusEffect
for i, line in enumerate(lines):
    if 'useFocusEffect(' in line:
        print(f'useFocusEffect at line {i+1}: {repr(line[:80])}')
        break
