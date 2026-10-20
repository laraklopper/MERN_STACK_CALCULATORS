// dateFunctions.js
//-----------DATE FUNCTIONS-----------
// Function to specify the date format
export const dateDisplay = (dateString) => {
    const options = {
        day: '2-digit',// Display day as two digit
        month: '2-digit',// Display month as two digits
        year: 'numeric',// Display year as four digits
        timeZone: 'Africa/Johannesburg'// Set the timezone
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-GB', options);
}

// Function to get the current date in 'DD/MM/YYYY' format
export const currentDate = () => {
    const options = {
        day: '2-digit', // Display day as two digit
        month: '2-digit',  // Display month as two digits
        year: 'numeric',// Display year as four digits
        timeZone: 'Africa/Johannesburg'// Set the timezone
    };
    return new Intl.DateTimeFormat('en-GB', options).format(new Date());// Format the current date
};

//===========================================================================
// DISPLAYING A USER RECORD (Profile.js, UsersList.js)
//===========================================================================
/* Shown in place of any detail the user has not supplied (address line2 and
province are the only optional fields on the user schema) */
const NOT_PROVIDED = 'NOT PROVIDED'

// Fall back to a placeholder when a detail is missing or blank
export const orPlaceholder = (value) =>
  (typeof value === 'string' && value.trim()) || NOT_PROVIDED

/* Format a user's date as e.g. 01 March 2025. The shared formatter does the
parsing; the user records only differ in saying NOT PROVIDED for a date that is
missing, because a user without one has not given it rather than having a record
that cannot carry it. */
export const toUserDate = (value) => toLongDate(value, NOT_PROVIDED)
/* Function to format a date in words, e.g. '31 August 2025'. No time zone is
forced, so a date pinned to local midnight is shown as the day it names. */
export const toLongDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

//-----------TIME FUNCTIONS-----------
// Format time as hh:mm:ss
export const timeDisplay = (dateObj) => {
    return dateObj.toLocaleTimeString('en-GB', {
        hour: '2-digit',// Display hour as two digits
        minute: '2-digit',// Display minute as two digits
        second: '2-digit',// Display second as two digits
        hour12: false,// Use 24-hour format
        timeZone: 'Africa/Johannesburg'// Set the timezone
    });
};
