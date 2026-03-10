// Lightweight map mount — uses a styled Google Maps iframe
// No React dependency, works cleanly with Vanilla JS + Vite
export function mountReactMap(containerId) {
  const container = document.getElementById(containerId);
  if (!container || container.dataset.mounted) return;

  container.innerHTML = `
    <div class="map-embed-wrapper" style="width:100%;height:450px;position:relative;overflow:hidden;border-top:2px solid var(--color-accent);border-bottom:2px solid var(--color-accent);">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d179261.27210137533!2d-122.7667448831911!3d45.39082260191823!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54957448d3aa0029%3A0xe67dbed0910ebd1a!2sOregon%20City%2C%20OR!5e0!3m2!1sen!2sus!4v1709849204000!5m2!1sen!2sus"
        width="100%"
        height="100%"
        style="border:0;filter:grayscale(100%) invert(90%) hue-rotate(180deg) contrast(1.2);transition:filter 0.5s ease;"
        allowfullscreen=""
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        onmouseover="this.style.filter='grayscale(0%) invert(0%) hue-rotate(0deg) contrast(1)'"
        onmouseout="this.style.filter='grayscale(100%) invert(90%) hue-rotate(180deg) contrast(1.2)'"
      ></iframe>
    </div>
  `;
  container.dataset.mounted = 'true';
}
