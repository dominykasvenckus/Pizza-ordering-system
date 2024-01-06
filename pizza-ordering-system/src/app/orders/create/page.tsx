"use client";

import Footer from "@/app/components/footer";
import Header from "@/app/components/header";
import { Pizza, Size, Topping } from "@/app/types";
import { useEffect, useState } from "react";

export default function Create() {
  const [pizza, setPizza] = useState<null | Pizza>(null);
  const [sizes, setSizes] = useState<null | Size[]>(null);
  const [toppings, setToppings] = useState<null | Topping[]>(null);
  const [selectedSizeId, setSelectedSizeId] = useState(-1);
  const [selectedToppingIds, setSelectedToppingIds] = useState<number[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const handleCheckboxChange = (toppingId: number) => {
    setSelectedToppingIds((prevSelectedToppingIds) => {
      if (prevSelectedToppingIds.includes(toppingId)) {
        return prevSelectedToppingIds.filter((id) => id !== toppingId);
      } else {
        return [...prevSelectedToppingIds, toppingId];
      }
    });
  };

  const handleOrderSubmit = async () => {
    const response1 = await fetch(`/api/v1/pizzas/${pizza?.pizzaId}/order`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response1.ok) {
      setSuccessMessage("Order submitted successfully!");

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

      if (response2.status === 201) {
        const pizza: Pizza = await response2.json();
        setPizza(pizza);
        setSelectedSizeId(pizza.size.sizeId);
        const toppingIds = pizza.toppings.map((topping) => topping.toppingId);
        setSelectedToppingIds(toppingIds);
      }
    } else {
      setSuccessMessage("");
    }
  };

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
        const pizza = pizzas.find((pizza) => !pizza.orderedAt);
        if (pizza) {
          setPizza(pizza);
          setSelectedSizeId(pizza.size.sizeId);
          const toppingIds = pizza.toppings.map((topping) => topping.toppingId);
          setSelectedToppingIds(toppingIds);
        }
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const response = await fetch("/api/v1/sizes", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const sizes: Size[] = await response.json();
        sizes.sort((size1, size2) => {
          return size1.sizeId - size2.sizeId;
        });
        setSizes(sizes);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const response = await fetch("/api/v1/toppings", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const toppings: Topping[] = await response.json();
        toppings.sort((topping1, topping2) => {
          return topping1.toppingId - topping2.toppingId;
        });
        setToppings(toppings);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!pizza) {
        return;
      }

      const data: { sizeId: number; toppingIds: number[] } = {
        sizeId: selectedSizeId,
        toppingIds: selectedToppingIds,
      };

      const response = await fetch(`/api/v1/pizzas/${pizza.pizzaId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.status === 201) {
        const pizza: Pizza = await response.json();
        setPizza(pizza);
      }
    })();
  }, [selectedSizeId, selectedToppingIds]);

  return (
    <>
      <Header />
      <main className="p-5">
        <div className="flex flex-wrap gap-4">
          <div className="bg-base-200 flex-1 p-3">
            <h2 className="text-base md:text-lg font-bold text-center">
              Select size
            </h2>
            {sizes?.map((size) => (
              <div key={size.sizeId} className="form-control">
                <label className="label cursor-pointer">
                  <span className="text-sm md:text-base">{size.name}</span>
                  <input
                    type="radio"
                    name="radio"
                    className="radio radio-sm md:radio-md radio-accent"
                    onChange={() => setSelectedSizeId(size.sizeId)}
                    checked={selectedSizeId === size.sizeId}
                  />
                </label>
              </div>
            ))}
          </div>
          <div className="bg-base-200 flex-1 p-3">
            <h2 className="text-base md:text-lg font-bold text-center">
              Select toppings
            </h2>
            {toppings?.map((topping) => (
              <div key={topping.toppingId} className="form-control">
                <label className="cursor-pointer label">
                  <span className="text-sm md:text-base">{topping.name}</span>
                  <input
                    type="checkbox"
                    id={`checkbox-${topping.toppingId}`}
                    className="checkbox checkbox-sm md:checkbox-md checkbox-accent"
                    onChange={() => handleCheckboxChange(topping.toppingId)}
                    checked={selectedToppingIds.some(
                      (id) => id == topping.toppingId
                    )}
                  />
                </label>
              </div>
            ))}
          </div>
          <div className="bg-base-200 flex-1 p-3">
            <h2 className="text-base md:text-lg font-bold text-center">
              Order summary
            </h2>
            {successMessage && (
              <div
                role="alert"
                className="alert alert-success mt-2 mb-3 text-sm md:text-base"
              >
                <span>{successMessage}</span>
              </div>
            )}
            <div className="mt-2 text-sm md:text-base">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5 md:w-6 md:h-6 inline-block align-top mr-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
                />
              </svg>
              €{pizza?.orderPrice}
            </div>
            <div className="mt-2 text-sm md:text-base">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5 md:w-6 md:h-6 inline-block align-top mr-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                />
              </svg>
              {pizza?.description}
            </div>
            <div className="w-3/5 m-auto">
              <button
                className="btn btn-block btn-accent mt-5"
                onClick={handleOrderSubmit}
              >
                Submit order
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
