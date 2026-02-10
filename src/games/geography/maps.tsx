export function WorldMap({ variant }: { variant: 'retro' | 'organic' }) {
  const fill = variant === 'organic' ? 'rgba(45, 106, 79, 0.18)' : 'transparent';
  const stroke = 'var(--color-primary)';
  const strokeWidth = variant === 'retro' ? 3 : 2;
  const dash = variant === 'organic' ? '6 4' : undefined;

  return (
    <svg
      viewBox="0 0 1000 500"
      style={{ width: '100%', height: '100%', display: 'block' }}
      preserveAspectRatio="none"
      aria-hidden
    >
      <rect width="1000" height="500" fill="transparent" />
      <g
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeDasharray={dash}
        shapeRendering={variant === 'retro' ? 'crispEdges' : 'auto'}
      >
        <polygon points="80,110 220,70 330,120 290,210 180,230 100,190" />
        <polygon points="260,230 330,270 310,360 250,430 210,360" />
        <polygon points="410,120 520,90 610,130 570,190 460,190 420,150" />
        <polygon points="470,200 590,220 650,320 560,420 450,360" />
        <polygon points="620,140 770,120 910,180 880,270 710,260 640,200" />
        <polygon points="760,320 870,350 840,430 740,390" />
        <polygon points="330,60 400,80 360,110" />
        <polygon points="200,460 800,460 700,490 300,490" />
      </g>
      {variant === 'retro' && (
        <g stroke="var(--color-primary)" strokeWidth={1} opacity={0.35}>
          <line x1="0" y1="125" x2="1000" y2="125" />
          <line x1="0" y1="250" x2="1000" y2="250" />
          <line x1="0" y1="375" x2="1000" y2="375" />
          <line x1="250" y1="0" x2="250" y2="500" />
          <line x1="500" y1="0" x2="500" y2="500" />
          <line x1="750" y1="0" x2="750" y2="500" />
        </g>
      )}
    </svg>
  );
}

export interface StarNode {
  id: string;
  x: number;
  y: number;
}

export function StarMap({ nodes }: { nodes: StarNode[] }) {
  const connections = nodes
    .map((node, index) => [node, nodes[index + 1]])
    .filter((pair): pair is [StarNode, StarNode] => Boolean(pair[1]));

  const extraConnections = nodes
    .map((node, index) => [node, nodes[index + 2]])
    .filter((pair): pair is [StarNode, StarNode] => Boolean(pair[1]));

  const starfield = [
    [80, 60],
    [160, 140],
    [260, 40],
    [420, 80],
    [520, 40],
    [680, 90],
    [780, 40],
    [910, 120],
    [120, 300],
    [260, 260],
    [360, 320],
    [520, 260],
    [700, 300],
    [900, 260],
    [140, 440],
    [360, 430],
    [620, 420],
    [820, 440],
  ];

  return (
    <svg
      viewBox="0 0 1000 500"
      style={{ width: '100%', height: '100%', display: 'block' }}
      preserveAspectRatio="none"
      aria-hidden
    >
      <rect width="1000" height="500" fill="transparent" />
      <g stroke="rgba(0, 229, 255, 0.35)" strokeWidth={1}>
        {connections.map(([from, to]) => (
          <line
            key={`c-${from.id}-${to.id}`}
            x1={from.x * 1000}
            y1={from.y * 500}
            x2={to.x * 1000}
            y2={to.y * 500}
          />
        ))}
        {extraConnections.map(([from, to]) => (
          <line
            key={`e-${from.id}-${to.id}`}
            x1={from.x * 1000}
            y1={from.y * 500}
            x2={to.x * 1000}
            y2={to.y * 500}
            opacity={0.25}
          />
        ))}
      </g>
      <g>
        {starfield.map(([x, y], index) => (
          <circle
            key={`s-${index}`}
            cx={x}
            cy={y}
            r={1.5}
            fill="rgba(224, 224, 224, 0.6)"
          />
        ))}
      </g>
      <g>
        {nodes.map((node) => (
          <g key={node.id}>
            <circle
              cx={node.x * 1000}
              cy={node.y * 500}
              r={8}
              fill="rgba(0, 229, 255, 0.35)"
            />
            <circle
              cx={node.x * 1000}
              cy={node.y * 500}
              r={4}
              fill="var(--color-primary)"
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
