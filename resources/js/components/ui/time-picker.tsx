import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Clock, CheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  format,
  parse,
  setHours,
  startOfHour,
  endOfHour,
  setMinutes,
  startOfMinute,
  endOfMinute,
  setSeconds,
  startOfDay,
  endOfDay,
  addHours,
  subHours,
  setMilliseconds,
} from 'date-fns';

interface SimpleTimeOption {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  label: string;
  disabled?: boolean;
}

const AM_VALUE = 0;
const PM_VALUE = 1;

export function TimePicker({
  value,
  onChange,
  use12HourFormat,
  min,
  max,
  disabled,
  modal,
  hasError,
  className,
}: {
  use12HourFormat?: boolean;
  value: Date;
  onChange: (date: Date) => void;
  min?: Date;
  max?: Date;
  disabled?: boolean;
  className?: string;
  modal?: boolean;
  hasError?: boolean;
}) {
  const formatStr = useMemo(
    () =>
      use12HourFormat
        ? 'yyyy-MM-dd hh:mm:ss.SSS a xxxx'
        : 'yyyy-MM-dd HH:mm:ss.SSS xxxx',
    [use12HourFormat],
  );

  // Sync internal state with external value
  const [internalDate, setInternalDate] = useState(value);
  useEffect(() => {
    setInternalDate(value);
  }, [value]);

  const ampm = useMemo(
    () => (format(internalDate, 'a') === 'AM' ? AM_VALUE : PM_VALUE),
    [internalDate],
  );
  const hour = useMemo(
    () => (use12HourFormat ? +format(internalDate, 'hh') : internalDate.getHours()),
    [internalDate, use12HourFormat],
  );
  const minute = useMemo(() => internalDate.getMinutes(), [internalDate]);
  const second = useMemo(() => internalDate.getSeconds(), [internalDate]);

  const _hourIn24h = useMemo(() => {
    return use12HourFormat ? (hour % 12) + ampm * 12 : hour;
  }, [hour, use12HourFormat, ampm]);

  const updateTime = useCallback(
    (newHour: number, newMinute: number, newSecond: number, newAmpm: number) => {
      const nextDate = buildTime({
        use12HourFormat,
        value: internalDate,
        formatStr,
        hour: newHour,
        minute: newMinute,
        second: newSecond,
        ampm: newAmpm,
      });
      setInternalDate(nextDate);
      onChange(nextDate);
    },
    [internalDate, formatStr, use12HourFormat, onChange],
  );

  const hours: SimpleTimeOption[] = useMemo(
    () =>
      Array.from({ length: use12HourFormat ? 12 : 24 }, (_, i) => {
        let disabled = false;
        const hourValue = use12HourFormat ? (i === 0 ? 12 : i) : i;
        const hDate = setHours(internalDate, use12HourFormat ? i + ampm * 12 : i);
        const hStart = startOfHour(hDate);
        const hEnd = endOfHour(hDate);
        if (min && hEnd < min) disabled = true;
        if (max && hStart > max) disabled = true;
        return {
          value: hourValue,
          label: hourValue.toString().padStart(2, '0'),
          disabled,
        };
      }),
    [internalDate, min, max, use12HourFormat, ampm],
  );

  const minutes: SimpleTimeOption[] = useMemo(() => {
    const anchorDate = setHours(internalDate, _hourIn24h);
    return Array.from({ length: 60 }, (_, i) => {
      let disabled = false;
      const mDate = setMinutes(anchorDate, i);
      const mStart = startOfMinute(mDate);
      const mEnd = endOfMinute(mDate);
      if (min && mEnd < min) disabled = true;
      if (max && mStart > max) disabled = true;
      return {
        value: i,
        label: i.toString().padStart(2, '0'),
        disabled,
      };
    });
  }, [internalDate, min, max, _hourIn24h]);

  const seconds: SimpleTimeOption[] = useMemo(() => {
    const anchorDate = setMilliseconds(
      setMinutes(setHours(internalDate, _hourIn24h), minute),
      0,
    );
    const _min = min ? setMilliseconds(min, 0) : undefined;
    const _max = max ? setMilliseconds(max, 0) : undefined;
    return Array.from({ length: 60 }, (_, i) => {
      let disabled = false;
      const sDate = setSeconds(anchorDate, i);
      if (_min && sDate < _min) disabled = true;
      if (_max && sDate > _max) disabled = true;
      return {
        value: i,
        label: i.toString().padStart(2, '0'),
        disabled,
      };
    });
  }, [internalDate, minute, min, max, _hourIn24h]);

  const ampmOptions = useMemo(() => {
    const startD = startOfDay(internalDate);
    const endD = endOfDay(internalDate);
    return [
      { value: AM_VALUE, label: 'AM' },
      { value: PM_VALUE, label: 'PM' },
    ].map((v) => {
      let disabled = false;
      const start = addHours(startD, v.value * 12);
      const end = subHours(endD, (1 - v.value) * 12);
      if (min && end < min) disabled = true;
      if (max && start > max) disabled = true;
      return { ...v, disabled };
    });
  }, [internalDate, min, max]);

  const [open, setOpen] = useState(false);
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);
  const secondRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (open) {
        hourRef.current?.scrollIntoView({ behavior: 'auto', block: 'center' });
        minuteRef.current?.scrollIntoView({ behavior: 'auto', block: 'center' });
        secondRef.current?.scrollIntoView({ behavior: 'auto', block: 'center' });
      }
    }, 10);
    return () => clearTimeout(timeoutId);
  }, [open]);

  const display = useMemo(() => {
    return format(internalDate, use12HourFormat ? 'hh:mm a' : 'HH:mm');
  }, [internalDate, use12HourFormat]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={modal}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'flex w-full px-4 items-center justify-between cursor-pointer font-semibold border border-black/5 dark:border-white/10 rounded-2xl text-sm shadow-xs bg-black/[0.03] dark:bg-white/[0.05] transition-all hover:bg-black/[0.05] dark:hover:bg-white/[0.08] focus:border-[#0d3542] dark:focus:border-[#f5a81c] outline-none group',
            disabled && 'opacity-50 cursor-not-allowed',
            hasError && 'border-destructive',
            className
          )}
          disabled={disabled}
        >
          <span className="truncate group-hover:translate-x-0.5 transition-transform">{display}</span>
          <Clock className="ml-2 size-4 opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 z-[100001] border-0 bg-transparent shadow-none" side="top" align="start">
        <div className="flex flex-col p-1.5 bg-white/95 dark:bg-[#0d1117]/95 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden">
          <div className="flex h-64">
            <ScrollArea className="h-full grow border-r border-black/5 dark:border-white/5">
              <div className="flex flex-col p-1">
                {hours.map((v) => (
                  <div ref={v.value === hour ? hourRef : undefined} key={v.value}>
                    <TimeItem
                      option={v}
                      selected={v.value === hour}
                      onSelect={(opt) => updateTime(opt.value, minute, second, ampm)}
                      disabled={v.disabled}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
            <ScrollArea className="h-full grow border-r border-black/5 dark:border-white/5">
              <div className="flex flex-col p-1">
                {minutes.map((v) => (
                  <div ref={v.value === minute ? minuteRef : undefined} key={v.value}>
                    <TimeItem
                      option={v}
                      selected={v.value === minute}
                      onSelect={(opt) => updateTime(hour, opt.value, second, ampm)}
                      disabled={v.disabled}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
            {use12HourFormat && (
              <ScrollArea className="h-full w-20">
                <div className="flex flex-col p-1 gap-1">
                  {ampmOptions.map((v) => (
                    <TimeItem
                      key={v.value}
                      option={v}
                      selected={v.value === ampm}
                      onSelect={(opt) => updateTime(hour, minute, second, opt.value)}
                      disabled={v.disabled}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
          <div className="p-3 border-t border-black/5 dark:border-white/5 flex justify-end bg-black/[0.01] dark:bg-white/[0.01]">
             <Button 
                variant="ghost"
                size="sm" 
                onClick={() => setOpen(false)} 
                className="rounded-full px-6 text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#0d3542] hover:text-white dark:hover:bg-[#f5a81c] dark:hover:text-black transition-all"
             >
                Confirm
             </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const TimeItem = ({
  option,
  selected,
  onSelect,
  className,
  disabled,
}: {
  option: SimpleTimeOption;
  selected: boolean;
  onSelect: (option: SimpleTimeOption) => void;
  className?: string;
  disabled?: boolean;
}) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        'group flex items-center justify-start h-9 w-full px-3 rounded-full transition-all duration-200',
        selected 
          ? 'bg-[#0d3542] text-white dark:bg-[#f5a81c] dark:text-black shadow-lg shadow-[#0d3542]/10 dark:shadow-[#f5a81c]/10 scale-[1.02]' 
          : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white',
        className
      )}
      onClick={() => onSelect(option)}
      disabled={disabled}
    >
      <div className={cn(
        "flex items-center justify-center size-5 rounded-full transition-all",
        selected ? "bg-white/20" : "bg-transparent"
      )}>
        {selected && <CheckIcon className="size-3 stroke-[3]" />}
      </div>
      <span className={cn(
        "ms-2.5 text-[13px] font-bold tabular-nums tracking-tight",
        selected ? "opacity-100" : "opacity-70 group-hover:opacity-100"
      )}>
        {option.label}
      </span>
    </Button>
  );
};

interface BuildTimeOptions {
  use12HourFormat?: boolean;
  value: Date;
  formatStr: string;
  hour: number;
  minute: number;
  second: number;
  ampm: number;
}

function buildTime(options: BuildTimeOptions) {
  const { use12HourFormat, value, hour, minute, second, ampm } = options;
  let date = new Date(value);

  if (use12HourFormat) {
    // Convert 12h to 24h for date-fns setHours
    const hour24 = (hour % 12) + ampm * 12;
    date = setHours(date, hour24);
  } else {
    date = setHours(date, hour);
  }

  date = setMinutes(date, minute);
  date = setSeconds(date, second);
  date = setMilliseconds(date, 0);

  return date;
}
