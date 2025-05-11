import React from 'react';
import './GanttChart.css'; // We'll update this CSS

// Helper to generate distinct colors (can be reused)
const generateColor = (processId) => {
    // Simple hash function to get somewhat consistent colors per process ID
    if (!processId || processId.startsWith('Idle')) return '#e9ecef'; // A specific color for idle or fallback
    let hash = 0;
    for (let i = 0; i < processId.length; i++) {
        hash = processId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360); // Ensure hue is positive
    return `hsl(${hue}, 70%, 75%)`; // Use HSL for pleasant colors
};


function GanttChart({ data }) {
  if (!data || data.length === 0) {
    return (
        <div className="gantt-chart-container-stacked">
            <h4>Gantt Chart</h4>
            <p>(No execution data to display)</p>
        </div>
    );
  }

  // 1. Determine overall time range and unique process IDs
  let minTime = 0; // Typically 0 for CPU scheduling
  let maxTime = 0;
  const processExecutionBlocks = {}; // { P1: [{start, end}, ...], P2: [...] }
  const uniqueProcessIds = [];

  data.forEach(block => {
    if (block.id !== 'Idle') {
      if (!processExecutionBlocks[block.id]) {
        processExecutionBlocks[block.id] = [];
        uniqueProcessIds.push(block.id);
      }
      processExecutionBlocks[block.id].push({ start: block.start, end: block.end });
    }
    if (block.end > maxTime) {
      maxTime = block.end;
    }
  });

  // Sort unique process IDs if needed (e.g., P1, P2, P10 -> P1, P10, P2 without natural sort)
  uniqueProcessIds.sort((a, b) => {
    const numA = parseInt(a.substring(1), 10);
    const numB = parseInt(b.substring(1), 10);
    return numA - numB;
  });


  const totalDuration = maxTime - minTime;

  if (totalDuration <= 0 && uniqueProcessIds.length > 0) {
    // Handle cases where all processes might have zero burst time but exist
     return (
        <div className="gantt-chart-container-stacked">
            <h4>Gantt Chart</h4>
            <p>(No execution time for processes)</p>
            {uniqueProcessIds.map(pid => (
                <div key={pid} className="gantt-row-stacked">
                    <div className="gantt-row-label-stacked">{pid}</div>
                    <div className="gantt-row-timeline-stacked">
                        {/* No bar to draw */}
                    </div>
                </div>
            ))}
        </div>
    );
  }
  if (totalDuration <= 0) {
      return <div className="gantt-chart-container-stacked"><h4>Gantt Chart</h4><p>(No execution time)</p></div>;
  }


  // 2. Create time axis labels (e.g., every 1 or 5 units)
  const timeMarkers = [];
  const tickInterval = Math.ceil(totalDuration / 15) || 1; // Aim for around 15 ticks, or at least 1
  for (let i = minTime; i <= maxTime; i += tickInterval) {
    timeMarkers.push(i);
  }
  // Ensure the last time point is included if not perfectly divisible
  if (timeMarkers[timeMarkers.length - 1] < maxTime && maxTime > 0) {
      if (!timeMarkers.includes(maxTime)){ // Avoid duplicate if maxTime is a multiple of tickInterval
        timeMarkers.push(maxTime);
      }
  }
  // Remove duplicates that might occur from Math.ceil logic if maxTime is small
  const uniqueTimeMarkers = [...new Set(timeMarkers)].sort((a,b) => a-b);


  return (
    <div className="gantt-chart-container-stacked">
      <h4>Gantt Chart</h4>

      {/* Time Axis */}
      <div className="gantt-time-axis-stacked">
        <div className="gantt-row-label-stacked"></div> {/* Empty cell for alignment */}
        <div className="gantt-axis-line-stacked">
          {uniqueTimeMarkers.map(time => (
            <div
              key={`time-${time}`}
              className="gantt-time-marker-stacked"
              style={{ left: `${((time - minTime) / totalDuration) * 100}%` }}
            >
              <span className="gantt-time-value-stacked">{time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Process Rows */}
      {uniqueProcessIds.map(processId => (
        <div key={processId} className="gantt-row-stacked">
          <div className="gantt-row-label-stacked">{processId}</div>
          <div className="gantt-row-timeline-stacked">
            {processExecutionBlocks[processId]?.map((block, index) => {
              const leftOffset = ((block.start - minTime) / totalDuration) * 100;
              const width = ((block.end - block.start) / totalDuration) * 100;

              if (width <= 0) return null; // Don't render zero-width blocks

              return (
                <div
                  key={`${processId}-block-${index}`}
                  className="gantt-bar-stacked"
                  style={{
                    left: `${leftOffset}%`,
                    width: `${width}%`,
                    backgroundColor: generateColor(processId),
                  }}
                  title={`Process: ${processId}\nStart: ${block.start}\nEnd: ${block.end}`}
                >
                   {/* Optional: Display block.id or duration inside if space allows */}
                   {/* {block.end - block.start} */}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default GanttChart;