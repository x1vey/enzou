// Path-based router for Multipage Setup
export function initRouter(routes) {
  function handleRoute() {
    let path = window.location.pathname;
    
    // Normalize path by stripping trailing slash unless it's just '/'
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    
    // Aliases to handle raw html files if served statically without clean routes
    if (path.includes('adminpanel/git')) path = '/adminpanel/git';
    else if (path.includes('adminpanel') || path.includes('adminpannel')) path = '/adminpanel';
    else if (path.includes('services')) path = '/services';
    else if (path.includes('about')) path = '/about';
    else if (path.includes('contact')) path = '/contact';
    else if (path.includes('testimonials')) path = '/testimonials';
    else path = '/';

    const app = document.getElementById('app');
    if (!app) return;
    app.innerHTML = '';
    
    // Find matching route
    const route = routes[path] || routes['/'];
    if (route) {
      route(app);
    }
  }

  // Handle standard history popstate just in case, though full page reloads happen anyway
  window.addEventListener('popstate', handleRoute);
  handleRoute();
}

export function navigateTo(path) {
  window.location.href = path; // True multipage navigation
}
