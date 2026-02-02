# EliMed Auto Export Setup

## Setting up Windows Task Scheduler for Daily 11 PM Export

### Prerequisites
1. Backend server must be running continuously
2. Authentication token must be configured

### Step 1: Get Your Authentication Token

1. Login to EliMed application
2. Open browser DevTools (F12)
3. Go to Console and run:
   ```javascript
   localStorage.getItem('token')
   ```
4. Copy the token value (without quotes)
5. Create a file: `C:\Users\pc\Desktop\EliMed\backend\.auth-token`
6. Paste your token in this file and save

### Step 2: Create Windows Task Scheduler Task

1. **Open Task Scheduler:**
   - Press `Windows + R`
   - Type `taskschd.msc` and press Enter

2. **Create New Task:**
   - Click "Create Task" (not "Create Basic Task")
   
3. **General Tab:**
   - Name: `EliMed Daily Export`
   - Description: `Automatically generates Excel export at 11 PM daily`
   - Select: "Run whether user is logged on or not"
   - Check: "Run with highest privileges"

4. **Triggers Tab:**
   - Click "New"
   - Begin the task: "On a schedule"
   - Settings: "Daily"
   - Start: Choose today's date at 11:00 PM (23:00)
   - Recur every: 1 day
   - Check: "Enabled"
   - Advanced settings:
     - Check "If task is missed, run as soon as possible"
   - Click OK

5. **Actions Tab:**
   - Click "New"
   - Action: "Start a program"
   - Program/script: `node`
   - Add arguments: `"C:\Users\pc\Desktop\EliMed\backend\scheduled-export.js"`
   - Start in: `C:\Users\pc\Desktop\EliMed\backend`
   - Click OK

6. **Conditions Tab:**
   - Uncheck: "Start the task only if the computer is on AC power"
   - Check: "Wake the computer to run this task" (if you want it to wake from sleep)

7. **Settings Tab:**
   - Check: "Run task as soon as possible after a scheduled start is missed"
   - Check: "If the task fails, restart every: 5 minutes" and "Attempt to restart up to: 3 times"
   - Check: "Stop the task if it runs longer than: 1 hour"

8. **Save Task:**
   - Click OK
   - Enter your Windows password when prompted

### Step 3: Test the Task

To test without waiting until 11 PM:

1. In Task Scheduler, find "EliMed Daily Export"
2. Right-click and select "Run"
3. Check the "Last Run Result" column (should show 0x0 for success)
4. Verify the export file was created in: `C:\Users\pc\Desktop\EliMed\backend\exports`

### Alternative: Manual Testing

You can also test by running:
```bash
cd C:\Users\pc\Desktop\EliMed\backend
node scheduled-export.js
```

### Troubleshooting

**Task failed to run:**
- Ensure backend server is running on `http://localhost:4000`
- Check the `.auth-token` file exists and contains a valid token
- Review Task Scheduler history (View > Show Hidden Tasks, then enable history)

**Token expired:**
- Login to EliMed again
- Get a new token using DevTools
- Update the `.auth-token` file

**Export not found:**
- Check the `backend/exports` folder
- Review the Task Scheduler last run time and result

### Export Files Location

All exports are saved to:
```
C:\Users\pc\Desktop\EliMed\backend\exports\
```

Files are named: `EliMed_Export_YYYY-MM-DD_HHmmss.xlsx`

Example: `EliMed_Export_2026-02-02_230001.xlsx`

### What's Included in the Export

The Excel file contains 6 sheets:

1. **Products** - All products with stock levels
2. **Current Inventory** - All lots with quantities and values
3. **Sales Summary** - Last 30 days of sales
4. **Low Stock Alert** - Products below reorder point
5. **Expiring Soon** - Products expiring in next 90 days
6. **Store Information** - Store details and statistics

### Notes

- The task will run even if the system was off at 11 PM (when it next starts)
- Exports are saved automatically to the exports folder
- You can access and download exports from the Settings page
- Old exports are not automatically deleted - manage them manually or through the app
