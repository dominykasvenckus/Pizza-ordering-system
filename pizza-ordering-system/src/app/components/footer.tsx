import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer footer-center p-5 bg-secondary text-secondary-content sticky top-[100vh]">
      <aside>
        <Link href="/" className="btn btn-ghost text-xl">
          Pizza ordering system
        </Link>
        <p>© 2024 Pizza ordering system</p>
      </aside>
    </footer>
  );
}
