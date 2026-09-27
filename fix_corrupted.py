import sys

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\app\(tabs)\index.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # The corrupted block is:
    #         </Modal>
    #                       Decide Later
    #                     </Text>
    #                   </TouchableOpacity>
    #                 </View>
    #               )}
    #             </View>
    #           </View>
    #         </Modal>

    import re
    # We want to replace from </Modal> followed by Decide Later to the next </Modal>
    # with just </Modal>
    
    # Let's do a safe targeted replacement.
    bad_pattern = r'</Modal>\s*Decide Later\s*</Text>\s*</TouchableOpacity>\s*</View>\s*\)\}\s*</View>\s*</View>\s*</Modal>'
    
    if re.search(bad_pattern, content):
        content = re.sub(bad_pattern, '</Modal>', content)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Fixed corrupted Decide Later block!")
    else:
        print("Could not find the corrupted block using regex.")
        # Try manual split
        idx1 = content.find("</Modal>\n                      Decide Later")
        if idx1 != -1:
            idx2 = content.find("</Modal>", idx1 + 10)
            if idx2 != -1:
                content = content[:idx1] + "</Modal>" + content[idx2 + 8:]
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print("Fixed corrupted Decide Later block via manual split!")
            else:
                print("Failed to find end of block.")
        else:
            print("Failed to find start of block.")
            
if __name__ == '__main__':
    main()
