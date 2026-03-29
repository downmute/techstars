export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO 8601
  end: string;
  location?: string;
  description?: string;
}

// Returns upcoming mock events relative to current time
export function getMockEvents(withinHours = 48): CalendarEvent[] {
  const now = new Date();

  // Build dates relative to today
  function today(hour: number, minute = 0) {
    const d = new Date(now);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  }

  function tomorrow(hour: number, minute = 0) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  }

  const events: CalendarEvent[] = [
    {
      id: '1',
      title: "Doctor's appointment",
      start: tomorrow(10, 0),
      end: tomorrow(10, 30),
      location: 'Sunrise Medical Center, 123 Oak Street',
    },
    {
      id: '2',
      title: 'Sarah visiting',
      start: tomorrow(14, 0),
      end: tomorrow(17, 0),
      description: "Daughter Sarah is coming for afternoon tea",
    },
    {
      id: '3',
      title: 'Book club',
      start: tomorrow(19, 0),
      end: tomorrow(21, 0),
      location: 'Community Center Room B',
    },
    {
      id: '4',
      title: 'Morning walk with neighbors',
      start: today(8, 30),
      end: today(9, 15),
      location: 'Riverside Park',
    },
    {
      id: '5',
      title: 'Pharmacy pickup',
      start: tomorrow(11, 0),
      end: tomorrow(11, 30),
      location: 'CVS Pharmacy on Main Street',
    },
  ];

  const cutoff = new Date(now.getTime() + withinHours * 60 * 60 * 1000);
  return events
    .filter((e) => new Date(e.start) <= cutoff && new Date(e.end) >= now)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 5);
}
