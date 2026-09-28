filepath = 'app/(tabs)/dares.tsx'
with open(filepath, 'r', encoding='utf8') as f:
    content = f.read()

old = 'onSelectDare={setSelectedDare} \n              />'
new = 'onSelectDare={setSelectedDare}\n                focusCardId={focusCardId}\n              />'

if old in content:
    content = content.replace(old, new, 1)
    with open(filepath, 'w', encoding='utf8') as f:
        f.write(content)
    print('Done!')
else:
    print('Not found, trying stripped')
    old2 = 'onSelectDare={setSelectedDare} \r\n              />'
    if old2 in content:
        content = content.replace(old2, 'onSelectDare={setSelectedDare}\r\n                focusCardId={focusCardId}\r\n              />', 1)
        with open(filepath, 'w', encoding='utf8') as f:
            f.write(content)
        print('Done with CRLF!')
    else:
        print('trying another approach')
        idx = content.find('onSelectDare={setSelectedDare}')
        print(repr(content[idx:idx+30]))
