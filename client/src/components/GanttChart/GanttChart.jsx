import React from 'react';
import './GanttChart.css'; // Import component-specific CSS

// Helper to generate distinct colors (simple version)
const generateColor = (id) => {
    if (id === 'Idle') return '#e9ecef'; // Grey for Idle
    // Simple hash function to get somewhat consistent colors per process ID
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 80%)`; // Use HSL for pleasant colors
};


function GanttChart({ data }) {
  // Don't render if no data
  if (!data || data.length === 0) {
    return null;
  }

  // Calculate the total duration of the chart
  const totalDuration = Math.max(0, ...data.map(block => block.end));

  // Prevent division by zero if totalDuration is 0
  if (totalDuration === 0) {
      return (
        <div className="gantt-chart-container">
            <h4>Gantt Chart</h4>
            <p>(No execution time)</p>
        </div>
      )
  }


  return (
    <div className="gantt-chart-container">
      <h4>Gantt Chart</h4>
      <div className="gantt-chart">
        {/* Render blocks */}
        {data.map((block, index) => {
          const duration = block.end - block.start;
          // Skip rendering blocks with zero or negative duration
          if (duration <= 0) return null;

          const widthPercentage = (duration / totalDuration) * 100;
          const blockStyle = {
            flexBasis: `${widthPercentage}%`, // Use flex-basis for width
            backgroundColor: generateColor(block.id),
            // Add a subtle border if needed
            // border: block.id !== 'Idle' ? '1px solid rgba(0, 0, 0, 0.1)' : 'none',
          };

          return (
            <div
              key={`${block.id}-${block.start}-${index}`} // More unique key
              className={`gantt-block ${block.id === 'Idle' ? 'gantt-block-idle' : 'gantt-block-process'}`}
              style={blockStyle}
              title={`Process: ${block.id}\nStart: ${block.start}\nEnd: ${block.end}\nDuration: ${duration}`} // Tooltip
            >
              <span className="gantt-block-label">{block.id}</span>
            </div>
          );
        })}
      </div>
      {/* Render time markers */}
      <div className="gantt-time-markers">
         {/* Initial 0 marker */}
         <div className="gantt-marker" style={{ left: '0%' }}>
              <span className="gantt-marker-time">0</span>
         </div>
         {/* Markers for end times */}
         {data.map((block, index) => {
            const positionPercentage = (block.end / totalDuration) * 100;
            // Avoid placing marker if duration is 0 or less
             if (block.end - block.start <= 0 && block.end !== 0) return null;
             // Avoid placing marker if it's exactly at 0 (already handled)
             if (block.end === 0) return null;

             // Simple check to avoid duplicate markers at the same time spot
             // More robust deduplication might be needed for complex cases
             const isDuplicate = data.slice(0, index).some(prevBlock => prevBlock.end === block.end);
             if(isDuplicate) return null;


            return(
                 <div
                    key={`marker-${block.end}-${index}`}
                    className="gantt-marker"
                    style={{ left: `${positionPercentage}%` }}
                 >
                    <span className="gantt-marker-time">{block.end}</span>
                 </div>
            );
         })}
      </div>
    </div>
  );
}

export default GanttChart;