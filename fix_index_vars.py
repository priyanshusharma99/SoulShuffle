import sys

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\app\(tabs)\index.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # We will inject these variables if they don't exist before the rendering block where they are used.
    # A safe place is right before the return statement of the main component.
    
    # We find:
    # return (
    #   <ErrorBoundary FallbackComponent={...}>
    
    search_str = 'return (\n    <ErrorBoundary'
    if search_str in content:
        inject = '''
  const roomDuration = activeRoom?.duration === '30_DAYS' ? 30 : 7;
  const currentDay = 1; // Replace with actual logic later
  const progressPercent = 0; // Replace with actual logic later

  return (
    <ErrorBoundary'''
        content = content.replace(search_str, inject)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Fixed index.tsx variables")
    else:
        print("Could not find insertion point")

if __name__ == '__main__':
    main()
