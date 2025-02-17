export const guidesConfig = {
    TaskManager: {
        title: "Task Manager Guide",
        content: "The Task Manager helps you organize and track tasks and subtasks. Each task can contain multiple subtasks with detailed information and status tracking.",
        sections: [
        {
            title: "Main Dashboard",
            content: "The main dashboard displays all your tasks as cards with color-coding based on completion status.",
            subsections: [
            {
                title: "Task Cards",
                items: [
                {
                    title: "Color Coding",
                    description: "Red (<33% complete), Orange (33-66% complete), Green (>66% complete)"
                },
                {
                    title: "Task Overview",
                    description: "Each card shows the task name and number of subtasks"
                },
                {
                    title: "Person Filter",
                    description: "Use the dropdown at the top to filter tasks by person responsible"
                }
                ]
            }
            ]
        },
        {
            title: "Managing Tasks",
            content: "Create and manage main tasks from the dashboard",
            subsections: [
            {
                title: "Task Operations",
                items: [
                {
                    title: "Creating Tasks",
                    description: "Use the text field at the bottom of the dashboard to create a new task"
                },
                {
                    title: "Deleting Tasks",
                    description: "Click the '✖' button on any task card to delete the entire task and its subtasks"
                },
                {
                    title: "Opening Tasks",
                    description: "Click on any task name to open the detailed subtask view"
                }
                ]
            }
            ]
        },
        {
            title: "Managing Subtasks",
            content: "Each task can have multiple subtasks with detailed tracking. You'll have to create a subtask with its title, before being able to edit anything else",
            subsections: [
            {
                title: "Subtask Features",
                items: [
                {
                    title: "Creating Subtasks",
                    description: "Use the 'New subtask name' field at the top of the task modal"
                },
                {
                    title: "Status Options",
                    description: "Choose from: Upcoming ⏳, Ongoing ▶️, Completed ✅, or Abandoned ❌"
                },
                {
                    title: "Subtask Details",
                    description: "Each subtask includes name, details, status, person responsible, and due date"
                }
                ]
            },
            {
                title: "Editing Subtasks",
                items: [
                {
                    title: "Edit Mode",
                    description: "Click 'Edit' to modify any subtask's details"
                },
                {
                    title: "Saving Changes",
                    description: "Click 'Save Changes' to update the subtask, or 'Cancel' to discard changes"
                },
                {
                    title: "Deleting Subtasks",
                    description: "Use the 'Delete' button to remove individual subtasks"
                }
                ]
            }
            ]
        }
        ]
    },
    Lister: {
        title: "Card Lister Guide",
        content: "The Card Lister helps you manage card inventory, process orders, and track card updates across different trading card games (TCGs).",
        sections: [
        {
            title: "Getting Started",
            content: "First select your TCG from the game chips at the top of the screen.",
            subsections: [
            {
                title: "Search Options",
                items: [
                {
                    title: "Set Search",
                    description: "Enter a 3-4 character set code (e.g., 'DMU') to view all cards from that set"
                },
                {
                    title: "Card Search",
                    description: "Enter a specific card code (format: XXX-000) to search for individual cards"
                },
                {
                    title: "Location Search",
                    description: "Enter a location (e.g., 'BROWN BINDER' or 'BOX') to find all cards in that location"
                }
                ]
            }
            ]
        },
        {
            title: "Managing Cards",
            content: "Modify card quantities and prices, duplicate entries, or remove cards from inventory.",
            subsections: [
            {
                title: "Card Actions",
                items: [
                {
                    title: "Modifying Quantities",
                    description: "Use the + and - buttons or directly input numbers to adjust card quantities"
                },
                {
                    title: "Price Adjustments",
                    description: "Admin and Cashier roles can modify card prices directly in the price field"
                },
                {
                    title: "Duplicating Cards",
                    description: "Use the duplicate button to create a new entry for the same card with different conditions or prices"
                },
                {
                    title: "Removing Cards",
                    description: "Delete button removes the card from your current selection"
                }
                ]
            }
            ]
        },
        {
            title: "Tracking Updates",
            content: "Monitor card updates and processing status through the tracker panel.",
            subsections: [
            {
                title: "Tracker Panel Features",
                items: [
                {
                    title: "Active Updates",
                    description: "Shows current pending changes and recent update batches"
                },
                {
                    title: "Batch Status",
                    description: "View detailed results of processed batches including successes and any errors"
                },
                {
                    title: "High Price Alerts",
                    description: "Warns about cards with unusually high prices that need review, and up to be changed. Only available for select workers"
                }
                ]
            }
            ]
        },
        {
            title: "Order Management",
            content: "Access and manage orders through the Orders button in the search panel. This is currently not active yet",
            subsections: [
            {
                title: "Submitting Changes",
                items: [
                {
                    title: "Review Changes",
                    description: "The submit button shows the total number of cards being modified"
                },
                {
                    title: "Processing Results",
                    description: "View detailed results of your submissions including successes and any errors"
                }
                ]
            }
            ]
        }
        ]
    },
    EventManager: {
        title: "Event Manager Guide",
        content: "The Event Manager allows you to create, manage, and track events for different trading card games. It includes features for managing attendees and event details.",
        sections: [
        {
            title: "Creating Events",
            content: "Create new events with detailed information and scheduling.",
            subsections: [
            {
                title: "Required Event Information",
                items: [
                {
                    title: "Basic Details",
                    description: "Enter event name, select start/end dates and times, TCG type, and price"
                },
                {
                    title: "Additional Information",
                    description: "Add event description, message to buyers, reader info, and event image/poster"
                },
                {
                    title: "Time Management",
                    description: "Specify setup time, start time, and take-down time for event organization"
                }
                ]
            }
            ]
        },
        {
            title: "Managing Events",
            content: "View and manage upcoming and past events through separate tabs.",
            subsections: [
            {
                title: "Event List Features",
                items: [
                {
                    title: "Upcoming Events",
                    description: "View and edit future events, including attendee management and event details"
                },
                {
                    title: "Past Events",
                    description: "Access historical event data and attendance records"
                },
                {
                    title: "Event Actions",
                    description: "Delete upcoming events, view event details, and manage attendee lists"
                }
                ]
            }
            ]
        },
        {
            title: "Attendee Management",
            content: "Track and update attendee information for each event.",
            subsections: [
            {
                title: "Attendee Features",
                items: [
                {
                    title: "Status Tracking",
                    description: "Update attendee status: Paid, Pending, or Sent"
                },
                {
                    title: "Information Editing",
                    description: "Modify attendee names and details directly from the event dialog"
                },
                {
                    title: "Attendance Lists",
                    description: "View complete attendee lists with current status for each event"
                }
                ]
            }
            ]
        },
        {
            title: "Event Details",
            content: "Access and modify comprehensive event information.",
            subsections: [
            {
                title: "Editing Capabilities",
                items: [
                {
                    title: "Event Modification",
                    description: "Update event details including dates, prices, and descriptions"
                },
                {
                    title: "Image Management",
                    description: "Change event posters and promotional images"
                },
                {
                    title: "Financial Details",
                    description: "Manage pricing and artist fees for each event"
                }
                ]
            }
            ]
        }
        ]
    }
  };