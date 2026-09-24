<script>
  export let progress = 0;

  // Danfo bus crosses left-to-right during the second half of the scroll
  // journey (boat takes the first half, see Boat.svelte) — "leaving yellow
  // Lagos," now tied to actual scroll position instead of a wall-clock loop.
  const START = 0.58;
  const END = 0.88;
  const FADE = 0.1;

  $: t = Math.max(0, Math.min(1, (progress - START) / (END - START)));
  $: left = progress <= START ? -25 : progress >= END ? 132 : -25 + (108 - -25) * t;
  $: opacity =
    progress <= START || progress >= END
      ? 0
      : Math.min(1, t / FADE, (1 - t) / FADE);

  let isHonking = false;
  function honk() {
    if (isHonking) return;
    isHonking = true;
    setTimeout(() => {
      isHonking = false;
    }, 600);
  }
</script>

<div class="bus-track" aria-hidden="true">
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div class="bus-travel" style="transform: translateX({left}vw); opacity: {opacity};" on:click={honk}>
    {#if isHonking}
      <div class="honk-bubble">HONK!</div>
    {/if}
    <div class="bus-rig" class:honking={isHonking}>
      <svg viewBox="0 0 150 90" class="bus-svg">
        <!-- danfo: Lagos yellow minibus, VW-van silhouette with roof
             destination sign, ref: dribbble.com/shots/4422413 -->
        <rect x="8" y="20" width="134" height="45" rx="10" fill="#ffcc00" stroke="#181818" stroke-width="4" />

        <rect x="55" y="8" width="40" height="14" rx="3" fill="#181818" />
        <rect x="55" y="8" width="40" height="5" rx="2" fill="#f6f4f1" />

        <rect x="20" y="26" width="100" height="22" rx="4" fill="#181818" />
        <rect x="24" y="30" width="27" height="15" rx="2" fill="#55606b" />
        <rect x="58" y="30" width="27" height="15" rx="2" fill="#55606b" />
        <rect x="92" y="30" width="24" height="15" rx="2" fill="#55606b" />

        <rect x="8" y="50" width="134" height="4" fill="#181818" />
        <rect x="8" y="57" width="134" height="4" fill="#181818" />

        <rect x="132" y="27" width="10" height="2" fill="#181818" />
        <rect x="132" y="31" width="10" height="2" fill="#181818" />
        <rect x="132" y="35" width="10" height="2" fill="#181818" />
        <rect x="132" y="39" width="10" height="2" fill="#181818" />

        <rect x="14" y="59" width="5" height="10" rx="1" fill="var(--pink-deep)" />
        <rect x="129" y="59" width="5" height="10" rx="1" fill="var(--pink-deep)" />

        <circle cx="35" cy="68" r="13" fill="#181818" stroke="#f6f4f1" stroke-width="2" />
        <path d="M35,68 m-6,0 a6,6 0 0 1 12,0 z" fill="#d8d8d8" />
        <circle cx="115" cy="68" r="13" fill="#181818" stroke="#f6f4f1" stroke-width="2" />
        <path d="M115,68 m-6,0 a6,6 0 0 1 12,0 z" fill="#d8d8d8" />
      </svg>
    </div>
  </div>
</div>

<style>
  .bus-track {
    position: absolute;
    left: 0;
    bottom: 8%;
    width: 100%;
    height: 60px;
    pointer-events: none;
    z-index: 0;
    overflow: visible;
  }

  .bus-travel {
    position: absolute;
    top: 0;
    width: 130px;
    height: 100%;
    transition: opacity var(--dur-base) var(--ease-standard);
    pointer-events: auto;
    cursor: pointer;
  }

  .bus-rig {
    width: 100%;
    height: 100%;
    animation: bounce 9s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }
  .bus-rig.honking {
    animation: shake 0.3s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }

  .honk-bubble {
    position: absolute;
    top: -30px;
    right: 20px;
    background: white;
    color: var(--ink);
    border: 2px solid var(--ink);
    border-radius: 12px;
    padding: 2px 8px;
    font-weight: 700;
    font-size: 0.8rem;
    font-family: var(--sans);
    box-shadow: 2px 2px 0 var(--chaos-yellow);
    animation: pop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    z-index: 10;
  }
  .honk-bubble::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 10px;
    border-width: 6px 6px 0;
    border-style: solid;
    border-color: var(--ink) transparent transparent transparent;
  }

  .bus-svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  @keyframes pop {
    0% { transform: scale(0); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes shake {
    10%, 90% { transform: translate3d(-2px, -2px, 0) rotate(-2deg); }
    20%, 80% { transform: translate3d(2px, 2px, 0) rotate(2deg); }
    30%, 50%, 70% { transform: translate3d(-3px, -3px, 0) rotate(-3deg); }
    40%, 60% { transform: translate3d(3px, 3px, 0) rotate(3deg); }
  }

  /* horizontal position/opacity now come from the `progress` prop (see
     script block) so the bus's crossing is tied to actual scroll rather
     than a wall-clock loop; this keyframe only handles the idle bounce. */

  @keyframes bounce {
    0%,
    55% {
      transform: translateY(0) rotate(0deg);
    }
    62% {
      transform: translateY(-6px) rotate(-3deg);
    }
    68% {
      transform: translateY(0) rotate(2deg);
    }
    74% {
      transform: translateY(-6px) rotate(-3deg);
    }
    80% {
      transform: translateY(0) rotate(2deg);
    }
    88% {
      transform: translateY(-4px) rotate(1deg);
    }
    93%,
    100% {
      transform: translateY(0) rotate(0deg);
    }
  }
</style>
