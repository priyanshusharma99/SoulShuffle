import sys

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\app\(tabs)\index.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove all the bad injections
    bad_injection = "\n                <PendingDaresCarousel pendingChallenges={pendingChallenges} currentUserId={currentUserId} />\n                "
    content = content.replace(bad_injection, "")
    
    # Also clean up any other variants
    content = content.replace("<PendingDaresCarousel pendingChallenges={pendingChallenges} currentUserId={currentUserId} />", "")

    # Now, find the ONLY proper place to inject it.
    # The header block looks like this:
    #                 <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif', color: '#fbcfe8', fontSize: 13, fontStyle: 'italic' }}>Same team</Text>
    #                 <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'serif', color: '#fbcfe8', fontSize: 11, fontStyle: 'italic' }}>Always ∞</Text>
    #               </View>
    #             </View>
    
    # We can just look for Always ∞</Text>\n                  </View>\n                </View>
    # But wait, we saw it failed earlier because of encoding with the infinity symbol!
    # Let's search for Same team</Text> instead, and skip a few lines.
    
    import re
    # We find the end of the Greeting View:
    match = re.search(r'Same team</Text>.*?</View>\s*</View>', content, re.DOTALL)
    if match:
        end_pos = match.end()
        # Insert here!
        safe_injection = "\n\n                <PendingDaresCarousel pendingChallenges={pendingChallenges} currentUserId={currentUserId} />\n"
        content = content[:end_pos] + safe_injection + content[end_pos:]
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Reverted and safely injected!")
    else:
        print("Could not find greeting block.")

if __name__ == '__main__':
    main()
