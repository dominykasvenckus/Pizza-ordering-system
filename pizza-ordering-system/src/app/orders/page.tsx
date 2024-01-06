"use client";

import { useEffect, useState } from "react";
import { Pizza } from "../types";
import Header from "../components/header";
import Footer from "../components/footer";

export default function Orders() {
  const [pizzas, setPizzas] = useState<null | Pizza[]>(null);

  useEffect(() => {
    (async () => {
      const response = await fetch("/api/v1/pizzas", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const pizzas: Pizza[] = await response.json();
        const orderedPizzas = pizzas.filter((pizza) => pizza.orderedAt);
        orderedPizzas.sort((pizza1, pizza2) => {
          const date1 = new Date(pizza1.orderedAt!);
          const date2 = new Date(pizza2.orderedAt!);
          if (date1 > date2) {
            return -1;
          } else if (date1 < date2) {
            return 1;
          } else {
            return 0;
          }
        });
        setPizzas(orderedPizzas);
      }
    })();
  }, []);

  return (
    <>
      <Header />
      <main className="p-5">
        {pizzas?.length === 0 && (
          <div className="text-sm md:text-base text-center">
            No orders were found
          </div>
        )}
        {pizzas?.map((pizza) => (
          <div
            key={pizza.pizzaId}
            className="card bg-primary dark:bg-neutral max-w-6xl mb-2 m-auto"
          >
            <div className="card-body">
              <h2 className="card-title text-base md:text-lg">
                {new Date(pizza.orderedAt!).toLocaleString()} · €
                {pizza.orderPrice}
              </h2>
              <p className="text-sm md:text-base">{pizza.description}</p>
            </div>
          </div>
        ))}
      </main>
      <Footer />
    </>
  );
}
