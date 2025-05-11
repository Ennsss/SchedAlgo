// client/src/components/GanttChart/GanttChart.jsx
import React from 'react';
import './GanttChart.css';

const generateColor = (processId) => {
    if (!processId || processId.startsWith('Idle')) return '#e9ecef';
    let hash = 0;
    for (let i = 0; i < processId.length; i++) {
        hash = processId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 65%, 70%)`; // Adjusted saturation/lightness slightly
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

  let minTime = 0;
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

  // Ensure totalDuration is at least 1 if there's any maxTime, to prevent division by zero
  // if maxTime is 0, then totalDuration will be 0
  const totalDuration = maxTime > 0 ? Math.max(1, maxTime - minTime) : 0;


  if (totalDuration === 0 && uniqueProcessIds.length > 0) {
     return (
        <div className="gantt-chart-container-stacked">
            <h4>Gantt Chart</h4>
            <p>(No execution time for processes)</p>
            {/* You might still want to list process IDs here if they exist */}
        </div>
    );
  }
   if (totalDuration === 0) { // No processes or all zero duration
       return (
         <div className="gantt-chart-container-stacked">
           <h4>Gantt Chart</h4>
           <p>(No execution time)</p>
         </div>
       );
   }


  const timeMarkers = [];
  // Adjust tickInterval logic for better scaling
  let tickInterval = 1;
  if (totalDuration > 50) tickInterval = 10;
  else if (totalDuration > 20) tickInterval = 5;
  else if (totalDuration > 10) tickInterval = 2;

  for (let i = minTime; i <= maxTime; i += tickInterval) {
    timeMarkers.push(i);
  }
  if (timeMarkers[timeMarkers.length - 1] < maxTime && !timeMarkers.includes(maxTime)) {
    timeMarkers.push(maxTime);
  }
  const uniqueTimeMarkers = [...new Set(timeMarkers)].sort((a,b) => a-b);

  return (
    <div className="gantt-chart-container-stacked">
      <h4>Gantt Chart</h4>

      <div className="gantt-time-axis-stacked">
        <div className="gantt-row-label-stacked" aria-hidden="true"></div> {/* Spacer */}
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

      {uniqueProcessIds.map(processId => (
        <div key={processId} className="gantt-row-stacked">
          <div className="gantt-row-label-stacked">{processId}</div>
          <div className="gantt-row-timeline-stacked">
            {processExecutionBlocks[processId]?.map((block, index) => {
              const leftOffset = ((block.start - minTime) / totalDuration) * 100;
              const width = ((block.end - block.start) / totalDuration) * 100;

              if (width <= 0) return null;

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
                   {/* Displaying text inside small bars can be tricky. Consider only for wider bars. */}
                   {/* {width > 5 && (block.end - block.start)} */}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {
          <div className="gantt-pseudo-scrollbar-stacked">
            <div className="gantt-pseudo-thumb-stacked"></div>
          </div>
     }
    </div>
  );
}

export default GanttChart;