import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, Clock, BookOpen, GraduationCap, Trash2, AlertTriangle } from "lucide-react";
import { soundManager } from "@/lib/sounds";
import { format, isToday, isTomorrow, isPast, differenceInDays } from "date-fns";

interface StudyEvent {
  id: string;
  title: string;
  type: 'class' | 'exam' | 'assignment' | 'study';
  date: string;
  time: string;
  subject: string;
  completed: boolean;
}

const EVENT_COLORS = {
  class: 'secondary',
  exam: 'destructive',
  assignment: 'gold',
  study: 'accent',
};

const EVENT_ICONS = {
  class: <GraduationCap className="w-4 h-4" />,
  exam: <AlertTriangle className="w-4 h-4" />,
  assignment: <BookOpen className="w-4 h-4" />,
  study: <Clock className="w-4 h-4" />,
};

type EventType = 'class' | 'exam' | 'assignment' | 'study';

export const StudySchedule = () => {
  const [events, setEvents] = useState<StudyEvent[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<{
    title: string;
    type: EventType;
    date: string;
    time: string;
    subject: string;
  }>({
    title: '',
    type: 'class',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '09:00',
    subject: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('studySchedule');
    if (saved) {
      setEvents(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem('studySchedule', JSON.stringify(events));
    }
  }, [events]);

  const addEvent = () => {
    if (!newEvent.title.trim()) return;
    
    soundManager.playClick();
    const event: StudyEvent = {
      id: Date.now().toString(),
      ...newEvent,
      completed: false,
    };
    
    setEvents([...events, event].sort((a, b) => 
      new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime()
    ));
    setNewEvent({
      title: '',
      type: 'class',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '09:00',
      subject: '',
    });
    setDialogOpen(false);
  };

  const toggleEvent = (eventId: string) => {
    soundManager.playTaskComplete();
    setEvents(events.map(e => 
      e.id === eventId ? { ...e, completed: !e.completed } : e
    ));
  };

  const deleteEvent = (eventId: string) => {
    soundManager.playClick();
    setEvents(events.filter(e => e.id !== eventId));
  };

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    const days = differenceInDays(date, new Date());
    if (days < 0) return 'Overdue';
    if (days < 7) return `In ${days} days`;
    return format(date, 'MMM dd');
  };

  const upcomingEvents = events.filter(e => !e.completed).slice(0, 6);
  const overdueCount = events.filter(e => !e.completed && isPast(new Date(e.date))).length;

  return (
    <Card className="card-anime border-secondary/30 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-game text-lg flex items-center gap-2 text-secondary">
            <Calendar className="w-5 h-5 text-secondary" />
            QUEST BOARD
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost" className="text-secondary hover:bg-secondary/10">
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-secondary/30">
              <DialogHeader>
                <DialogTitle className="font-game text-secondary">New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Event title..."
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="font-ui bg-muted/30 border-secondary/30"
                />
                <Input
                  placeholder="Subject..."
                  value={newEvent.subject}
                  onChange={(e) => setNewEvent({ ...newEvent, subject: e.target.value })}
                  className="font-ui bg-muted/30 border-secondary/30"
                />
                <Select
                  value={newEvent.type}
                  onValueChange={(value: string) => 
                    setNewEvent({ ...newEvent, type: value as EventType })
                  }
                >
                  <SelectTrigger className="bg-muted/30 border-secondary/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="class">Class</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="study">Study Session</SelectItem>
                  </SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="font-ui bg-muted/30 border-secondary/30"
                  />
                  <Input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="font-ui bg-muted/30 border-secondary/30"
                  />
                </div>
                <Button onClick={addEvent} className="w-full bg-secondary hover:bg-secondary/90">
                  Add Event
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Stats */}
        <div className="flex gap-2">
          <div className="flex-1 p-2 rounded-lg bg-secondary/10 text-center">
            <span className="font-game text-lg text-secondary">{upcomingEvents.length}</span>
            <p className="text-xs text-muted-foreground font-ui">Upcoming</p>
          </div>
          {overdueCount > 0 && (
            <div className="flex-1 p-2 rounded-lg bg-destructive/10 text-center">
              <span className="font-game text-lg text-destructive">{overdueCount}</span>
              <p className="text-xs text-muted-foreground font-ui">Overdue</p>
            </div>
          )}
        </div>

        {/* Events List */}
        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
          {upcomingEvents.map((event) => {
            const color = EVENT_COLORS[event.type];
            const isOverdue = isPast(new Date(event.date)) && !event.completed;
            
            return (
              <div
                key={event.id}
                className={`p-3 rounded-lg border transition-all group ${
                  event.completed 
                    ? 'bg-muted/20 border-border opacity-50' 
                    : isOverdue 
                      ? 'bg-destructive/10 border-destructive/40 animate-glow-pulse'
                      : `bg-${color}/10 border-${color}/30`
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-${color}/20 text-${color}`}>
                    {EVENT_ICONS[event.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-ui font-medium truncate ${event.completed ? 'line-through' : ''}`}>
                      {event.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span className={`px-2 py-0.5 rounded-full bg-${color}/20 text-${color}`}>
                        {getDateLabel(event.date)}
                      </span>
                      <span>{event.time}</span>
                      {event.subject && <span>• {event.subject}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleEvent(event.id)}
                      className={`text-${color} hover:bg-${color}/10`}
                    >
                      {event.completed ? 'Undo' : 'Done'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteEvent(event.id)}
                      className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {events.length === 0 && (
          <div className="text-center py-8 text-muted-foreground font-ui">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No events scheduled. Add your first quest!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
