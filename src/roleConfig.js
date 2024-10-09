import CheckInSystem from './CheckInSystem';
import RSSFeedDisplay from './RSSFeedDisplay';
import GoogleCalendar from './GoogleCalendar';
import ListerApp from './lister/lister';
import PasswordDisplay from './PasswordDisplay';
import CashFlowSuperApp from './cashFlow/cashFlow';
import HistoryComponent from './HistoryComponent';
import MiniTaskManager from './MiniTaskManager';
import Approvals from './Approvals';
import Register from './Register';
import EventManager from './eventManager/EventManager';
import StoreSearch from './StoreAndCardsSearch';
import QrCodeGenerator from './QrCodeGenerator';
import LoyaltyDashboard from './LoyaltyDashboard';
import ScheduleForm from './ScheduleForm';

const roleConfig = {
  Worker: [
    { component: CheckInSystem, gridProps: { xs: 12, md: 6 }, name: 'CheckInSystem' },
    { component: HistoryComponent, gridProps: { xs: 12, md: 6 }, name: 'WorkHistory' },
    { component: GoogleCalendar, gridProps: { xs: 12, md: 6 }, name: 'GoogleCalendar' },
    { component: RSSFeedDisplay, gridProps: { xs: 12, md: 6 }, name: 'RSSFeedDisplay' },
    { component: PasswordDisplay, gridProps: { xs: 12, sm: 6, md: 5 }, name: 'PasswordDisplay' },
    { component: MiniTaskManager, gridProps: { xs: 12, sm: 6, md: 5 }, name: 'TaskManager' },
    { component: ListerApp, gridProps: { xs: 6, md: 3 }, name: 'Lister' },
  ],
  Admin: [
    { component: CheckInSystem, gridProps: { xs: 12, md: 6 }, name: 'CheckInSystem' },
    { component: HistoryComponent, gridProps: { xs: 12, md: 6 }, name: 'WorkHistory' },
    { component: GoogleCalendar, gridProps: { xs: 12, md: 6 }, name: 'GoogleCalendar' },
    { component: RSSFeedDisplay, gridProps: { xs: 12, md: 6 }, name: 'RSSFeedDisplay' },
    { component: PasswordDisplay, gridProps: { xs: 12, sm: 6, md: 5 }, name: 'PasswordDisplay' },
    { component: MiniTaskManager, gridProps: { xs: 12, sm: 6, md: 5 }, name: 'TaskManager' },
    { component: ListerApp, gridProps: { xs: 6, md: 3 }, name: 'Lister' },
    { component: CashFlowSuperApp, gridProps: { xs: 6, md: 3 }, name: 'Accounting' },
    { component: Approvals, gridProps: { xs: 6, md: 3 }, name: 'Approvals' },
    { component: Register, gridProps: { xs: 6, md: 3 }, name: 'Register' },
    { component: EventManager, gridProps: { xs: 6, md: 3 }, name: 'EventManager' },
    { component: StoreSearch, gridProps: { xs: 6, md: 3 }, name: 'StoreSearch' },
    { component: QrCodeGenerator, gridProps: { xs: 6, md: 3 }, name: 'QrCodeGenerator' },
    { component: LoyaltyDashboard, gridProps: { xs: 6, md: 3 }, name: 'LoyaltyDashboard' },
    { component: ScheduleForm, gridProps: { xs: 6, md: 3 }, name: 'ScheduleForm' },
  ],
  'Store Manager': [
    { component: CheckInSystem, gridProps: { xs: 12, md: 6 }, name: 'CheckInSystem' },
    { component: HistoryComponent, gridProps: { xs: 12, md: 6 }, name: 'WorkHistory' },
    { component: GoogleCalendar, gridProps: { xs: 12, md: 6 }, name: 'GoogleCalendar' },
    { component: RSSFeedDisplay, gridProps: { xs: 12, md: 6 }, name: 'RSSFeedDisplay' },
    { component: PasswordDisplay, gridProps: { xs: 12, sm: 6, md: 5 }, name: 'PasswordDisplay' },
    { component: MiniTaskManager, gridProps: { xs: 12, sm: 6, md: 5 }, name: 'TaskManager' },
    { component: ListerApp, gridProps: { xs: 6, md: 3 }, name: 'Lister' },
    { component: Register, gridProps: { xs: 6, md: 3 }, name: 'Register' },
    { component: EventManager, gridProps: { xs: 6, md: 3 }, name: 'EventManager' },
  ],
  'Cashier': [
    { component: CheckInSystem, gridProps: { xs: 12, md: 6 }, name: 'CheckInSystem' },
    { component: HistoryComponent, gridProps: { xs: 12, md: 6 }, name: 'WorkHistory' },
    { component: GoogleCalendar, gridProps: { xs: 12, md: 6 }, name: 'GoogleCalendar' },
    { component: RSSFeedDisplay, gridProps: { xs: 12, md: 6 }, name: 'RSSFeedDisplay' },
    { component: PasswordDisplay, gridProps: { xs: 12, sm: 6, md: 5 }, name: 'PasswordDisplay' },
    { component: MiniTaskManager, gridProps: { xs: 12, sm: 6, md: 5 }, name: 'TaskManager' },
    { component: ListerApp, gridProps: { xs: 6, md: 3 }, name: 'Lister' },
    { component: Register, gridProps: { xs: 6, md: 3 }, name: 'Register' },
  ],
};

export default roleConfig;