<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AIR-Kit | Local-First Investigation</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #060816;
        --panel: #101426;
        --text: #f4f7fb;
        --muted: #97a1bb;
        --accent: #00c2a8;
        --primary: #5b4cff;
      }

      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: radial-gradient(circle at top, #11182f 0%, var(--bg) 55%);
        color: var(--text);
      }

      .page {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 32px 20px;
      }

      .hero {
        width: min(1180px, 100%);
        display: grid;
        grid-template-columns: 1.1fr 0.9fr;
        gap: 32px;
        align-items: center;
      }

      .copy {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      .pill {
        display: inline-flex;
        width: fit-content;
        border: 1px solid rgba(255,255,255,0.14);
        background: rgba(16,20,38,0.55);
        color: #74f4e2;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.24em;
        padding: 8px 12px;
        border-radius: 3px;
      }

      h1 {
        margin: 0;
        font-size: clamp(2.5rem, 5vw, 4.6rem);
        line-height: 0.95;
        letter-spacing: -0.03em;
      }

      .lede {
        margin: 0;
        max-width: 560px;
        color: var(--muted);
        font-size: 1.05rem;
        line-height: 1.75;
      }

      .actions {
        display: flex;
        gap: 12px;
        margin-top: 8px;
        flex-wrap: wrap;
      }

      .btn {
        border: 0;
        border-radius: 3px;
        padding: 12px 18px;
        cursor: pointer;
        font-weight: 600;
        letter-spacing: 0.02em;
      }

      .btn-primary {
        background: var(--primary);
        color: white;
      }

      .btn-secondary {
        background: transparent;
        color: white;
        border: 1px solid rgba(255,255,255,0.18);
      }

      .anim-card {
        position: relative;
        min-height: 480px;
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 8px;
        background: linear-gradient(145deg, rgba(16,20,38,0.98), rgba(7,10,22,0.95));
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
        overflow: hidden;
      }

      .anim-card::before {
        content: "";
        position: absolute;
        inset: 0;
        background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
        background-size: 20px 20px;
        opacity: 0.6;
        pointer-events: none;
      }

      [data-network-diagram] {
        width: 100%;
        height: 100%;
        min-height: 480px;
      }

      @media (max-width: 860px) {
        .hero {
          grid-template-columns: 1fr;
        }

        .copy {
          order: 2;
        }

        .anim-card {
          min-height: 360px;
        }
      }
    </style>
  </head>
  <body>
    <main class="page">
      <section class="hero">
        <div class="copy">
          <span class="pill">Local-first investigation engine</span>
          <h1>Investigate. Understand. Respond.</h1>
          <p class="lede">
            This lightweight landing page pulls the animated network graphic in as a standalone component through a plain JavaScript include, making it easy to reuse in other static contexts.
          </p>
          <div class="actions">
            <button class="btn btn-primary">Start Investigation</button>
            <button class="btn btn-secondary">View Documentation</button>
          </div>
        </div>

        <div class="anim-card">
          <div data-network-diagram></div>
        </div>
      </section>
    </main>

    <script src="./network-diagram.js"></script>
  </body>
</html>
