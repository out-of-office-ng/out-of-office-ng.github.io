<script>
  // Simple CSS-based ASCII art replacing the heavy canvas pixel renderer
</script>

<div class="ascii-container">
  <pre class="ascii-art">
       (
      ) )
     ( ( (
    ) ) ) )
   ( ( ( ( (
  ) ) ) ) ) )
 ( ( ( ( ( ( (
 \\|||||||////
  \\_|||_////
  </pre>
</div>

<style>
  .ascii-container {
    background-color: #243e3c; /* Dark deep green from the brand */
    border-radius: 16px;
    padding: 4rem 3rem;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  }
  .ascii-art {
    margin: 0;
    font-family: monospace;
    font-size: 1.5rem;
    line-height: 1.2;
    color: var(--chaos-yellow, #ffc72c);
    white-space: pre;
    text-align: left;
  }
</style>
