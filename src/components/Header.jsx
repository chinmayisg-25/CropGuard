function Header() {
  return (
    <header className="top-header">
      <div>
        <p className="header-eyebrow">CROP HEALTH INTELLIGENCE</p>
        <h2>Good morning, Farmer</h2>
      </div>

      <div className="header-actions">
        <button className="icon-button" title="Notifications">
          ♢
        </button>

        <button className="language-button">
          <span>EN</span>
          <span>⌄</span>
        </button>

        <div className="profile">
          <div className="profile-avatar">F</div>

          <div className="profile-info">
            <strong>Farmer</strong>
            <span>My Farm</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;