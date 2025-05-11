// client/src/components/GanttChart/GanttChart.jsx
import React from 'react';
import './GanttChart.css';

const generateColor = (processId) => {
    if (!processId || processId.startsWith('Idle')) return '#e0e0e0'; // Lighter grey for idle
    let hash = 0;
    for (let i = 0; i < processId.length; i++) {
        hash = processId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 60%, 70%)`; // Previous dynamic color
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

  const visualMinTime = 0; // The visual start of our timeline axis
  let maxTime = 0;
  const processExecutionBlocks = {};
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

  uniqueProcessIds.sort((a, b) => {
    const numA = parseInt(a.substring(1), 10);
    const numB = parseInt(b.substring(1), 10);
    return numA - numB;
  });

  // totalDuration is the visual span of the chart from visualMinTime
  const totalDuration = maxTime > visualMinTime ? Math.max(1, maxTime - visualMinTime) : 0;

  if (totalDuration === 0 && uniqueProcessIds.length > 0) {
     return (
        <div className="gantt-chart-container-stacked">
            <h4>Gantt Chart</h4>
            <p>(No execution time for processes)</p>
        </div>
    );
  }
   if (totalDuration === 0) {
       return (
         <div className="gantt-chart-container-stacked">
           <h4>Gantt Chart</h4>
           <p>(No execution time)</p>
         </div>
       );
   }

  const timeMarkers = [];
  let tickInterval = 1;
  if (totalDuration > 50) tickInterval = 10;
  else if (totalDuration > 20) tickInterval = 5;
  else if (totalDuration > 10) tickInterval = 2;

  // Ensure markers start from visualMinTime
  for (let i = visualMinTime; i <= maxTime; i += tickInterval) {
    timeMarkers.push(i);
  }
  // Ensure the last significant time point (maxTime) is included as a marker
  if (timeMarkers[timeMarkers.length - 1] < maxTime && !timeMarkers.includes(maxTime) && maxTime > visualMinTime) {
    timeMarkers.push(maxTime);
  }
  const uniqueTimeMarkers = [...new Set(timeMarkers)].sort((a,b) => a-b);

  return (
    <div className="gantt-chart-container-stacked">
      <h4>Gantt Chart</h4>

      <div className="gantt-time-axis-wrapper-stacked"> {/* New wrapper for axis */}
        <div className="gantt-row-label-stacked" aria-hidden="true"></div> {/* Spacer for labels */}
        <div className="gantt-axis-line-stacked">
          {uniqueTimeMarkers.map(time => (
            <div
              key={`time-${time}`}
              className="gantt-time-marker-stacked"
              // Position relative to visualMinTime
              style={{ left: `${((time - visualMinTime) / totalDuration) * 100}%` }}
            >
              <span className="gantt-time-value-stacked">{time}</span>
            </div>
          ))}
        </div>
      </div>

      {uniqueProcessIds.map(processId => (
        <div key={processId} className="gantt-row-stacked">
          <div className="gantt-row-label-stacked">{processId}</div>
          <div className="gantt-row-timeline-stacked">
            {processExecutionBlocks[processId]?.map((block, index) => {
              // Calculate positions relative to visualMinTime
              const leftOffset = ((block.start - visualMinTime) / totalDuration) * 100;
              const width = ((block.end - block.start) / totalDuration) * 100;

              if (width <= 0 || leftOffset < 0) return null; // Don't render if before visual start or zero width

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
                />
              );
            })}
          </div>
        </div>
      ))}
      {/* Your pseudo scrollbar (if kept) would also need to be aligned */}
      <div className="gantt-pseudo-scrollbar-stacked">
        <div className="gantt-pseudo-thumb-stacked"></div>
      </div>
    </div>
  );
}

export default GanttChart;