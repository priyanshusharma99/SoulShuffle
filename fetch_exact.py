import urllib.request

url = 'https://raw.githubusercontent.com/priyanshusharma99/SoulShuffle/8e3b78fa5f99be9253961e74bfa0fca11b1e10ba/app/(tabs)/dares.tsx'
with urllib.request.urlopen(url) as response:
    content = response.read().decode('utf-8')

with open('app/(tabs)/dares.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done. Lines:', len(content.splitlines()))
