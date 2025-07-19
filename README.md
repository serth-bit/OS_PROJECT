# OS_PROJECT
ARONG - MUNOZ_PROJECT 01 - CPU SCHEDULING VISUALIZATION 

Project Overview

This project is a CPU Scheduling Visualizer developed using HTML, CSS, and JavaScript. It simulates and visually demonstrates how different CPU scheduling algorithms manage processes over time. The tool is designed with an interactive interface that allows users to select an algorithm, manually input or generate processes, and see both a Gantt chart and detailed performance metrics as output.

The main goal is to help students and learners understand how each scheduling algorithm works in terms of process execution, turnaround time, waiting time, and response time. It also highlights how different algorithms behave in scenarios with multiple processes, including preemptive and non-preemptive behavior.

To make the simulation more intuitive, we’ve implemented color-coded Gantt chart blocks, queue indicators (for MLFQ), and a simple animation that shows processes being executed one after another in real-time.


How to Run the Simulation:

1. Open the Project:

Open the index.html file using any modern web browser (e.g., Chrome, Edge, Firefox). No additional installations are required.

3. Select a Scheduling Algorithm:

Use the dropdown menu to choose one of the available algorithms:
First Come First Serve (FCFS)
Shortest Job First (SJF)
Shortest Remaining Time First (SRTF)
Round Robin
Multilevel Feedback Queue (MLFQ)

4. Input Process Data:
   
You have two options:
Manual Input: Enter the number of processes and click "Manual Input" to fill in arrival and burst times.
Generate Random Processes: Enter the number of processes and click "Generate Random Processes" to auto-fill values.

5. Set Quantum or Time Slices (if needed):
   
For Round Robin, enter the Time Quantum.
For MLFQ, enter the Time Slices for each queue level (Q0 to Q3). These determine how long a process can run at each level.

6. Run the Scheduler:
   
Click the "Run Scheduler" button.
The Gantt chart will animate each block based on the process execution timeline.
Below the chart, you'll see:
A process metrics table (with turnaround, waiting, and response times).
Averages for each of these values.

7. Reset to Try Again:
Click "Clear All" to remove all inputs and outputs and start fresh.

**First Come First Serve (FCFS)**  
This algorithm schedules processes in the order they arrive. It is non-preemptive.
<img width="852" height="955" alt="image" src="https://github.com/user-attachments/assets/4efcab3f-cf15-4642-a7d8-266abc35f3a3" />

**Shortest Job First (SJF)**  
This selects the process with the smallest burst time among those that have arrived. It is non-preemptive.
<img width="858" height="997" alt="image" src="https://github.com/user-attachments/assets/3fa6c227-259b-41cd-9a93-b8f681d547d6" />

**Round Robin (RR)**  
Each process is given a fixed time quantum. If a process does not finish in its quantum, it is moved to the back of the queue. It is preemptive.

<img width="759" height="1011" alt="image" src="https://github.com/user-attachments/assets/c5ab111b-be13-4ab4-98e2-f977c88f904d" />

**Multilevel Feedback Queue (MLFQ)**  
This algorithm uses multiple queues with different priorities and time quantums. Processes move to lower priority queues if they use up their time slice.

<img width="597" height="998" alt="image" src="https://github.com/user-attachments/assets/8fa1c012-ff6d-47f4-808f-4980ce64a81e" />

**Shortest Remaining Time First (SRTF)**  
This is the preemptive version of SJF. The scheduler always picks the process with the shortest remaining burst time.

<img width="768" height="1037" alt="image" src="https://github.com/user-attachments/assets/167f95bc-9187-4382-abfb-16257248146f" />

Known Bugs or Limitations

- When the browser window is small, the Gantt chart may overflow horizontally.
- No visual display for idle CPU time when no process is available.
- Inputs only accept integers; decimal values are not supported.
- The export to Word feature only exports text and not the chart visuals.
- Limited error handling for very large input sizes.


## Member Contributions

**Arong, Seth Michael**
- Implemented the scheduling logic for FCFS, SJF, and SRTF
- Designed the HTML and CSS layout for the user interface
- Developed the export-to-Word feature for recording output results
- Wrote the first draft of the README and algorithm documentation
- Tested the application with different sets of input

**Muñoz, Kierthneil**
- Implemented the Round Robin and Multilevel Feedback Queue algorithms
- Debugged the logic for Gantt chart display and idle CPU handling
- Improved user input validation and process tracking
- Styled and refined the Gantt chart and metrics tables
- Helped clean up the code structure and added missing features

