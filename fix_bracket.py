import sys

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\app\(tabs)\dares.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # The issue is we stripped the > from the end of <TouchableOpacity ... 
    # And we replaced <View style={{ width: '100%', height: '52%' }}>
    
    # Let's find exactly where it broke.
    # It looks like: elevation: 3\n                        }}\n                      <View style={{ width: '100%', height: '65%'
    
    import re
    # We add the missing > to the end of TouchableOpacity
    fixed_content = re.sub(r'elevation: 3\s*\}\}\s*<View style={{ width:', r'elevation: 3\n                        }}\n                      >\n                        <View style={{ width:', content)

    if fixed_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        print("Fixed missing closing bracket!")
    else:
        print("Could not find the missing bracket location.")

if __name__ == '__main__':
    main()
