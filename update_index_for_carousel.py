import sys
import re

def main():
    file_path = r'C:\My_Project\EleVora\app\SoulShuffle\app\(tabs)\index.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # We want to completely remove the inline PendingDaresCarousel definition
    # It starts with const PendingDaresCarousel = ({ pendingChallenges, currentUserId }: any) => {
    # and ends right before export default function Dashboard() {
    
    start_str = "const PendingDaresCarousel ="
    end_str = "export default function Dashboard() {"
    
    start_idx = content.find(start_str)
    end_idx = content.find(end_str)
    
    if start_idx != -1 and end_idx != -1:
        # Also remove the inline usage
        # We know it's injected exactly as: <PendingDaresCarousel pendingChallenges={pendingChallenges} currentUserId={currentUserId} />
        
        usage_str = "<PendingDaresCarousel pendingChallenges={pendingChallenges} currentUserId={currentUserId} />"
        
        content = content[:start_idx] + content[end_idx:]
        content = content.replace(usage_str, "")
        
        # Add import at the top
        import_str = 'import PendingDaresCarousel from "@/components/PendingDaresCarousel";\n'
        if import_str not in content:
            content = content.replace('import { SafeAreaView } from "react-native-safe-area-context";', import_str + 'import { SafeAreaView } from "react-native-safe-area-context";')
            
        # Add usage right before Recent Moments
        recent_moments_marker = "{/* Recent Moments */}"
        new_usage = "                <PendingDaresCarousel pendingChallenges={pendingChallenges} currentUserId={currentUserId} />\n                " + recent_moments_marker
        content = content.replace(recent_moments_marker, new_usage)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Successfully removed inline component and updated index.tsx")
    else:
        print("Could not find inline component")

if __name__ == '__main__':
    main()
