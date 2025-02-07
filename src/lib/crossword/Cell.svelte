<script lang="ts">
  interface CellProps {
    x: number;
    y: number; 
    width: number;
    height: number;
    label?: string;
    userInput?: string;
    isSelected: boolean;
    highlightState: 'none' | 'main' | 'related';  // Changed from isHighlighted
    type?: number;
    onClick: () => void;
  }

  let { 
    x, 
    y,
    width,
    height,
    label,
    userInput = '',
    isSelected,
    highlightState = 'none',
    type,
    onClick
  } = $props();

  let classes = $derived([
    'cell',
    !type ? 'cell-empty' : '',
    isSelected ? 'cell-selected' : '',
    highlightState === 'main' ? 'cell-highlighted' : '',
    highlightState === 'related' ? 'cell-related' : ''
  ].filter(Boolean).join(' '));

  function handleClick() {
    if (type !== undefined) {
      onClick();
    }
  }
</script>

<g>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <rect
    {x}
    {y}
    {width}
    {height}
    class={classes}
    onclick={handleClick}
  />
  
  {#if type === 2}
    {#if label}
    <path
        d={`M ${x} ${y + height/2} 
        a${width/2 - 0.25} ${width/2 - 0.25} 0 1 0 ${width/2 - 0.25} -${width/2 - 0.25}`}
        fill="none"
        stroke="dimgray"
        vector-effect="non-scaling-stroke"
    />
    {:else}
    <circle
      cx={x + width/2}
      cy={y + height/2}
      r={width/2 - 0.25}
      fill="none"
      stroke="dimgray"
      vector-effect="non-scaling-stroke"
    />
    {/if}
  {/if}

  {#if label}
    <text
      class="cell-text"
      x={x + 2}
      y={y + 10}
      font-size={width * (1/3)}
      text-anchor="start"
    >
      {label}
    </text>
  {/if}

  <text
    x={x + width/2}
    y={y + height * (7.5/12)}
    text-anchor="middle"
    dominant-baseline="central"
    class="cell-text"
    font-size={width * (2/3)}
  >
    {userInput}
  </text>
</g>

<style>
  .cell {
    fill: white;
    cursor: pointer;
  }

  .cell-empty {
    fill: black;
    cursor: default;
  }

  .cell-highlighted {
    fill: #a7d8ff;
    &.cell-selected {
      fill: #ffda00;
    }
  }

  .cell-related {
    fill: #ffeca0;
    &.cell-selected {
      fill: #ffda00;
    }
  }

  .cell:hover {
    filter: brightness(0.95);
  }

  .cell-text {
    font-family: arial, sans-serif;
    font-weight: 400;
    user-select: none;
    pointer-events: none;
  }
</style>