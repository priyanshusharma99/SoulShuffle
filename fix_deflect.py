filepath = 'app/(tabs)/index.tsx'
with open(filepath, 'r', encoding='utf8') as f:
    content = f.read()

old = '''    // Optimistic update
    setSelectedReceivedCard(null);
    setShowDeflectDropdown(false);'''

new = '''    // Permanently dismiss so the popup never reopens
    setDismissedCardIds((prev) => [...prev, sendId]);
    setSelectedReceivedCard(null);
    setShowDeflectDropdown(false);'''

if old in content:
    content = content.replace(old, new, 1)
    with open(filepath, 'w', encoding='utf8') as f:
        f.write(content)
    print('Fixed deflect handler!')
else:
    print('Still not found')
