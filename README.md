# ShiftSync – Supervisor Staffing App

## Project Overview
ShiftSync is a retail staffing web application developed as part of the CS 422 Group 4 project. It is a static prototype built using HTML, CSS, and JavaScript, designed to simulate a supervisor managing understaffed departments. The app allows supervisors to find trained employees to cover open shifts in a retail environment.

### Key Features
1. **Lock Already-Accepted Employees Out of Future Requests**
   - Employees who have already accepted a shift are locked and cannot be selected for future requests.
   - This ensures that supervisors do not accidentally assign the same employee to multiple shifts.

2. **Cap Selection to the Number of Open Positions**
   - Supervisors can only select the exact number of employees required to fill the open positions.
   - Once the cap is reached, other employees are temporarily locked out until the cap is reduced.

3. **Professional UI Redesign with Stat Cards and Charts**
   - A modern, professional dashboard with:
     - KPI stat cards for Staff On Duty, Open Positions, Requests Sent, and Coverage Rate.
     - A donut chart showing department coverage.
     - A bar chart displaying staffing levels throughout the week.
   - Dynamic updates to charts and stats based on user actions.

## Project Structure
```
ShiftSync/
├── index.html   # Main HTML file for the app
├── style.css    # Stylesheet for the app
├── script.js    # JavaScript logic for the app
└── README.md    # Project documentation
```

## How to Run the App
1. Clone or download the repository to your local machine.
2. Open the `index.html` file in any modern web browser.
3. Interact with the app to manage staffing for the Checkout department.

## How It Works
1. **Dashboard**: View the current staffing status, including open positions, staff on duty, and coverage rate.
2. **Employee Selection**: Select trained and available employees to cover open positions.
3. **Confirm Request**: Review the selected employees and confirm the request.
4. **Employee Responses**: Simulate employee responses (accept or decline) and see the dashboard update in real time.
5. **Request More Employees**: If coverage is still incomplete, request additional employees.

## Team Members
- Bryan Dominguez
- Shreyas Katkoor
- Aditya Lnu

## Known Issues
- None reported.

## Future Improvements
- Add backend integration for real-time employee responses.
- Implement authentication for supervisors and employees.
- Enhance the UI with additional features like notifications and detailed analytics.

## License
This project is for educational purposes only and is not intended for production use.