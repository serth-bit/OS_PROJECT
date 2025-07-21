        document.addEventListener("DOMContentLoaded", () => {
        const exportBtn = document.getElementById("exportBtn");
        const algorithmSelect = document.getElementById("algorithm");
        const quantumSettings = document.getElementById("quantum-settings");
        const mlfqSettings = document.getElementById("mlfq-settings");

        const manualInputBtn = document.getElementById("manualInputBtn");
        const generateBtn = document.getElementById("generateBtn");
        const numProcessesInput = document.getElementById("numProcesses");

        const processInputsDiv = document.getElementById("process-inputs");
        const runBtn = document.getElementById("runBtn");

        algorithmSelect.addEventListener("change", () => {
            const value = algorithmSelect.value;
            quantumSettings.style.display = (value === "rr") ? "block" : "none";
            mlfqSettings.style.display = (value === "mlfq") ? "block" : "none";
        });

        manualInputBtn.addEventListener("click", () => {
            const algorithm = algorithmSelect.value;
            const count = parseInt(numProcessesInput.value);
            if (!count || count < 1) {
            alert("Please enter a valid number of processes.");
            return;
            }
            generateManualInputs(count);
        });

        const resetBtn = document.getElementById("resetBtn");
        resetBtn.addEventListener("click", () => {
            document.getElementById("process-inputs").innerHTML = "";
            document.getElementById("ganttChart").innerHTML = "";
            document.getElementById("ganttTimes").innerHTML = "";
            document.getElementById("metricsTable").innerHTML = "";
            document.getElementById("averageMetrics").innerHTML = "";
            document.getElementById("messageBox").innerText = "";
        });
        
        generateBtn.addEventListener("click", () => {
            const count = parseInt(numProcessesInput.value);
            if (!count || count < 1) {
            alert("Please enter a valid number of processes.");
            return;
            }
            generateRandomInputs(count);
        });

        exportBtn.addEventListener("click", () => {
            const metricsTable = document.getElementById("metricsTable");
            const avgMetrics = document.getElementById("averageMetrics");
            const ganttDiv = document.getElementById("ganttChart");

            const content = `
        ==== CPU SCHEDULING RESULTS ====\n
        GANTT CHART (Visual Approximation):
        ${ganttDiv.innerText.replace(/\n/g, '')}

        PROCESS METRICS:
        ${metricsTable.innerText}

        AVERAGE METRICS:
        ${avgMetrics.innerText}
        `;

            const blob = new Blob([content], { type: "text/plain" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "cpu_scheduling_results.txt";
            a.click();
            URL.revokeObjectURL(url);
        });

        runBtn.addEventListener("click", () => {
            const processes = readProcessesFromInputs();
            const algorithm = algorithmSelect.value;

            if (!processes.length || processes.some(p => isNaN(p.arrivalTime) || isNaN(p.burstTime))) {
            alert("Please fill in all arrival and burst times correctly.");
            return;
            }

            if (algorithm === "fcfs") runFCFS(processes);
            else if (algorithm === "sjf") runSJF(processes);
            else if (algorithm === "srtf") runSRTF(processes);
            else if (algorithm === "rr") {
            const q = parseInt(document.getElementById("quantum").value);
            if (!q || q < 1) return alert("Invalid quantum");
            runRR(processes, q);
            } else if (algorithm === "mlfq") {
            const q0 = parseInt(document.getElementById("q0-quantum").value);
            const q1 = parseInt(document.getElementById("q1-quantum").value);
            const q2 = parseInt(document.getElementById("q2-quantum").value);
            const q3 = parseInt(document.getElementById("q3-quantum").value);
            if ([q0, q1, q2, q3].some(q => isNaN(q) || q < 1)) return alert("Fill in all MLFQ quantum values");
            runMLFQ(processes, [q0, q1, q2, q3]);
            } else {
            alert("Unknown algorithm selected.");
            }
        });

        function generateManualInputs(count) {
            processInputsDiv.innerHTML = "";
            for (let i = 0; i < count; i++) {
            const div = document.createElement("div");
            div.innerHTML = `
                <label>PID: <input type="number" value="${i + 1}" disabled></label>
                <label>Arrival Time: <input type="number" min="0" class="arrival"></label>
                <label>Burst Time: <input type="number" min="1" class="burst"></label>
            `;
            processInputsDiv.appendChild(div);
            }
        }

        function generateRandomInputs(count) {
            processInputsDiv.innerHTML = "";
            const usedArrivals = new Set();
            for (let i = 0; i < count; i++) {
            let randomArrival;
            do {
                randomArrival = Math.floor(Math.random() * (count * 1.5));
            } while (usedArrivals.has(randomArrival));
            usedArrivals.add(randomArrival);

            const randomBurst = Math.floor(Math.random() * 9) + 1;

            const div = document.createElement("div");
            div.innerHTML = `
                <label>PID: <input type="number" value="${i + 1}" disabled></label>
                <label>Arrival Time: <input type="number" class="arrival" value="${randomArrival}"></label>
                <label>Burst Time: <input type="number" class="burst" value="${randomBurst}"></label>
            `;
            processInputsDiv.appendChild(div);
            }
        }

        function readProcessesFromInputs() {
            const processDivs = processInputsDiv.querySelectorAll("div");
            const processes = [];
            processDivs.forEach((div, index) => {
            const arrivalInput = div.querySelector(".arrival");
            const burstInput = div.querySelector(".burst");
            const arrival = parseInt(arrivalInput?.value);
            const burst = parseInt(burstInput?.value);
            if (!isNaN(arrival) && !isNaN(burst)) {
                processes.push({ pid: index + 1, arrivalTime: arrival, burstTime: burst });
            }
            });
            return processes;
        }

        function runFCFS(p) {
            p.sort((a, b) => a.arrivalTime - b.arrivalTime);
            let time = 0, gantt = [], totalTAT = 0, totalWT = 0, totalRT = 0;
            for (let proc of p) {
            proc.startTime = Math.max(time, proc.arrivalTime);
            proc.completionTime = proc.startTime + proc.burstTime;
            proc.turnaroundTime = proc.completionTime - proc.arrivalTime;
            proc.waitingTime = proc.turnaroundTime - proc.burstTime;
            proc.responseTime = proc.startTime - proc.arrivalTime;
            gantt.push({ pid: proc.pid, start: proc.startTime, end: proc.completionTime });
            time = proc.completionTime;
            totalTAT += proc.turnaroundTime;
            totalWT += proc.waitingTime;
            totalRT += proc.responseTime;
            
            }
            let scheduledPIDs = new Set(gantt.map(g => g.pid));
if (scheduledPIDs.size !== p.length) {
  console.warn("Some processes did not run or are missing.");
}
            displayGanttChart(gantt);
            displayMetricsTable(p);
            displayAverages(p.length, totalTAT, totalWT, totalRT);
        }

        function runSJF(p) {
            let time = 0, done = 0, gantt = [], totalTAT = 0, totalWT = 0, totalRT = 0;
            const n = p.length, visited = Array(n).fill(false);
            while (done < n) {
            let idx = -1;
            for (let i = 0; i < n; i++) {
                if (!visited[i] && p[i].arrivalTime <= time) {
                if (idx === -1 || p[i].burstTime < p[idx].burstTime) idx = i;
                }
            }
            if (idx === -1 || !p.some(proc => proc.arrivalTime <= time && !visited[p.indexOf(proc)])) {
                time++;
                    continue;
                }
            let proc = p[idx];
            proc.startTime = time;
            proc.completionTime = time + proc.burstTime;
            proc.turnaroundTime = proc.completionTime - proc.arrivalTime;
            proc.waitingTime = proc.turnaroundTime - proc.burstTime;
            proc.responseTime = proc.startTime - proc.arrivalTime;
            gantt.push({ pid: proc.pid, start: proc.startTime, end: proc.completionTime });
            visited[idx] = true;
            done++;
            time = proc.completionTime;
            totalTAT += proc.turnaroundTime;
            totalWT += proc.waitingTime;
            totalRT += proc.responseTime;
            }
            let scheduledPIDs = new Set(gantt.map(g => g.pid));
if (scheduledPIDs.size !== p.length) {
  console.warn("Some processes did not run or are missing.");
}
            displayGanttChart(gantt);
            displayMetricsTable(p);
            displayAverages(n, totalTAT, totalWT, totalRT);
        }

        function runSRTF(p) {
            const n = p.length, gantt = [], remaining = p.map(proc => proc.burstTime);
            const visited = Array(n).fill(false);
            let time = 0, done = 0, totalTAT = 0, totalWT = 0, totalRT = 0, lastPid = -1;
            const firstStart = {}, startTime = Array(n).fill(-1);
            while (done < n) {
            let idx = -1;
            for (let i = 0; i < n; i++) {
                if (p[i].arrivalTime <= time && remaining[i] > 0) {
                if (idx === -1 || remaining[i] < remaining[idx]) idx = i;
                }
            }
            if (idx === -1 || !p.some(proc => proc.arrivalTime <= time && !visited[p.indexOf(proc)])) {
                    time++; // <- This keeps the simulation going
                            continue;
                    }
            if (startTime[idx] === -1) startTime[idx] = time;
            if (lastPid !== p[idx].pid) {
    // Close previous block
    if (gantt.length && gantt[gantt.length - 1].end === undefined) {
        gantt[gantt.length - 1].end = time;
    }
    // Start new block
    gantt.push({ pid: p[idx].pid, start: time });
    lastPid = p[idx].pid;
}
            remaining[idx]--;
            time++;
            if (remaining[idx] === 0) {
                p[idx].completionTime = time;
                p[idx].turnaroundTime = time - p[idx].arrivalTime;
                p[idx].waitingTime = p[idx].turnaroundTime - p[idx].burstTime;
                p[idx].responseTime = startTime[idx] - p[idx].arrivalTime;
                totalTAT += p[idx].turnaroundTime;
                totalWT += p[idx].waitingTime;
                totalRT += p[idx].responseTime;
                visited[idx] = true;
                done++;
            }
            if (gantt.length) gantt[gantt.length - 1].end = time;
            }
            
            if (gantt.length && gantt[gantt.length - 1].end === undefined) {
    gantt[gantt.length - 1].end = time;
}
        let scheduledPIDs = new Set(gantt.map(g => g.pid));
            if (scheduledPIDs.size !== p.length) {
            console.warn("Some processes did not run or are missing.");
        }

        if (gantt.length && gantt[gantt.length - 1].end === undefined) {
        gantt[gantt.length - 1].end = time;
        }
            displayGanttChart(gantt);
            displayMetricsTable(p);
            displayAverages(n, totalTAT, totalWT, totalRT);
        }

        function runRR(p, q) {
            let time = 0, queue = [], index = 0, gantt = [], remaining = {}, arrived = [], n = p.length;
            p.sort((a, b) => a.arrivalTime - b.arrivalTime);
            p.forEach(proc => remaining[proc.pid] = proc.burstTime);
            const completed = new Set(), firstStart = {};
            while (completed.size < n) {
            while (index < n && p[index].arrivalTime <= time) {
                queue.push(p[index]);
                arrived.push(p[index].pid);
                index++;
            }
            if (!queue.length) { time++; continue; }
            let proc = queue.shift();
            if (!firstStart[proc.pid]) {
                proc.startTime = time;
                firstStart[proc.pid] = true;
            }
            let runTime = Math.min(q, remaining[proc.pid]);
            gantt.push({ pid: proc.pid, start: time, end: time + runTime });
            time += runTime;
            remaining[proc.pid] -= runTime;
            while (index < n && p[index].arrivalTime <= time) {
                queue.push(p[index]);
                arrived.push(p[index].pid);
                index++;
            }
            if (remaining[proc.pid] > 0) queue.push(proc);
            else {
                proc.completionTime = time;
                proc.turnaroundTime = time - proc.arrivalTime;
                proc.waitingTime = proc.turnaroundTime - proc.burstTime;
                proc.responseTime = proc.startTime - proc.arrivalTime;
                completed.add(proc.pid);
            }
            }
            const totalTAT = p.reduce((acc, x) => acc + x.turnaroundTime, 0);
            const totalWT = p.reduce((acc, x) => acc + x.waitingTime, 0);
            const totalRT = p.reduce((acc, x) => acc + x.responseTime, 0);
           let scheduledPIDs = new Set(gantt.map(g => g.pid));
if (scheduledPIDs.size !== p.length) {
  console.warn("Some processes did not run or are missing.");
}
            displayGanttChart(gantt);
            displayMetricsTable(p);
            displayAverages(n, totalTAT, totalWT, totalRT);
        }

    function runMLFQ(p, quanta) {
        
        const timeAllotments = [
        parseInt(document.getElementById("q0-allotment").value),
        parseInt(document.getElementById("q1-allotment").value),
        parseInt(document.getElementById("q2-allotment").value),
        Infinity
        ];
        let time = 0, queues = [[], [], [], []], gantt = [], remaining = {}, done = new Set();
        const timeSpent = {}; // Tracks how much time a process has used in its current level

        p.sort((a, b) => a.arrivalTime - b.arrivalTime);
        p.forEach(proc => {
            remaining[proc.pid] = proc.burstTime;
            timeSpent[proc.pid] = 0;
        });

        let index = 0;
        while (done.size < p.length) {
            while (index < p.length && p[index].arrivalTime <= time) queues[0].push(p[index++]);

        let qLevel = queues.findIndex(q => q.length > 0);
        if (qLevel === -1) { time++; continue; }

        let proc = queues[qLevel].shift();

            if (proc.startTime === undefined) proc.startTime = time;

            let runTime = Math.min(quanta[qLevel], remaining[proc.pid]);
            runTime = Math.min(runTime, timeAllotments[qLevel] - timeSpent[proc.pid]); // Enforce time allotment

            const start = time;
            time += runTime;

            gantt.push({
            pid: proc.pid,
            start: start,
            end: time,
            queue: qLevel
            });

            time += runTime;
            remaining[proc.pid] -= runTime;
            timeSpent[proc.pid] += runTime;

            while (index < p.length && p[index].arrivalTime <= time) queues[0].push(p[index++]);

            if (remaining[proc.pid] > 0) {
                // Check if process has exhausted its allotment
                if (timeSpent[proc.pid] >= timeAllotments[qLevel]) {
                    timeSpent[proc.pid] = 0;
                    queues[Math.min(qLevel + 1, 3)].push(proc);
                } else {
                    queues[qLevel].push(proc);
                }
            } else {
                proc.completionTime = time;
                proc.turnaroundTime = time - proc.arrivalTime;
                proc.waitingTime = proc.turnaroundTime - proc.burstTime;
                proc.responseTime = proc.startTime - proc.arrivalTime;
                done.add(proc.pid);
            }
        }

        const totalTAT = p.reduce((acc, x) => acc + x.turnaroundTime, 0);
        const totalWT = p.reduce((acc, x) => acc + x.waitingTime, 0);
        const totalRT = p.reduce((acc, x) => acc + x.responseTime, 0);

        let scheduledPIDs = new Set(gantt.map(g => g.pid));
        if (scheduledPIDs.size !== p.length) {
            console.warn("Some processes did not run or are missing.");
        }

        if (gantt.length && gantt[gantt.length - 1].end === undefined) {
        gantt[gantt.length - 1].end = time;
        }
        
        displayGanttChart(gantt);
        displayMetricsTable(p);
        displayAverages(p.length, totalTAT, totalWT, totalRT);
    }

        function displayGanttChart(gantt) {
        const chartDiv = document.getElementById("ganttChart");
        if (!gantt.length) {
            chartDiv.innerHTML = "<p>No Gantt chart data available.</p>";
            return;
        }

        let chartWrapper = document.createElement("div");
        chartWrapper.id = "ganttChartWrapper";

        let barRow = document.createElement("div");
        barRow.id = "ganttChart";

        let timeRow = document.createElement("div");
        timeRow.id = "ganttTimes";

        chartDiv.innerHTML = "";
        chartDiv.appendChild(chartWrapper);
        chartWrapper.appendChild(barRow);
        chartWrapper.appendChild(timeRow);

        // Animate each block based on its index
        gantt.forEach((entry, index) => {
            setTimeout(() => {
            const block = document.createElement("div");
            block.className = "gantt-block";
            block.classList.add(`p${entry.pid}`);

            // Add queue indicator only if MLFQ
            if (entry.hasOwnProperty('queue')) {
                block.innerText = `P${entry.pid}\nQ${entry.queue}`;
            } else {
                block.innerText = `P${entry.pid}`;
            }

            // Gantt time start
            const time = document.createElement("div");
            time.className = "gantt-time";
            time.innerText = entry.start;

            barRow.appendChild(block);
            timeRow.appendChild(time);

            // Add end time for the last block
            if (index === gantt.length - 1) {
                const endTime = document.createElement("div");
                endTime.className = "gantt-time";
                endTime.innerText = entry.end;
                timeRow.appendChild(endTime);
            }

            }, index * 300); // 300ms delay between blocks (adjust speed here)
        });
        }
        function displayMetricsTable(processes) {
            const tableDiv = document.getElementById("metricsTable");
            let html = `<table border="1" style="width:100%; border-collapse:collapse;"><thead><tr>
            <th>PID</th><th>Arrival</th><th>Burst</th><th>Start</th><th>Completion</th>
            <th>Turnaround</th><th>Waiting</th><th>Response</th></tr></thead><tbody>`;
            processes.forEach(p => {
            html += `<tr><td>P${p.pid}</td><td>${p.arrivalTime}</td><td>${p.burstTime}</td><td>${p.startTime}</td>
            <td>${p.completionTime}</td><td>${p.turnaroundTime}</td><td>${p.waitingTime}</td><td>${p.responseTime}</td></tr>`;
            });
            html += "</tbody></table>";
            tableDiv.innerHTML = html;
        }

        function displayAverages(n, totalTAT, totalWT, totalRT) {
            const avgDiv = document.getElementById("averageMetrics");
            const tat = (totalTAT / n).toFixed(2);
            const wt = (totalWT / n).toFixed(2);
            const rt = (totalRT / n).toFixed(2);
            avgDiv.innerHTML = `
            <p><strong>Average Turnaround Time:</strong> ${tat}</p>
            <p><strong>Average Waiting Time:</strong> ${wt}</p>
            <p><strong>Average Response Time:</strong> ${rt}</p>
            `;
        }

        function displayMetricsTable(processes) {
        const tableDiv = document.getElementById("metricsTable");

        if (!processes.length) {
            tableDiv.innerHTML = "<p>No process metrics to display.</p>";
            return;
        }

        let html = `
            <table style="width:100%; border-collapse: collapse; text-align: center;">
            <thead>
                <tr style="background-color: #2e2f3e;">
                <th>PID</th><th>Arrival</th><th>Burst</th><th>Start</th>
                <th>Completion</th><th>Turnaround</th><th>Waiting</th><th>Response</th>
                </tr>
            </thead>
            <tbody>
        `;

        processes.forEach(p => {
            html += `
            <tr>
                <td>P${p.pid}</td>
                <td>${p.arrivalTime}</td>
                <td>${p.burstTime}</td>
                <td>${p.startTime}</td>
                <td>${p.completionTime}</td>
                <td>${p.turnaroundTime}</td>
                <td>${p.waitingTime}</td>
                <td>${p.responseTime}</td>
            </tr>
            `;
        });

        html += "</tbody></table>";
        tableDiv.innerHTML = html;
        }
    });
