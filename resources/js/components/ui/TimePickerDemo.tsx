import { useState } from 'react'
import { TimePicker } from "@/components/ui/time-picker";

export default function TimePickerDemo() {
  const [value, setValue] = useState(new Date());
  return (
    <div className="p-10 space-y-4">
      <h2 className="text-lg font-black uppercase tracking-widest text-[#0d3542] dark:text-[#58a6ff]">Time Picker Demo</h2>
      <TimePicker
        use12HourFormat={true}
        value={value}
        onChange={setValue}
      />
      <div className="mt-4 p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 font-mono text-sm">
        Selected Time: {value.toLocaleTimeString()}
      </div>
    </div>
  );
}
