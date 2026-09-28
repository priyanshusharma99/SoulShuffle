const fs = require('fs');

let content = fs.readFileSync('components/PendingDaresCarousel.tsx', 'utf8');

// Find the whole CardTimer and replace it
const timerRegex = /const CardTimer = \(\{ send \}: \{ send: any \}\) => \{[\s\S]*?return \([\s\S]*?<\Ionicons[^>]*\/>[\s\S]*?<Text[^>]*>\{timeLeft\}<\/Text>[\s\S]*?<\/View>[\s\S]*?\);[\s\S]*?\};/m;

const correctTimer = const CardTimer = ({ send }: { send: any }) => {
  const getDiff = () => {
      const createdAt = new Date(send.created_at || Date.now()).getTime();
      const acceptedAt = send.accepted_at ? new Date(send.accepted_at).getTime() : send.updated_at ? new Date(send.updated_at).getTime() : createdAt;
      const isAccepted = send.status === 'ACCEPTED' || send.status === 'IN_PROGRESS';
      const target = isAccepted ? acceptedAt + 48 * 60 * 60 * 1000 : createdAt + 24 * 60 * 60 * 1000;
      const difference = target - new Date().getTime();
      return difference;
  };
  
  const formatTime = (diff: number) => {
      if (diff <= 0) return 'EXPIRED';
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      return \\h \m \s\;
  };

  const [timeLeft, setTimeLeft] = React.useState(() => formatTime(getDiff()));

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(formatTime(getDiff()));
    }, 1000);
    return () => clearInterval(interval);
  }, [send.created_at, send.updated_at, send.accepted_at, send.status]);

  return (
    <View style={{ backgroundColor: '#3b111b', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
      <Ionicons name="timer-outline" size={12} color="#e55f75" />
      <Text style={{ color: '#e55f75', fontSize: 11, fontWeight: '800', marginLeft: 4 }}>{timeLeft}</Text>
    </View>
  );
};;

if (content.match(timerRegex)) {
  content = content.replace(timerRegex, correctTimer);
  fs.writeFileSync('components/PendingDaresCarousel.tsx', content);
  console.log('Fixed CardTimer successfully!');
} else {
  console.log('Regex did not match.');
}
