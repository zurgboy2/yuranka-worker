import CheckInSystem from './CheckInSystem';
import RSSFeedDisplay from './RSSFeedDisplay';
import GoogleCalendar from './GoogleCalendar';
import ListerApp from './lister/lister';
import PasswordDisplay from './PasswordDisplay';
import CashFlowSuperApp from './cashFlow/cashFlow';
import HistoryComponent from './HistoryComponent';
import MiniTaskManager from './MiniTaskManager';

const roleConfig = {
  Worker: [
    { component: CheckInSystem, gridProps: { xs: 12, md: 6 }, name: 'CheckInSystem' },
    { component: HistoryComponent, gridProps: { xs: 12, md: 6 }, name: 'WorkHistory' },
    { component: GoogleCalendar, gridProps: { xs: 12, md: 6 }, name: 'GoogleCalendar' },
    { component: RSSFeedDisplay, gridProps: { xs: 12, md: 6 }, name: 'RSSFeedDisplay' },
    { component: ListerApp, gridProps: { xs: 6, md: 3 }, name: 'Lister' },
    { component: PasswordDisplay, gridProps: { xs: 12, sm: 6, md: 5 }, name: 'PasswordDisplay' },
    { component: MiniTaskManager, gridProps: { xs: 12, sm: 6, md: 5 }, name: 'TaskManager' },

  ],
  Admin: [
    { component: CheckInSystem, gridProps: { xs: 12, md: 6 }, name: 'CheckInSystem' },
    { component: HistoryComponent, gridProps: { xs: 12, md: 6 }, name: 'WorkHistory' },
    { component: GoogleCalendar, gridProps: { xs: 12, md: 6 }, name: 'GoogleCalendar' },
    { component: RSSFeedDisplay, gridProps: { xs: 12, md: 6 }, name: 'RSSFeedDisplay' },
    { component: ListerApp, gridProps: { xs: 6, md: 3 }, name: 'Lister' },
    { component: CashFlowSuperApp, gridProps: { xs: 6, md: 3 }, name: 'Accounting' },
    { component: PasswordDisplay, gridProps: { xs: 12, sm: 6, md: 5 }, name: 'PasswordDisplay' },
    { component: MiniTaskManager, gridProps: { xs: 12, sm: 6, md: 5 }, name: 'TaskManager' },
  ],
  'Store Manager': [
    { component: CheckInSystem, gridProps: { xs: 12, md: 6 }, name: 'CheckInSystem' },
    { component: HistoryComponent, gridProps: { xs: 12, md: 6 }, name: 'WorkHistory' },
    { component: GoogleCalendar, gridProps: { xs: 12, md: 6 }, name: 'GoogleCalendar' },
    { component: RSSFeedDisplay, gridProps: { xs: 12, md: 6 }, name: 'RSSFeedDisplay' },
    { component: ListerApp, gridProps: { xs: 6, md: 3 }, name: 'Lister' },
    { component: PasswordDisplay, gridProps: { xs: 12, sm: 6, md: 5 }, name: 'PasswordDisplay' },
    { component: MiniTaskManager, gridProps: { xs: 12, sm: 6, md: 5 }, name: 'TaskManager' },
  ],
};

export default roleConfig;