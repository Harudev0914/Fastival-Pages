import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/ko'; // 한국어 로캘 추가
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './DashboardCalendar.css';

moment.locale('ko'); // 한국어로 설정
const localizer = momentLocalizer(moment);

const DashboardHome: React.FC = () => {
  const [stats] = useState({ inquiry: { ans: 0, nonAns: 0 }, rental: { ans: 0, nonAns: 0 } });
  const [events] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  const navigate = (direction: 'PREV' | 'NEXT') => {
    setCurrentDate(prev => moment(prev).add(direction === 'NEXT' ? 1 : -1, 'month').toDate());
  };

  const cardStyle = { padding: '20px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: 'rgba(0, 0, 0, 0.02) 0px 4px 12px' };
  const statValueStyle = { fontSize: '1.5rem', fontWeight: 600, color: '#1e293b', margin: '10px 0 0 0' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '0 20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {[ { title: '시공 문의', label: '답변', val: stats.inquiry.ans },
           { title: '시공 문의', label: '미답변', val: stats.inquiry.nonAns },
           { title: '렌탈 문의', label: '답변', val: stats.rental.ans },
           { title: '렌탈 문의', label: '미답변', val: stats.rental.nonAns }
        ].map(item => (
            <div key={`${item.title}-${item.label}`} style={cardStyle}>
                <h3 style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{item.title} - {item.label}</h3>
                <p style={statValueStyle}>{item.val}</p>
            </div>
        ))}
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarIcon size={18} color="#008b8b" /><h3 style={{ margin: 0, fontSize: '1rem' }}>일정 캘린더</h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button onClick={() => navigate('PREV')} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', cursor: 'pointer', background: 'white' }}><ChevronLeft size={16}/></button>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, minWidth: '60px', textAlign: 'center' }}>{moment(currentDate).format('M월')}</h3>
                <button onClick={() => navigate('NEXT')} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', cursor: 'pointer', background: 'white' }}><ChevronRight size={16}/></button>
            </div>
            <button onClick={() => setCurrentDate(new Date())} style={{ padding: '10px 24px', borderRadius: '6px', border: 'none', backgroundColor: '#008b8b', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>오늘</button>
          </div>
        </div>
        <Calendar
          localizer={localizer}
          events={events}
          date={currentDate}
          onNavigate={(newDate: Date) => setCurrentDate(newDate)}
          toolbar={false}
          style={{ height: 450 }}
        />
      </div>
    </div>
  );
};

export default DashboardHome;
