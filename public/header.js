function initHeaderNav() {
  const stored = localStorage.getItem('user');
  const navCart = document.getElementById('navCart');
  const navAuth = document.getElementById('navAuth');
  const navDashboard = document.getElementById('navDashboard');
  if (!stored) {
    if (navAuth) {
      navAuth.textContent = 'Login';
      navAuth.href = 'login.html';
    }
    return;
  }

  let user;
  try {
    user = JSON.parse(stored);
  } catch (err) {
    console.error('Invalid user JSON in localStorage', err);
    return;
  }

  if (user.role === 'admin') {
    if (navCart && navCart.parentNode) {
      navCart.parentNode.removeChild(navCart);
    }
    if (navAuth) {
      navAuth.textContent = 'Logout';
      navAuth.href = '#';
      navAuth.id = 'navLogout';
    }
    if (navDashboard) {
      const adminLinks = document.createElement('span');
      adminLinks.innerHTML = '\n      <a href="users.html">Users</a>\n      <a href="items.html">Items</a>\n      <a href="orders.html">Orders</a>\n      <a href="#" id="navLogout">Logout</a>';
      navDashboard.parentNode.insertBefore(adminLinks, navDashboard.nextSibling);
    }
    document.addEventListener('click', function (e) {
      if (e.target && (e.target.id === 'navLogout' || e.target.closest('#navLogout'))) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = 'login.html';
      }
    });
    return;
  }

  if (navAuth) {
    navAuth.textContent = 'Logout';
    navAuth.href = '#';
    navAuth.addEventListener('click', function (e) {
      e.preventDefault();
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    });
  }
}

window.initHeaderNav = initHeaderNav;
