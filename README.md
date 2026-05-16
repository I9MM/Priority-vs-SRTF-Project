# CPU Scheduling Comparison Project — C1
## Priority Scheduling vs SRTF

| Field | Details |
| :--- | :--- |
| **Algorithms** | Priority Scheduling (Preemptive) & SRTF |
| **Language** | HTML / CSS / JavaScript |
| **Priority Rule** | Lower value = Higher priority (e.g., 1 > 5) |
| **Course** | Operating Systems |

---

## 1. Introduction
CPU scheduling is one of the fundamental responsibilities of an operating system. The scheduler determines which process in the ready queue is allocated the CPU at any given moment, directly influencing system responsiveness, resource utilization, fairness, and overall throughput.

This project presents a detailed comparative study of two preemptive CPU scheduling algorithms:
*   **Priority Scheduling:** Assigns CPU time based on a predefined priority value associated with each process. The process with the highest priority (lowest numeric value) is selected first.
*   **Shortest Remaining Time First (SRTF):** Always selects the process with the least remaining burst time. It is the preemptive version of Shortest Job First (SJF).

**Key Question:** How does a policy-driven scheduler (Priority) compare to an efficiency-driven scheduler (SRTF) when faced with the same workload? Which is fairer? Which is faster?

---

## 2. Algorithm Descriptions

### 2.1 Priority Scheduling
Priority Scheduling selects the process with the highest priority from the ready queue. In this implementation, a lower numeric priority value indicates a higher priority.

**Rules:**
*   **Preemptive:** If a newly arrived process has higher priority than the running process, it immediately preempts it.
*   **Tie-breaking:** Resolved by Arrival Time (FCFS), then by Process ID.
*   **Starvation Risk:** Low-priority processes may wait indefinitely if high-priority processes keep arriving.

### 2.2 Shortest Remaining Time First (SRTF)
SRTF is the preemptive counterpart of SJF. At every time unit, the process with the smallest remaining burst time is chosen.

**Rules:**
*   **Preemptive:** If a new process arrives with a burst time less than the remaining time of the current process, it preempts immediately.
*   **Tie-breaking:** Resolved by Arrival Time, then by Process ID.
*   **Optimization:** Theoretically minimizes Average Waiting Time.
*   **Starvation Risk:** Long processes may be postponed if short processes keep arriving.

---

## 3. Implementation Details

### 3.1 Technology Stack
*   **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
*   **Gantt Charts:** Rendered using dynamic HTML/CSS blocks with unique process coloring.
*   **Logic:** Real-time scheduling engine with live-update capabilities.

### 3.2 How to Run the Project
1.  **Extract the files** to a local folder.
2.  **Open `index.html`** in any modern web browser (Google Chrome, Firefox, Edge, Safari). No local server or backend installation is required.
3.  **To add a process manually:** Click the **"+ Add Process"** button and enter the Process ID, Arrival Time, Burst Time, and Priority.
4.  **To run a predefined scenario:** Click on any of the **"Load Scenario"** buttons at the top.
5.  **Live Update:** Once the simulation is running, any changes made to the inputs will automatically and instantly update the Gantt charts and results.

### 3.3 Input Validation Rules
The simulator safely rejects the following:
*   Negative Arrival Times.
*   Zero or Negative Burst Times.
*   Duplicate Process IDs.
*   Non-numeric or Non-integer inputs.
*   Missing required fields.

---

## 4. Test Scenarios

*   **Scenario A (Basic Mixed):** Evaluation of baseline behavior with varied inputs.

*   **Scenario B (Conflict):** High-priority long process vs. low-priority short process to show decision differences.

*   **Scenario C (Starvation-Sensitive):** Demonstrates the risk where one process waits much longer depending on the policy.

*   **Scenario D (Validation):** Demonstrates error handling for invalid data inputs.


---

## 5. Comparative Analysis

### 5.1 Analysis Questions
1.  **Which algorithm produced the lower average waiting time?**
    Typically SRTF, as it is optimal for minimizing waiting time.
2.  **Which algorithm produced the lower average response time?**
    SRTF, because short jobs gain CPU access almost immediately.
3.  **Did priority values improve treatment of urgent processes?**
    Yes, Priority Scheduling respects the assigned urgency regardless of job length.
4.  **Did SRTF favor short jobs more aggressively?**
    Yes, SRTF ignores priority labels in favor of burst time efficiency.
5.  **Which algorithm would you recommend?**
    SRTF for general-purpose throughput; Priority for real-time/critical systems.

### 5.2 Overall Comparison Summary

| Criterion | Priority Scheduling | SRTF |
| :--- | :--- | :--- |
| **Average WT** | Higher (Policy-driven) | Lower (Optimal) |
| **Respects Urgency** | Yes | No |
| **Fairness** | Unfair to low-priority | Unfair to long jobs |
| **Starvation Risk** | Low-priority processes | Long processes |
| **Best Use Case** | Critical/Real-time systems | Batch/General systems |

---

## 6. Conclusion
The fundamental trade-off identified in this project is **Policy Correctness vs. Optimal Efficiency**. Priority Scheduling ensures that "important" tasks are served first, while SRTF ensures that the maximum number of tasks are served in the shortest time. Both algorithms face the risk of **Starvation**, which in professional systems is usually solved by techniques like **Aging**.
