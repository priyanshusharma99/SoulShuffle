import sys

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\app\(tabs)\index.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # The corrupted part is:
    #               <Text className="text-rose-400/80 text-xs font-medium mt-2">
    #                 Disconnecting from partner
    #         <Modal
    
    target = '              <Text className="text-rose-400/80 text-xs font-medium mt-2">\n                Disconnecting from partner\n        <Modal'
    replacement = '''              <Text className="text-rose-400/80 text-xs font-medium mt-2">
                Disconnecting from partner
              </Text>
            </View>
          </View>
        )}

        <Modal'''
        
    if target in content:
        content = content.replace(target, replacement)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Fixed missing tags for Leaving Room view!")
    else:
        print("Could not find the target string. Let me try a regex.")
        import re
        content, count = re.subn(r'Disconnecting from partner\s*<Modal', 'Disconnecting from partner\n              </Text>\n            </View>\n          </View>\n        )}\n\n        <Modal', content)
        if count > 0:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print("Fixed via regex!")
        else:
            print("Regex also failed!")

if __name__ == '__main__':
    main()
