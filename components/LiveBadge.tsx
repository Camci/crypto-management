import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Activity } from 'lucide-react'

function LiveBadge({ lastSavedData }: { lastSavedData: Date | null }) {
const [, setTick] = React.useState(0);
React.useEffect(() => {
const interval = setInterval(() => setTick(t => t + 1), 1000);
return () => clearInterval(interval);
}, []);
return (
<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
    <Activity className="h-3 w-3 mr-1" />
    Live {lastSavedData ? `(${Math.floor((Date.now() - lastSavedData.getTime()) / 1000) + 1}s ago)` : ''}
</Badge>
);
}

export default LiveBadge