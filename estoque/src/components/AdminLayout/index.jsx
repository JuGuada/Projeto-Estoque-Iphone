import Header from '../Header';
import Menu from '../Menu';

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Menu />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />

        <main style={{ padding: 24 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

