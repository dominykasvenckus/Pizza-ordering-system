"use client";

import { useRouter } from "next/navigation";
import { Pizza } from "../types";
import Link from "next/link";

export default function Header() {
  const router = useRouter();

  const handleClick = () => {
    const elem = document.activeElement as HTMLElement;
    if (elem) {
      elem?.blur();
    }
  };

  const handleCreateOrder = async () => {
    const response1 = await fetch("/api/v1/pizzas", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    let draftExists = false;
    if (response1.ok) {
      const pizzas: Pizza[] = await response1.json();
      draftExists = pizzas.some((pizza) => !pizza.orderedAt);
    }

    if (draftExists) {
      router.push("/orders/create");
      return;
    }

    const data: { sizeId: number; toppingIds: number[] } = {
      sizeId: 3,
      toppingIds: [],
    };

    const response2 = await fetch("/api/v1/pizzas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response2.ok) {
      router.push("/orders/create");
    }
  };

  return (
    <header className="navbar bg-base-300">
      <div>
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-300 rounded-box w-52"
          >
            <li onClick={handleClick}>
              <Link href="/orders">Orders</Link>
            </li>
            <li onClick={handleClick}>
              <a role="button" onClick={handleCreateOrder}>
                Create order
              </a>
            </li>
          </ul>
        </div>
        <Link href="/" className="btn btn-ghost text-xl">
          Pizza ordering system
        </Link>
      </div>
      <div className="hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li onClick={handleClick}>
            <Link href="/orders">Orders</Link>
          </li>
          <li onClick={handleClick}>
            <a role="button" onClick={handleCreateOrder}>
              Create order
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
