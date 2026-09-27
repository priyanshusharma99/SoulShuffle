import sys

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\app\(tabs)\index.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # The file ends with:
    #         </Modal>
    #       </SafeAreaView>
    #     </ErrorBoundary>
    #   );
    # }
    
    if '</ScrollView>\n      </SafeAreaView>' not in content:
        content = content.replace('</SafeAreaView>', '</ScrollView>\n        </SafeAreaView>')
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        print("Added missing </ScrollView>!")

if __name__ == '__main__':
    main()
